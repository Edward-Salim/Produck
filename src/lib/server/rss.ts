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
export function extractImage(item: Parser.Item, htmlContent?: string | null): string | null {
  // 1. enclosure (most common, parsed by default)
  if (item.enclosure?.url) {
    const url = item.enclosure.url;
    if (item.enclosure.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/i.test(url)) {
      return url;
    }
  }

  // 2. media:thumbnail array (custom field)
  const thumbs: { $?: { url?: string; width?: string } }[] =
    (item as any)['media:thumbnail'] ?? [];
  if (thumbs.length > 0) {
    const sorted = [...thumbs]
      .filter((t) => t.$?.url)
      .map((t) => ({ url: t.$!.url!, w: parseInt(t.$!.width ?? '0', 10) }));
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
  if (image?.$?.url) return image.$.url;

  // 4. Parse <img> from content:encoded / content HTML (most blog feeds use this)
  if (htmlContent) {
    const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (match?.[1]) {
      let src = match[1];
      // Convert protocol-relative URLs to https
      if (src.startsWith('//')) src = 'https:' + src;
      return src;
    }
  }

  // 5. itunes:image (podcast feeds)
  const itunes = (item as any).itunes;
  if (itunes?.image) return itunes.image;

  return null;
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
    'prakiraan cuaca', 'diguyur hujan', 'hujan lebat', 'hujan hari ini', 'hujan sabtu',
    'hujan minggu', 'hujan senin', 'berpotensi hujan', 'musim kemarau', 'puncak kemarau',
    'el nino', 'bmkg prediksi', 'bmkg ungkap', 'bmkg jelaskan',
    'guncang filipina', 'gempa m', 'megathrust', 'terumbu karang',
    'fenomena bun upas', 'hujan meteor', 'panda', 'kaki seribu raksasa',
    'debut anak', 'kiamat iklim', 'dampak perubahan iklim', 'ekosistem laut',
  ],
  'CNN Indonesia Ekonomi': [
    'full day sale', 'transmart full', 'ayo belanja', 'buruan beli', 'diskon melimpah',
    'promo mulai', 'mau set', 'intip barangnya', 'boyong',
    'layang-layang ganggu', 'perjalanan whoosh', 'mati lampu di',
    'magang jepang', 'ka stasiun', 'avsec soetta',
    'shopee vip', 'gebyar diskon', 'bgn bakal', 'bgn setop', 'waka bgn', 'modal rp',
  ],
  'Detik Inet': [
    'messi hattrick', 'messi di piala', 'ronaldo', 'mbappe lampaui',
    'hiu goblin', 'hewan aneh', 'timnas',
  ],
  'ANTARA': [
    ' vs ', 'pertandingan', 'liga champions', 'piala dunia', 'laga',
  ],
};

function isObviouslyOffTopic(article: ArticleToScreen): boolean {
  const phrases = OFF_TOPIC_PHRASES[article.sourceName];
  if (!phrases) return false;
  const lower = article.title.toLowerCase();
  return phrases.some((p) => lower.includes(p));
}

/**
 * Use AI to filter out articles that don't match their source's category.
 * Keyword pre-filter catches obvious off-topic articles first.
 * Primary: DeepSeek. Fallback: Gemini Flash.
 * Returns only the articles deemed on-topic.
 */
export async function screenArticles(articles: ArticleToScreen[]): Promise<Set<string>> {
  if (articles.length === 0) return new Set();

  // 1) Keyword pre-filter — catch obvious mismatches without AI
  const aiQueue: ArticleToScreen[] = [];
  const keep = new Set<string>();
  for (const a of articles) {
    if (isObviouslyOffTopic(a)) continue; // silently drop
    if (aiQueue.length === 0 && articles.length === 1) {
      keep.add(a.title); // single article, assume on-topic
    } else {
      aiQueue.push(a);
    }
  }
  if (aiQueue.length === 0) return keep;

  const { env } = await import('$env/dynamic/private');
  const articleList = aiQueue
    .map((a, i) => `${i + 1}. [${a.category}] ${a.title}`)
    .join('\n');

  const prompt = `Screen these articles for a [category] RSS feed. Keep only articles that fit their category tag. Reject clearly off-topic ones (wrong subject, clickbait, fluff).

${articleList}

Reply with just the numbers to KEEP, comma-separated. Example: "1,3,5". If none, reply "none".`;

  // 1) Try DeepSeek first (fast, cheap, no free-tier RPM throttling)
  const deepseekKey = env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    try {
      const text = await callDeepSeek(prompt, deepseekKey);
      if (text) return new Set([...keep, ...parseScreeningResponse(text, aiQueue)]);
    } catch (err) {
      console.error('screenArticles: DeepSeek failed, falling back to Gemini:', err);
    }
  }

  // 2) Fall back to Gemini
  const keys = (env.GEMINI_API_KEYS ?? '').split(',').filter(Boolean);
  if (keys.length > 0) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const key = keys[Math.floor(Date.now() / 1000) % keys.length];
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 200, temperature: 0 }
      });
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return parseScreeningResponse(text, aiQueue);
    } catch (err) {
      console.error('screenArticles: Gemini also failed, allowing all articles through:', err);
    }
  }

  // 3) No keys or all failed — allow all aiQueue + keyword pre-filtered keepers
  return new Set([...keep, ...aiQueue.map((a) => a.title)]);
}

async function callDeepSeek(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0
    })
  });
  if (!res.ok) throw new Error(`DeepSeek API ${res.status}: ${await res.text().catch(() => '')}`);
  const data: any = await res.json();
  const msg = data?.choices?.[0]?.message;
  // v4-flash is a reasoning model that evaluates each article in reasoning_content,
  // then outputs the final answer in content. If content is empty (token budget exhausted),
  // fall back to reasoning_content and look for the answer.
  const raw = msg?.content || msg?.reasoning_content || '';
  // The answer is typically a comma-separated list of numbers. Find the last line
  // that looks like one (pure digits, commas, spaces).
  const lines = raw.trim().split('\n');
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (/^[\d,\s]+$/.test(line) && /\d/.test(line)) return line;
  }
  // Fallback: try extracting from the last non-empty line
  return lines.findLast((l: string) => l.trim())?.trim() ?? '';
}

function parseScreeningResponse(text: string, articles: ArticleToScreen[]): Set<string> {
  if (!text || text.toLowerCase().includes('none')) return new Set();
  const indices = text.match(/\d+/g)?.map(Number) ?? [];
  const keep = new Set<string>();
  for (const idx of indices) {
    const article = articles[idx - 1];
    if (article) keep.add(article.title);
  }
  return keep;
}

export interface DayArticlesForSummary {
  title: string;
  sourceName: string;
  category: string;
}

/** Generate a 1-2 sentence summary of the day's top stories via DeepSeek. */
export async function generateDailySummary(articles: DayArticlesForSummary[]): Promise<string | null> {
  if (articles.length < 3) return null;

  const { env } = await import('$env/dynamic/private');
  const key = env.DEEPSEEK_API_KEY;
  if (!key) return null;

  const list = articles.map((a) => `- [${a.category}] ${a.sourceName}: ${a.title}`).join('\n');

  const prompt = `You write a daily tech/business briefing. Cover 1 big global story AND 1 important Indonesia story. Write exactly 2 sentences. Pick only the most important stories. Connect them if there's a theme. Skip filler, weather, sports, and ads. Be specific — name names, numbers, stakes. Under 250 characters. No markdown.

Articles:
${list}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3
      })
    });
    if (!res.ok) throw new Error(`DeepSeek API ${res.status}`);
    const data: any = await res.json();
    const msg = data?.choices?.[0]?.message;
    const raw = msg?.content || msg?.reasoning_content || '';
    return raw.trim() || null;
  } catch (err) {
    console.error('generateDailySummary failed:', err);
    return null;
  }
}
