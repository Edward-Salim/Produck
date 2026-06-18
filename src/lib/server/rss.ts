import Parser from 'rss-parser';

export function createParser(): Parser {
  return new Parser({
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck RSS Reader/1.0)' },
    customFields: {
      item: [['media:content', 'media:content', { keepArray: true }], ['media:thumbnail', 'media:thumbnail', { keepArray: true }]]
    }
  });
}

/** Extract the best available image from an RSS item. Pass the full HTML content as fallback. */
export function extractImage(item: Parser.Item, articleUrl?: string | null, htmlContent?: string | null): string | null {
  const baseUrl = articleUrl ? new URL(articleUrl).origin : null;

  function resolve(src: string): string {
    if (src.startsWith('//')) return 'https:' + src;
    if (src.startsWith('/') && baseUrl) return baseUrl + src;
    return src;
  }

  // 1. enclosure (most common, parsed by default)
  if (item.enclosure?.url) {
    const url = item.enclosure.url;
    if (item.enclosure.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(url)) {
      return resolve(url);
    }
  }

  // 2. media:thumbnail array (custom field)
  const thumbs: { $?: { url?: string; width?: string } }[] =
    (item as any)['media:thumbnail'] ?? [];
  if (thumbs.length > 0) {
    const sorted = [...thumbs]
      .filter((t) => t.$?.url)
      .map((t) => ({ url: resolve(t.$!.url!), w: parseInt(t.$!.width ?? '0', 10) }));
    sorted.sort((a, b) => b.w - a.w);
    if (sorted.length > 0) return sorted[0].url;
  }

  // 3. media:content array (custom field)
  const contents: { $?: { url?: string; medium?: string; type?: string } }[] =
    (item as any)['media:content'] ?? [];
  const image = contents.find(
    (c) =>
      c.$?.url &&
      (c.$.medium === 'image' || c.$?.type?.startsWith('image/'))
  );
  if (image?.$?.url) return resolve(image.$.url);

  // 4. Parse <img> and CSS background-image from content:encoded / content HTML
  if (htmlContent) {
    // <img src="...">
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (imgMatch?.[1]) return resolve(imgMatch[1]);

    // CSS background-image: url(...)
    const bgMatch = htmlContent.match(/background-image\s*:\s*url\(["']?([^)"']+)["']?\)/i);
    if (bgMatch?.[1]) return resolve(bgMatch[1]);
  }

  // 5. itunes:image (podcast feeds)
  const itunes = (item as any).itunes;
  if (itunes?.image) return itunes.image;

  return null;
}

/** Scrape og:image from an article URL. Used as last-resort fallback for feeds that
 *  don't embed images (e.g. Yahoo Finance). Returns null if the page doesn't respond
 *  within 4 seconds or has no og:image. */
export async function scrapeOgImage(articleUrl: string): Promise<string | null> {
  // Skip known paywalled / blocked domains — scraping will never succeed
  const domain = (() => { try { return new URL(articleUrl).hostname; } catch { return ''; } })();
  const BLOCKED = [
    'wsj.com', 'finance.yahoo.com', 'stratechery.com',
    'barrons.com', 'investors.com', 'discuss.grapheneos.org',
  ];
  if (BLOCKED.some((d) => domain === d || domain.endsWith('.' + d))) return null;

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);

    const res = await fetch(articleUrl, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck/1.0)' }
    });
    clearTimeout(t);

    if (!res.ok) return null;

    // Read just enough to find og:image (first ~64 KB)
    const reader = res.body?.getReader();
    if (!reader) return null;

    let html = '';
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      // Stop once we've seen og:image or passed the head
      if (html.includes('og:image') || html.includes('</head>')) break;
      if (html.length > 65536) break;
    }
    reader.cancel();

    const match = html.match(/<meta\s+[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      ?? html.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

    if (match?.[1]) {
      let src = match[1];
      if (src.startsWith('//')) src = 'https:' + src;
      else if (src.startsWith('/')) src = new URL(articleUrl).origin + src;
      return src;
    }
    return null;
  } catch {
    return null;
  }
}

interface ArticleToScreen {
  title: string;
  category: string;
  region: string;
  sourceName: string;
}

/** Phrase blocklist per source — only matches clear off-topic patterns, not single words. */
const OFF_TOPIC_PHRASES: Record<string, string[]> = {
  'CNN Indonesia Tekno': [
    // Weather / climate
    'prakiraan cuaca', 'diguyur hujan', 'hujan lebat', 'hujan hari ini', 'hujan sabtu',
    'hujan minggu', 'hujan senin', 'berpotensi hujan', 'musim kemarau', 'puncak kemarau',
    'el nino', 'bmkg prediksi', 'bmkg ungkap', 'bmkg jelaskan',
    'fenomena bun upas', 'bediding', 'dinginkan jatim', 'apa itu awan',
    // Geology / disasters
    'guncang filipina', 'gempa m', 'gempa besar', 'megathrust', 'terumbu karang',
    'gunung meletus', 'tsunami', 'banjir bandang',
    // Astronomy / space (not tech) — 'gerhana matahari' removed, too many
    // false positives on space-tech articles mentioning eclipses
    'aurora australis', 'noctilucent', 'hujan meteor',
    // Nature / animals
    'kaki seribu raksasa', 'pohon raksasa', 'axolotl',
    'debut anak', 'hewan langka',
    // Climate general
    'kiamat iklim', 'dampak perubahan iklim', 'ekosistem laut',
    // Military hardware — scoped to incidents, not tech specs
    // Allow through if the title also mentions specs/tech details
    'helikopter as', 'drone mq-9', 'ditembak jatuh iran',
    // Sports streaming
    'siaran langsung piala', 'live streaming piala', 'nonton streaming piala',
    'cara nonton piala',
  ],
  'CNN Indonesia Ekonomi': [
    // Shopping / promos
    'full day sale', 'transmart full', 'ayo belanja', 'buruan beli', 'diskon melimpah',
    'promo mulai', 'intip barangnya',
    'shopee vip', 'gebyar diskon',
    // Transport incidents
    'layang-layang ganggu', 'perjalanan whoosh', 'mati lampu di',
    'magang jepang', 'ka stasiun', 'avsec soetta',
    // Nutrition program (MBG / Badan Gizi)
    'mbg disetop', 'mbg selama', 'badan gizi', 'bgn bakal', 'bgn setop',
    'waka bgn', 'penerima mbg', 'dapur mbg', 'makan bergizi', 'program mbg',
    // Protests / disputes
    'demo mahasiswa', 'berujung ricuh', 'aksi mahasiswa', 'digusur demi',
    'tudingan warga', 'tuntutan demo',
    // Religious / cultural
    '1 muharram', 'masjidil haram',
    // Diplomatic travel
    'kunker ke',
  ],
  'Detik Inet': [
    // Sports
    'messi hattrick', 'messi di piala', 'ronaldo', 'mbappe lampaui',
    'timnas', 'pemain bintang', 'piala dunia', 'pildun', 'hattrick',
    'top skor', 'kiper', 'suporter',
    'tahan raksasa spanyol', 'haaland', 'yamal',
    'ea sports fc',
    // Shopping / promos
    'full day sale', 'transmart full', 'diskon gede', 'diskon maksimal',
    'shopee vip', 'kulkas polytron',
    'mesin cuci sharp', 'ac split sharp', 'cuma harga segini',
    'langganan shopee',
    // Clickbait / viral
    'momen apes', 'kesialan', 'ngadi-ngadi', 'bikin yang lihat', 'tepok jidat',
    'deretan desain aneh', 'deretan desain gagal', 'penampakan',
    'tukang las', 'bendungan raksasa',
    // Entertainment / YouTube
    'youtuber pertama', 'mrbeast', 'tamagotchi',
    // Gaming / esports (tournament results, not tech)
    'kode redeem', 'fc mobile', 'mpl id', 'juara mpl', 'grand final mpl',
    'jadwal grand final', 'daftar juara',
    // Sports streaming promos
    'bundling streaming', 'live streaming pildun', 'nonton pildun', 'nonton piala dunia',
    // Nature / animals
    'hiu goblin', 'hewan aneh', 'orangutan', 'anjing hantu', 'kuburan',
    // Weather
    'el nino sudah melanda',
    // Gossip
    'mantan istri bill gates', 'pacari mantan putri', 'ayah elon musk',
    // Religious
    'kebenaran al qur',
  ],
  'Ars Technica': [
    'reader survey', 'let your voice be heard', 'tell us what you think',
    'subscribe to', 'premium subscription', 'ars pro',
  ],
  'Engadget': [
    // Gaming coverage (not tech)
    'game fest', 'games we played', 'new game', 'game review',
    'gta 5', 'gta 6', 'grand theft auto', 'rockstar',
    'nintendo', 'playstation', 'xbox', 'pc game',
    // Shopping / deals
    'prime day', 'best deal', 'on sale', 'discount',
    'cheaper than ever', 'price cut', 'buy now',
  ],
  'Wired': [
    // Promo codes / coupons
    'promo code', 'coupon code', 'coupons', '% off',
    'promo codes', 'gift cards',
    // Buying guides (product roundups, not tech reviews)
    'best handheld', 'best robot', 'best office chair', 'best laptop',
    'best mattress', 'best fan', 'best vacuum', 'best lawn',
    'need a new', 'bright ideas', 'best gifts', 'gift guide',
    'buying guide', 'things on sale', 'on sale this', 'deals on',
    'early prime day', 'prime day deal',
    // Home / lifestyle
    'home decor', 'interior design', 'throw pillow', 'area rug',
    'starter home', 'dream house', 'dumb house', 'future of home',
    'what do we need from our homes', 'what do americans spend on housing',
    'dwellings of tomorrow', 'building solutions keep things local',
    'cookware', 'recipe for', 'how to clean',
    // Entertainment
    'hockey show', 'tv show', 'movie review', 'what to watch',
    'streaming guide', 'best shows', 'on netflix', 'on hbo',
    'adult swim', 'infowars', 'reality tv', 'fishtank',
    'tim heidecker', 'paramount refused to air',
    // Non-tech science
    'new species', 'dinosaur', 'fossil', 'whale', 'shark',
    'antarctica', 'climate change innovation',
    // Sports
    'athletes', 'separating sports from politics',
    // Politics
    'reflecting pool', 'trump renovation',
  ],
  'ANTARA': [
    'pertandingan', 'liga champions', 'piala dunia', 'laga',
  ],
};

/** Tech-context words that override a blocklist match — if a title hits a blocklist
 *  phrase but also contains one of these, let it through to AI for a nuanced decision. */
const ALLOWLIST: Record<string, string[]> = {
  'CNN Indonesia Tekno': [
    'spesifikasi', 'spek', 'canggih', 'roket', 'spacex', 'teknologi',
    'ai ', 'artificial intelligence', 'software', 'hardware', 'aplikasi',
    'chip ', 'prosesor', 'data center', 'pusat data',
  ],
};

export function isObviouslyOffTopic(article: ArticleToScreen): boolean {
  const phrases = OFF_TOPIC_PHRASES[article.sourceName];
  if (!phrases) return false;
  const lower = article.title.toLowerCase();
  const matched = phrases.find((p) => lower.includes(p));
  if (!matched) return false;
  // If the title also has a tech-context word, let AI decide — not an obvious reject
  const allowWords = ALLOWLIST[article.sourceName] ?? [];
  if (allowWords.some((w) => lower.includes(w))) return false;
  return true;
}

/**
 * Use AI to filter out articles that don't match their source's category.
 * Keyword pre-filter catches obvious off-topic articles first.
 * Primary: DeepSeek. Fallback: Gemini Flash.
 * Returns only the articles deemed on-topic.
 */
export interface ScreeningStats {
  /** Per-source: total screened (past keyword filter) → articles kept */
  bySource: Map<string, { total: number; kept: number }>;
}

export async function screenArticles(articles: ArticleToScreen[]): Promise<{ kept: Set<string>; stats: ScreeningStats }> {
  const stats: ScreeningStats = { bySource: new Map() };

  if (articles.length === 0) return { kept: new Set(), stats };

  // 1) Keyword pre-filter — catch obvious mismatches without AI
  const aiQueue: ArticleToScreen[] = [];
  const kept = new Set<string>();
  for (const a of articles) {
    if (isObviouslyOffTopic(a)) {
      // Track keyword-rejected for accuracy
      const s = stats.bySource.get(a.sourceName) ?? { total: 0, kept: 0 };
      s.total++;
      stats.bySource.set(a.sourceName, s);
      continue;
    }
    if (aiQueue.length === 0 && articles.length === 1) {
      kept.add(a.title); // single article, assume on-topic
      const s = stats.bySource.get(a.sourceName) ?? { total: 0, kept: 0 };
      s.total++; s.kept++;
      stats.bySource.set(a.sourceName, s);
    } else {
      aiQueue.push(a);
    }
  }
  if (aiQueue.length === 0) return { kept, stats };

  const { env } = await import('$env/dynamic/private');

  // 2) Batch AI screening — build all batches, fire in parallel
  const BATCH_SIZE = 50;

  interface BatchResult {
    startNum: number;
    batch: ArticleToScreen[];
    rejectedNums: Set<number>;
    duplicateRejects: Set<number>;
  }

  const batchResults: BatchResult[] = [];
  for (let offset = 0; offset < aiQueue.length; offset += BATCH_SIZE) {
    const batch = aiQueue.slice(offset, offset + BATCH_SIZE);
    const startNum = offset + 1;
    batchResults.push({ startNum, batch, rejectedNums: new Set(), duplicateRejects: new Set() });
  }

  await Promise.all(
    batchResults.map(async (br) => {
      const { startNum, batch } = br;
      const articleList = batch
        .map((a, i) => `${startNum + i}. [${a.category}] ${a.title}`)
        .join('\n');

      const prompt = `Flag articles that are off-topic for a tech/business news feed.
Articles may be in English or Indonesian — judge by topic, not language. When unsure, keep.

Each article has a [category] tag. Keep articles about: software, hardware, AI, startups, cybersecurity, internet policy, science/space tech, macroeconomics, business, finance, trade, regulation, industry shifts, monetary policy, stock market, currency, GDP, inflation, trade policy, energy policy, state budget, banking.

Reject ONLY clearly off-topic:
- Entertainment: TV/movie/music reviews, celebrity gossip, streaming show commentary, sports shows, awards shows
- Sports: game results, player transfers, league news, sports betting, sports-adjacent entertainment
- Gaming/esports: tournament results, game reviews, streamer drama (game-tech/dev is ok)
- Health/medical: drug trials, disease outbreaks, hospital news, diet studies (health-tech/wearables are ok)
- Crime/courts: murder trials, arrests, sentencing, lawsuits (cybercrime/tech-regulation cases are ok)
- Lifestyle: recipes, travel tips, fashion, fitness, home decor, gardening, sex/dating advice, factory tours, industrial production documentaries
- Career puff pieces: MBA skills, soft skills rankings, "best jobs" lists, office culture fluff, magang/internship programs (labor market data and PHK/layoffs are ok)
- Real estate: housing prices, open houses, mortgage tips (proptech is ok)
- Science not tech: paleontology, marine biology, archeology, zoology (space/energy/materials science is ok)
- Local general news: city council, school board, new park, local elections, pemadaman listrik, kecelakaan, berita kriminal
- Weather, natural disasters, cuaca, gempa, banjir
- Shopping: product roundups, buying guides, gift ideas, deals, discounts, flash sales, diskon, promo belanja, kode kupon, full day sale (enterprise-tech/software roundups are ok)
- Home decor, interior design, furniture (smart home devices are ok)
- Religious content, clickbait, viral videos, human-interest fluff, zakat, wakaf, muharram, masjid
- Meta/housekeeping: reader surveys, site announcements, newsletter promos, subscription pitches, call for feedback
- Traffic accidents, power outages, transport disruptions, mati lampu
- Indonesian social programs: MBG, makan bergizi gratis, Badan Gizi Nasional (BGN), program sembako, bansos — ini program sosial, bukan ekonomi/finance

IMPORTANT for Indonesian sources: CNN Indonesia Tekno and Detik Inet are TECHNOLOGY sections — treat them like TechCrunch or The Verge. They cover gadgets, apps, internet culture, cybersecurity, AI, startups, and yes, sometimes science/space news. That is ALL on-topic. Do NOT reject Indonesian tech articles just because they cover science, internet trends, or local startups you don't recognize.

Indonesian finance sources (Detik Finance, CNN Indonesia Ekonomi, Katadata): Rupiah, IHSG, APBN, BI rate, inflation, trade, BUMN, investasi, perbankan, fintech, pajak, subsidi energi, utang negara, cadangan devisa, pertumbuhan ekonomi — these are ALL finance/economy, keep them all.

ANTARA is Indonesia's national news agency. Keep articles about: government tech policy, digital economy, regulation, state budget, infrastructure investment, trade policy, energy, BUMN. Reject only: sports scores, entertainment gossip, crime reports, local pemadaman listrik.

Only reject Indonesian articles that are clearly about: social programs (MBG/BGN/makan bergizi), shopping promos (diskon, full day sale), natural disasters (banjir, gempa), crime/kecelakaan, or entertainment/gossip.

ALSO flag near-duplicate stories. When two or more articles cover the exact same event, company announcement, product launch, or policy decision, keep only the best one and reject the duplicates. Prefer: original reporting over syndication, specialized tech/business outlets over general news wires, articles with more specific detail over vague summaries. When articles from different sources cover different angles of the same event (not true duplicates), keep both.

${articleList}

Reply with TWO lines only:
Line 1 — REJECT: comma-separated numbers of off-topic or weaker-duplicate articles to reject (or "none")
Line 2 — DUPLICATE: semicolon-separated pairs showing which article subsumes which, e.g. "${startNum+1}>${startNum+4}; ${startNum+2}>${startNum+6}" meaning article ${startNum+1} is the better version of ${startNum+4} (so reject ${startNum+4}), and ${startNum+2} is the better version of ${startNum+6} (so reject ${startNum+6}). Or "none" if no duplicates. Always put the KEEPER first in each pair, the duplicate second.

Example response:
REJECT: ${startNum+3},${startNum+8},${startNum+14}
DUPLICATE: ${startNum+1}>${startNum+4}; ${startNum+6}>${startNum+9}`;

      let text = '';
      const deepseekKey = env.DEEPSEEK_API_KEY;
      if (deepseekKey) {
        try {
          text = await callDeepSeek(prompt, deepseekKey);
        } catch (err) {
          console.error('screenArticles: DeepSeek failed:', err);
        }
      }

      if (!text) {
        const keys = (env.GEMINI_API_KEYS ?? '').split(',').filter(Boolean);
        if (keys.length > 0) {
          try {
            const { GoogleGenAI } = await import('@google/genai');
            const key = keys[Math.floor(Date.now() / 1000) % keys.length];
            const ai = new GoogleGenAI({ apiKey: key });
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { temperature: 0 }
            });
            text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          } catch (err) {
            console.error('screenArticles: Gemini failed:', err);
          }
        }
      }

      // Parse the two-line response
      if (text) {
        for (const line of text.trim().split('\n')) {
          const t = line.trim();
          if (!t) continue;

          if (t.toUpperCase().startsWith('REJECT:')) {
            const nums = t.slice(7).trim();
            if (nums.toLowerCase() !== 'none') {
              for (const n of (nums.match(/\d+/g)?.map(Number) ?? [])) br.rejectedNums.add(n);
            }
          } else if (t.toUpperCase().startsWith('DUPLICATE:')) {
            const pairs = t.slice(10).trim();
            if (pairs.toLowerCase() !== 'none') {
              for (const pair of pairs.split(';')) {
                const nums = pair.trim().match(/\d+/g)?.map(Number) ?? [];
                if (nums.length >= 2) br.duplicateRejects.add(nums[1]);
              }
            }
          }
        }
      }

      // Fallback: old format (just comma-separated numbers)
      if (br.rejectedNums.size === 0 && br.duplicateRejects.size === 0 && text && !text.toLowerCase().includes('none')) {
        for (const n of (text.match(/\d+/g)?.map(Number) ?? [])) br.rejectedNums.add(n);
      }
    })
  );

  // Accumulate results into shared state
  for (const br of batchResults) {
    const allRejected = new Set([...br.rejectedNums, ...br.duplicateRejects]);
    for (let j = 0; j < br.batch.length; j++) {
      const article = br.batch[j];
      const num = br.startNum + j;
      const s = stats.bySource.get(article.sourceName) ?? { total: 0, kept: 0 };
      s.total++;
      if (!allRejected.has(num)) {
        kept.add(article.title);
        s.kept++;
      }
      stats.bySource.set(article.sourceName, s);
    }
  }

  return { kept, stats };
}

async function callDeepSeek(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0
    })
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}: ${await res.text().catch(() => '')}`);
  const data: any = await res.json();
  const msg = data?.choices?.[0]?.message;
  // v4-flash is a reasoning model: reasoning_content is chain-of-thought,
  // content is the final answer. If content is empty (token budget exhausted),
  // return empty so the caller falls back to Gemini. Never use reasoning_content
  // as answer text — it's unstructured prose that produces garbage parses.
  return (msg?.content ?? '').trim();
}


export interface DayArticlesForSummary {
  title: string;
  sourceName: string;
  sourceCategory: string;
  sourceRegion: string;
  description: string;
}

/** Heuristic: detect when the LLM echoes planning/instructions instead of writing the briefing. */
function isInstructionEcho(text: string): boolean {
  const lower = text.toLowerCase();
  const echoMarkers = [
    'we need to',
    'from the list',
    'from the given',
    'pick one',
    'pick two',
    'pick 2',
    'let me',
    'here is',
    'here are',
    'i can',
    'i will',
    'i\'ll',
    'sure',
    'certainly',
    'global story',
    'indonesia story',
    'must be high-signal',
    'no markdown',
    'plain english',
    '2-3 sentences',
  ];
  const matchCount = echoMarkers.filter((m) => lower.includes(m)).length;
  return matchCount >= 2;
}

/** Convert **bold** markdown to <strong> tags and escape any other HTML. */
function convertBold(text: string): string {
  // First, convert **text** → <strong>text</strong>
  const withBold = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Escape any raw HTML that isn't our <strong> tags
  return withBold
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
}

/** Generate a daily tech/business briefing via DeepSeek. Covers 1 global + 1 Indonesia story. */
export async function generateDailySummary(articles: DayArticlesForSummary[]): Promise<string | null> {
  if (articles.length < 1) return null;

  const { env } = await import('$env/dynamic/private');
  const key = env.DEEPSEEK_API_KEY;
  if (!key) return null;

  const list = articles
    .map(
      (a) =>
        `- [${a.sourceCategory}] ${a.sourceName} (${a.sourceRegion}): ${a.title}\n  ${a.description || '(no description)'}`
    )
    .join('\n\n');

  const prompt = `Write a 2-sentence daily tech/business briefing. Sentence 1: the most important global or regional tech/business story today. Sentence 2: the most important Indonesia tech/business story today. Skip streaming promos, product deals, sports-adjacent fluff, and human-interest filler — only pick stories with real stakes: policy changes, major investments, industry shifts, competitive moves, regulatory actions, or meaningful product launches. If no Indonesia story clears that bar, write a second global/regional story instead. Never fabricate. Be specific with names, numbers, and stakes. Under 450 characters total. Use **double asterisks** around important names, numbers, and keywords to bold them. No preamble — output the briefing directly.

Articles:
${list}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);
    const data: any = await res.json();
    const msg = data?.choices?.[0]?.message;
    // Never use reasoning_content — it's unstructured chain-of-thought, not a briefing
    const text = (msg?.content ?? '').trim();
    if (!text) return null;
    if (isInstructionEcho(text)) {
      console.warn('generateDailySummary: discarding instruction echo:', text.slice(0, 120));
      return null;
    }
    return convertBold(text);
  } catch (err) {
    console.error('generateDailySummary failed:', err);
    return null;
  }
}
