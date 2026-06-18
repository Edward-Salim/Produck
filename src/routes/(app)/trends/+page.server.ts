import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle, trendSummary } from '$lib/server/db/schema.js';
import { eq, and, desc, isNull, lt, inArray, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import { createParser, extractImage, scrapeOgImage, screenArticles, generateDailySummary, isObviouslyOffTopic, type ScreeningStats } from '$lib/server/rss.js';

const parser = createParser();

async function fetchFeeds(sources: typeof rssSource.$inferSelect[]) {
  const enabled = sources.filter((r) => r.enabled);
  if (enabled.length === 0) return { totalFetched: 0 };

  const existingUrls = new Set(
    (await db.select({ url: rssArticle.url }).from(rssArticle)).map((a) => a.url)
  );

  // Fetch all feeds in parallel
  const results = await Promise.allSettled(
    enabled.map((source) =>
      parser.parseURL(source.url).then((feed) => ({
        source,
        items: (feed.items || []).filter(
          (item) => item.link && !existingUrls.has(item.link)
        )
      }))
    )
  );

  // Collect all new items for batch insert
  const toInsert: (typeof rssArticle.$inferInsert)[] = [];
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const { source, items } = result.value;
    for (const item of items) {
      if (!item.link || existingUrls.has(item.link)) continue;
      const htmlContent = item['content:encoded'] || item.content || item.summary || null;
      toInsert.push({
        sourceId: source.id,
        title: item.title || 'Untitled',
        url: item.link,
        description: cleanDescription(item.contentSnippet || item.summary),
        author: item.creator || item.author || null,
        imageUrl: extractImage(item, item.link, htmlContent),
        publishedAt: item.isoDate ? new Date(item.isoDate) : null
      });
      existingUrls.add(item.link);
    }
  }

  // Keyword pre-filter: mark obviously off-topic articles as rejected at insert time.
  // This prevents trash (promo codes, sports, etc.) from ever appearing to users.
  // AI screening below catches the nuanced cases that survive the keyword pass.
  const sourceMap = new Map(enabled.map((s) => [s.id, { category: s.category, region: s.region, sourceName: s.name }]));
  const keywordStats = new Map<string, { total: number; kept: number }>();
  for (const item of toInsert) {
    const src = sourceMap.get(item.sourceId!);
    if (src && isObviouslyOffTopic({ title: item.title!, ...src })) {
      item.rejected = true;
      const ks = keywordStats.get(src.sourceName) ?? { total: 0, kept: 0 };
      ks.total++;
      keywordStats.set(src.sourceName, ks);
    }
  }
  // Immediately update accuracy for keyword rejects so the sources dialog is current
  if (keywordStats.size > 0) {
    await updateSourceAccuracy({ bySource: keywordStats });
  }

  // Batch insert all new articles immediately
  if (toInsert.length > 0) {
    const inserted = await db.insert(rssArticle).values(toInsert).returning({ id: rssArticle.id, url: rssArticle.url });

    // AI screen only the keyword-passing articles — fire-and-forget to avoid timeout
    const aiQueue = toInsert.filter((a) => !a.rejected);
    if (aiQueue.length > 0) {
      const articlesToScreen = aiQueue.map((a) => ({ title: a.title!, ...sourceMap.get(a.sourceId!)! }));
      void screenArticles(articlesToScreen).then(({ kept: keepTitles, stats }) => {
        updateSourceAccuracy(stats);
        const keepUrls = new Set<string>();
        for (const item of aiQueue) {
          if (keepTitles.has(item.title!)) keepUrls.add(item.url!);
        }
        const rejectUrls = inserted.filter((r) => !keepUrls.has(r.url)).map((r) => r.url);
        if (rejectUrls.length > 0) {
          return db.update(rssArticle).set({ rejected: true }).where(inArray(rssArticle.url, rejectUrls));
        }
      }).catch((err) => console.error('Background screening failed:', err));
    }
  }

  // Prune articles older than last week (keep this week + last week only).
  // Use WIB explicitly so the Monday cutoff is correct regardless of server timezone.
  const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const dayOfWeek = nowWib.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const lastWeekMonday = new Date(Date.UTC(
    nowWib.getUTCFullYear(),
    nowWib.getUTCMonth(),
    nowWib.getUTCDate() + mondayOffset - 7
  ));
  const cutoff = lastWeekMonday.toISOString();
  await db.delete(rssArticle).where(
    lt(sql`COALESCE(${rssArticle.publishedAt}, ${rssArticle.fetchedAt})`, cutoff)
  );

  return { totalFetched: toInsert.length };
}

/** Backfill missing imageUrl for articles. Extracts <img> from description
 *  instantly (regex), then scrapes og:image from article pages in parallel. */
async function backfillImages() {
  const orphaned = await db
    .select({ id: rssArticle.id, description: rssArticle.description, url: rssArticle.url })
    .from(rssArticle)
    .where(and(isNull(rssArticle.imageUrl), eq(rssArticle.rejected, false)))
    .orderBy(desc(rssArticle.id))
    .limit(20);

  const needScrape: typeof orphaned = [];
  for (const row of orphaned) {
    const baseUrl = row.url ? (() => { try { return new URL(row.url).origin; } catch { return null; } })() : null;
    const resolve = (src: string) => {
      if (src.startsWith('//')) return 'https:' + src;
      if (src.startsWith('/') && baseUrl) return baseUrl + src;
      return src;
    };
    const html = row.description;
    if (html) {
      const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch?.[1]) {
        await db.update(rssArticle).set({ imageUrl: resolve(imgMatch[1]) }).where(eq(rssArticle.id, row.id));
        continue;
      }
      const bgMatch = html.match(/background-image\s*:\s*url\(["']?([^)"']+)["']?\)/i);
      if (bgMatch?.[1]) {
        await db.update(rssArticle).set({ imageUrl: resolve(bgMatch[1]) }).where(eq(rssArticle.id, row.id));
        continue;
      }
    }
    if (row.url) needScrape.push(row);
  }

  if (needScrape.length > 0) {
    await Promise.allSettled(
      needScrape.map(async (row) => {
        const ogImage = await scrapeOgImage(row.url!);
        if (ogImage) {
          await db.update(rssArticle).set({ imageUrl: ogImage }).where(eq(rssArticle.id, row.id));
        }
      })
    );
  }
}

export const load: PageServerLoad = async ({ cookies }) => {
  // RSS is profile-level, not workspace-scoped — load all sources
  const sources = await db.select().from(rssSource).orderBy(rssSource.region, rssSource.category, rssSource.name);

  // Fetch fresh articles — with a 10-minute cooldown to keep page loads fast
  const lastFetched = await db
    .select({ at: rssArticle.fetchedAt })
    .from(rssArticle)
    .orderBy(desc(rssArticle.fetchedAt))
    .limit(1);
  const cooldownMs = 10 * 60 * 1000; // 10 minutes
  const shouldFetch = !lastFetched[0] || (Date.now() - lastFetched[0].at.getTime()) > cooldownMs;
  if (sources.length > 0 && shouldFetch) {
    await fetchFeeds(sources);
  }

  // Backfill missing article images (fire-and-forget, runs every page load)
  if (sources.length > 0) {
    void backfillImages().catch((err) => console.error('backfillImages failed:', err));
  }

  // Get articles for this week + last week
  const articles = await db
    .select({
      id: rssArticle.id,
      title: rssArticle.title,
      url: rssArticle.url,
      description: rssArticle.description,
      author: rssArticle.author,
      imageUrl: rssArticle.imageUrl,
      publishedAt: rssArticle.publishedAt,
      fetchedAt: rssArticle.fetchedAt,
      sourceName: rssSource.name,
      sourceUrl: rssSource.url,
      sourceCategory: rssSource.category,
      sourceRegion: rssSource.region
    })
    .from(rssArticle)
    .innerJoin(rssSource, eq(rssArticle.sourceId, rssSource.id))
    .where(eq(rssArticle.rejected, false))
    .orderBy(desc(rssArticle.publishedAt));

  // Deduplicate by URL — keep the most-recently-published row per URL
  const seenUrls = new Set<string>();
  const dedupedArticles = articles.filter((a) => {
    if (seenUrls.has(a.url)) return false;
    seenUrls.add(a.url);
    return true;
  });

  const summaries = await db.select().from(trendSummary).orderBy(desc(trendSummary.date)).limit(30);

  function sourceDomain(url: string): string {
    try { return new URL(url).hostname; } catch { return ''; }
  }

  // Normalize to plain primitives: Date → ISO string, null → '' for optional text fields.
  // This ensures devalue serializes identically for SSR and client hydration.
  const flatArticles = dedupedArticles.map((a) => ({
    id: a.id,
    title: decodeEntities(a.title),
    url: a.url,
    description: decodeEntities(stripHtml(a.description ?? '')),
    author: a.author ?? '',
    imageUrl: a.imageUrl ?? '',
    publishedAt: a.publishedAt?.toISOString() ?? null,
    fetchedAt: a.fetchedAt.toISOString(),
    sourceName: a.sourceName,
    sourceDomain: sourceDomain(a.sourceUrl),
    sourceCategory: a.sourceCategory,
    sourceRegion: a.sourceRegion
  }));

  // Group articles by WIB date so local date keys match the client's week navigation
  function toWibDateKey(iso: string | null, fallback: string): string {
    const d = new Date(iso ?? fallback);
    const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000); // UTC+7
    return wib.toISOString().slice(0, 10);
  }

  const groupMap = new Map<string, typeof flatArticles>();
  for (const article of flatArticles) {
    const key = toWibDateKey(article.publishedAt, article.fetchedAt);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(article);
  }

  // Summary map keyed by date+window so morning and evening coexist
  const summaryByDateWindow = new Map<string, { morning?: string; evening?: string }>();
  for (const s of summaries) {
    const entry = summaryByDateWindow.get(s.date) ?? {};
    entry[s.window] = s.summary ?? undefined;
    summaryByDateWindow.set(s.date, entry);
  }

  const todayKey = (() => {
    const wib = new Date(Date.now() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 10);
  })();
  const workspaceId =
    Number(cookies.get('active_workspace') || '0') || sources[0]?.workspaceId || 0;

  const dayGroups = Array.from(groupMap, ([dateKey, arts]) => ({
    dateKey,
    label: formatDayLabel(dateKey),
    count: arts.length,
    summary: summaryByDateWindow.get(dateKey)?.evening ?? summaryByDateWindow.get(dateKey)?.morning ?? null,
    articles: arts
  })).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  // Generate missing summaries — morning at 8 AM WIB, evening at 6 PM WIB.
  // Past dates are backfilled up to MAX_PAST_BACKFILL per page load.
  const nowWibHour = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCHours();
  const MORNING_HOUR = 8;   // 8 AM WIB
  const EVENING_HOUR = 18;  // 6 PM WIB
  const MAX_PAST_BACKFILL = 3;
  let pastBackfilled = 0;
  for (const g of dayGroups) {
    if (g.articles.length === 0) continue;
    const entry = summaryByDateWindow.get(g.dateKey) ?? {};
    const isToday = g.dateKey === todayKey;
    const isPast = g.dateKey < todayKey;

    // Morning: only for today, if missing and past 8 AM WIB (fire-and-forget)
    if (isToday && !entry.morning && nowWibHour >= MORNING_HOUR) {
      const arts = [...g.articles];
      void generateDailySummary(arts).then(async (text) => {
        if (text) {
          await db.insert(trendSummary).values({
            workspaceId, date: g.dateKey, window: 'morning',
            summary: text, articleCount: g.count, generatedAt: new Date()
          });
        }
      }).catch((err) => console.error('generateDailySummary (morning) failed for ' + g.dateKey + ':', err));
    }

    // Evening: for today if past 6 PM WIB, or for one past date per load (fire-and-forget)
    const needsEvening = (isToday && nowWibHour >= EVENING_HOUR)
      || (isPast && pastBackfilled < MAX_PAST_BACKFILL && !entry.morning && !entry.evening);
    if (!entry.evening && needsEvening) {
      if (isPast) pastBackfilled++;
      const arts = [...g.articles];
      void generateDailySummary(arts).then(async (text) => {
        if (text) {
          await db.insert(trendSummary).values({
            workspaceId, date: g.dateKey, window: 'evening',
            summary: text, articleCount: g.count, generatedAt: new Date()
          });
        }
      }).catch((err) => console.error('generateDailySummary (evening) failed for ' + g.dateKey + ':', err));
    }
  }

  if (!accuracySeeded) await seedAccuracyFromDb();

  const sourcesWithDomain = sources.map((s) => ({
    ...s,
    domain: sourceDomain(s.url),
    accuracy: sourceAccuracy(s.name)
  })).sort((a, b) => b.accuracy - a.accuracy);

  const dayBlocks = dayGroups.map((g) => ({
    dateKey: g.dateKey,
    label: g.label,
    dayName: new Date(g.dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
    count: g.count,
    hasBriefing: g.summary != null,
    html: renderDayBlock(g)
  }));

  // Map of dateKey → { label, summary } for days that have a briefing
  const briefings: Record<string, { label: string; summary: string }> = {};
  for (const g of dayGroups) {
    if (g.summary) {
      const entry = summaryByDateWindow.get(g.dateKey);
      const isToday = g.dateKey === todayKey;
      let label: string;
      if (isToday) {
        label = entry?.evening ? 'Evening' : 'Morning';
      } else {
        label = g.label;
      }
      briefings[g.dateKey] = { label, summary: g.summary };
    }
  }

  return { sources: sourcesWithDomain, workspaceId, articles: flatArticles, dayBlocks, briefings };
};

// ── Feed HTML renderer ──────────────────────────────────────────────
// Pre-renders the article feed as an HTML string so the client can use
// {@html} to avoid a Svelte 5 hydration bug with nested {#each} blocks.

const CALENDAR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 text-cork-400 md:size-4"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/></svg>';

const IMAGE_OFF_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-cork-300"><line x1="2" y1="2" x2="22" y2="22"/><path d="M10.41 10.41a2 2 0 1 1 2.83 2.83"/><line x1="13.5" y1="13.5" x2="6" y2="21"/><line x1="18" y1="12" x2="21" y2="15"/><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&hellip;/g, '…');
}

// ── Rolling accuracy tracking ────────────────────────────────────────
// In-memory cache seeded from DB on first load, updated after each screening
// run and persisted to rss_source.total_screened / total_kept.

const rollingAccuracy = new Map<string, { total: number; kept: number }>();
let accuracySeeded = false;

async function seedAccuracyFromDb() {
  const rows = await db.select({ name: rssSource.name, totalScreened: rssSource.totalScreened, totalKept: rssSource.totalKept }).from(rssSource);
  for (const r of rows) {
    if (r.totalScreened > 0) {
      rollingAccuracy.set(r.name, { total: r.totalScreened, kept: r.totalKept });
    }
  }
  accuracySeeded = true;
}

async function updateSourceAccuracy(stats: ScreeningStats) {
  for (const [name, s] of stats.bySource) {
    const entry = rollingAccuracy.get(name) ?? { total: 0, kept: 0 };
    entry.total += s.total;
    entry.kept += s.kept;
    rollingAccuracy.set(name, entry);
  }
  // Persist to DB
  for (const [name, s] of stats.bySource) {
    await db.update(rssSource)
      .set({ totalScreened: sql`total_screened + ${s.total}`, totalKept: sql`total_kept + ${s.kept}` })
      .where(eq(rssSource.name, name));
  }
}

/** Category-accuracy per source, computed from cumulative screening results.
 *  Falls back to hardcoded defaults for sources not yet screened. */
function sourceAccuracy(name: string): number {
  const rolling = rollingAccuracy.get(name);
  if (rolling && rolling.total >= 5) {
    return Math.round((rolling.kept / rolling.total) * 100);
  }
  // Fallback defaults for first load before any screening data
  const fallback: Record<string, number> = {
    'TechCrunch': 100, 'The Verge': 100, 'Hacker News': 95, 'Rest of World': 95,
    'RISE by DailySocial': 95, 'CNBC': 100, 'WSJ': 100, 'Yahoo Finance': 95,
    'Detik Finance': 95, 'EFF Deeplinks': 100, 'Intercom Blog': 100,
    "Lenny's Newsletter": 100, 'Stratechery': 100, 'Policy | TechCrunch': 95,
    'Ars Technica': 100, 'Wired': 95, 'MIT Technology Review': 100,
    'Techmeme': 95, 'Engadget': 95, 'Bloomberg Technology': 100,
    'MarketWatch': 90, 'Katadata': 90,
    'Detik Inet': 80,
    'CNN Indonesia Tekno': 50,
    'CNN Indonesia Ekonomi': 40,
    'ANTARA': 90,
  };
  return fallback[name] ?? 85;
}

function cleanDescription(text: string | null | undefined): string | null {
  if (!text) return null;
  // Product Hunt puts "Discussion | Link" as the description
  if (/^Discussion\s*[|]\s*Link\s*$/i.test(text.trim())) return null;
  // Hacker News via hnrss puts metadata lines (Article URL:, Comments URL:, Points:, # Comments:)
  if (/^(Article URL:|Comments URL:|Points:|# Comments:)/m.test(text)) return null;
  // Too short to be useful
  if (text.trim().length < 15) return null;
  // DailySocial puts "Dear subscriber," as the only description text
  if (/^Dear subscriber,?\s*$/i.test(text.trim())) return null;
  return text;
}

function esc(s: string): string {
  const decoded = decodeEntities(s);
  return decoded
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDayLabel(dateKey: string): string {
  const d = new Date(dateKey + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface DayGroup {
  dateKey: string;
  label: string;
  count: number;
  summary: string | null;
  articles: {
    id: number;
    title: string;
    url: string;
    description: string;
    author: string;
    imageUrl: string;
    sourceName: string;
    sourceDomain: string;
    sourceCategory: string;
    sourceRegion: string;
    publishedAt: string | null;
  }[];
}

function renderDayBlock(group: DayGroup): string {
  let h = '';
  h += `<div class="overflow-hidden rounded-xl border border-cork-200 bg-white/80 mb-5">`;
  h += `<div class="flex items-center justify-between border-b border-cork-200 bg-cork-50 px-3 py-2 md:px-5 md:py-3">`;
  h += `<div class="flex items-center gap-1.5 md:gap-2">${CALENDAR_SVG}<span class="text-xs font-semibold text-cork-700 md:text-sm">${esc(group.label)}</span></div>`;
h += `<span class="text-[10px] font-medium text-cork-400">${group.count} article${group.count !== 1 ? 's' : ''}<span class="screening-dot ml-1 inline-block size-1.5 rounded-full bg-amber-500 align-middle" style="display:none"></span></span>`;
  h += '</div>';

  h += '<div class="divide-y divide-cork-100">';
  for (const a of group.articles) {
    h += `<div data-article-id="${a.id}" class="block cursor-pointer px-3 py-2 transition-colors hover:bg-cork-50/50 md:px-5 md:py-2.5">`;
    h += '<div class="flex items-start gap-3">';
    if (a.imageUrl) {
      h += `<img src="${esc(a.imageUrl)}" alt="" class="mt-0.5 h-16 w-24 shrink-0 rounded-lg object-cover" loading="lazy" />`;
    } else {
      h += `<div class="mt-0.5 flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-cork-100/50">${IMAGE_OFF_SVG}</div>`;
    }
    h += '<div class="min-w-0 flex-1">';
    h += `<p class="text-sm leading-snug font-medium text-cork-800 line-clamp-3">${esc(a.title)}</p>`;
    h += '<div class="mt-1.5 flex items-center gap-1">';
    if (a.sourceDomain) {
      h += `<img src="https://www.google.com/s2/favicons?domain=${esc(a.sourceDomain)}&sz=32" alt="" class="size-3.5 rounded-sm" onerror="this.remove()" />`;
    }
    h += `<span class="text-[10px] font-medium text-cork-400">${esc(a.sourceName)} / ${esc(a.sourceCategory)}</span>`;
    if (a.publishedAt) {
      const [hh, mm] = a.publishedAt.slice(11, 16).split(':').map(Number);
      const wib = String((hh + 7) % 24).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
      h += `<span class="text-[10px] text-cork-300">· ${wib}</span>`;
    }
    h += '</div>';
    h += '</div></div>';
    h += '</div>';
  }
  h += '</div></div>';
  return h;
}
