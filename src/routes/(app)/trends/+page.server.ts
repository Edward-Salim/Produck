import { db } from '$lib/server/db/index.js';
import { rssSource, rssArticle, trendSummary } from '$lib/server/db/schema.js';
import { eq, desc, isNull, lt, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';
import { createParser, extractImage, screenArticles, generateDailySummary } from '$lib/server/rss.js';

const parser = createParser();

async function fetchFeeds(sources: typeof rssSource.$inferSelect[]) {
  const enabled = sources.filter((r) => r.enabled);
  if (enabled.length === 0) return { totalFetched: 0, newIds: [] };

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
        imageUrl: extractImage(item, htmlContent),
        publishedAt: item.isoDate ? new Date(item.isoDate) : null
      });
      existingUrls.add(item.link);
    }
  }

  // Batch insert all new articles immediately
  let newIds: number[] = [];
  if (toInsert.length > 0) {
    const inserted = await db.insert(rssArticle).values(toInsert).returning({ id: rssArticle.id, url: rssArticle.url });

    // Screen synchronously: run Gemini to filter off-topic articles before page renders
    const sourceMap = new Map(enabled.map((s) => [s.id, { category: s.category, region: s.region, sourceName: s.name }]));
    const keepTitles = await screenArticles(
      toInsert.map((a) => ({ title: a.title!, ...sourceMap.get(a.sourceId!)! }))
    );

    const keepUrls = new Set<string>();
    for (const item of toInsert) {
      if (keepTitles.has(item.title!)) keepUrls.add(item.url!);
    }

    const deleteUrls = inserted.filter((r) => !keepUrls.has(r.url)).map((r) => r.url);
    if (deleteUrls.length > 0) {
      await db.delete(rssArticle).where(inArray(rssArticle.url, deleteUrls));
    }

    newIds = inserted.filter((r) => keepUrls.has(r.url)).map((r) => r.id);
  }

  // Backfill imageUrl from description for articles missing images
  const orphaned = await db
    .select({ id: rssArticle.id, description: rssArticle.description })
    .from(rssArticle)
    .where(isNull(rssArticle.imageUrl))
    .limit(100);
  for (const row of orphaned) {
    const html = row.description;
    if (!html) continue;
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (match?.[1]) {
      let src = match[1];
      if (src.startsWith('//')) src = 'https:' + src;
      await db.update(rssArticle).set({ imageUrl: src }).where(eq(rssArticle.id, row.id));
    }
  }

  // Prune articles older than 14 days
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  await db.delete(rssArticle).where(lt(rssArticle.fetchedAt, cutoff));

  return { totalFetched: toInsert.length, newIds };
}

export const load: PageServerLoad = async ({ cookies }) => {
  // RSS is profile-level, not workspace-scoped — load all sources
  const sources = await db.select().from(rssSource).orderBy(rssSource.region, rssSource.category, rssSource.name);

  // Fetch fresh articles on every page load
  let newArticleIds: number[] = [];
  if (sources.length > 0) {
    const result = await fetchFeeds(sources);
    newArticleIds = result.newIds;
  }

  // Get recent articles with source info (last 200)
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
    .orderBy(desc(rssArticle.publishedAt))
    .limit(200);

  const summaries = await db.select().from(trendSummary).orderBy(desc(trendSummary.date)).limit(30);

  function sourceDomain(url: string): string {
    try { return new URL(url).hostname; } catch { return ''; }
  }

  // Normalize to plain primitives: Date → ISO string, null → '' for optional text fields.
  // This ensures devalue serializes identically for SSR and client hydration.
  const flatArticles = articles.map((a) => ({
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

  // Group articles by date, compute day labels server-side so toLocaleDateString
  // runs only in Node.js (avoids Intl discrepancies with the browser).
  const groupMap = new Map<string, typeof flatArticles>();
  for (const article of flatArticles) {
    const key = (article.publishedAt ?? article.fetchedAt).slice(0, 10);
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(article);
  }

  const summaryMap = new Map(summaries.map((s) => [s.date, s.summary]));
  const todayKey = new Date().toISOString().slice(0, 10);

  const dayGroups = Array.from(groupMap, ([dateKey, arts]) => ({
    dateKey,
    label: formatDayLabel(dateKey),
    count: arts.length,
    summary: summaryMap.get(dateKey) ?? null,
    articles: arts
  })).sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  // Generate missing daily summaries (only once per day, after 8 AM WIB / 1 AM UTC)
  const nowUtcHour = new Date().getUTCHours();
  const refreshHour = 1; // 8 AM WIB
  for (const g of dayGroups) {
    if (g.summary != null) continue;
    if (g.dateKey === todayKey && nowUtcHour < refreshHour) continue; // wait until refresh hour
    try {
      const text = await generateDailySummary(g.articles);
      if (text) {
        await db.insert(trendSummary).values({
          workspaceId,
          date: g.dateKey,
          summary: text,
          articleCount: g.count,
          generatedAt: new Date()
        });
        g.summary = text;
      }
    } catch (err) { console.error('generateDailySummary failed for ' + g.dateKey + ':', err); }
  }

  const sourcesWithDomain = sources.map((s) => ({
    ...s,
    domain: sourceDomain(s.url),
    accuracy: sourceAccuracy(s.name)
  })).sort((a, b) => b.accuracy - a.accuracy);

  const workspaceId =
    Number(cookies.get('active_workspace') || '0') || sources[0]?.workspaceId || 0;

  const dayBlocks = dayGroups.map((g) => ({
    dateKey: g.dateKey,
    label: g.label,
    dayName: new Date(g.dateKey + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
    count: g.count,
    hasBriefing: g.summary != null,
    html: renderDayBlock(g, g.summary != null)
  }));

  // Map of dateKey → { label, summary } for days that have one
  const briefings: Record<string, { label: string; summary: string }> = {};
  for (const g of dayGroups) {
    if (g.summary) {
      const isToday = g.dateKey === todayKey;
      const label = isToday ? '08:00' : g.label;
      briefings[g.dateKey] = { label, summary: g.summary };
    }
  }

  return { sources: sourcesWithDomain, workspaceId, articles: flatArticles, dayBlocks, briefings, newArticleIds };
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

/** Rough category-accuracy per source, based on observed screening results. */
function sourceAccuracy(name: string): number {
  const map: Record<string, number> = {
    // Dedicated feeds — almost never off-topic
    'TechCrunch': 100, 'The Verge': 100, 'Hacker News': 95, 'Rest of World': 95,
    'RISE by DailySocial': 95, 'CNBC': 100, 'WSJ': 100, 'Yahoo Finance': 95,
    'Detik Finance': 95, 'EFF Deeplinks': 100, 'Intercom Blog': 100,
    "Lenny's Newsletter": 100, 'Stratechery': 100, 'Policy | TechCrunch': 95,
    // Mostly on-topic but occasionally drifts
    'Detik Inet': 80,
    // Broad feeds — lots of off-topic content mixed in
    'CNN Indonesia Tekno': 50,
    'CNN Indonesia Ekonomi': 40,
    // Improved after URL change from terkini → politik
    'ANTARA': 90,
  };
  return map[name] ?? 85;
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

function renderDayBlock(group: DayGroup, hasSummary = true): string {
  let h = '';
  const borderClass = hasSummary ? 'border-cork-200' : 'border-amber-300';
  const bgClass = hasSummary ? 'bg-cork-50' : 'bg-amber-50/50';
  h += `<div class="overflow-hidden rounded-xl border ${borderClass} bg-white/80 mb-5">`;
  h += `<div class="flex items-center justify-between border-b ${borderClass} ${bgClass} px-3 py-2 md:px-5 md:py-3">`;
  h += `<div class="flex items-center gap-1.5 md:gap-2">${CALENDAR_SVG}<span class="text-xs font-semibold text-cork-700 md:text-sm">${esc(group.label)}</span></div>`;
h += `<span class="text-[10px] font-medium text-cork-400">${group.count} article${group.count !== 1 ? 's' : ''}</span>`;
  h += '</div>';

  const rowTint = hasSummary ? '' : ' bg-amber-50/30';
  h += '<div class="divide-y divide-cork-100">';
  for (const a of group.articles) {
    h += `<div data-article-id="${a.id}" class="block cursor-pointer px-3 py-2 transition-colors hover:bg-cork-50/50 md:px-5 md:py-2.5${rowTint}">`;
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
