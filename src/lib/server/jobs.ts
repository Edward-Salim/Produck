import { createParser } from './rss.js';
import type { jobSource } from './db/schema.js';
import * as cheerio from 'cheerio';

const parser = createParser();

// ── PM Keyword Matching ──────────────────────────────────────────

const PM_PATTERNS = [
  // Direct titles
  /\bproduct\s*manager\b/i,
  /\bproduct\s*management\b/i,
  /\bproduct\s*owner\b/i,
  /\bproduct\s*lead\b/i,
  /\bAPM\b/,
  // Compound "Product X Manager" — catches Product Policy Manager,
  // Product Marketing Manager, Product Operations Manager, etc.
  /\bproduct\b.+\bmanager\b/i,
  // Seniority-prefixed
  /\bhead\s+of\s+product\b/i,
  /\bassociate\s+product\s*manager\b/i,
  /\bsenior\s+product\s*manager\b/i,
  /\bgroup\s+product\s*manager\b/i,
  /\bprincipal\s+product\s*manager\b/i,
  /\bstaff\s+product\s*manager\b/i,
  /\blead\s+product\s*manager\b/i,
  /\bdirector\s+of\s+product\b/i,
  /\bdirector\s+product\s*manager\b/i,
  /\bVP\s+of\s+product\b/i,
  // Domain-specific
  /\bproduct\s+growth\b/i,
  /\bgrowth\s+product\s*manager\b/i,
  /\btechnical\s+product\s*manager\b/i,
  /\bproduct\s+operations\b/i,
  /\bproduct\s+strategy\b/i,
  /\bPM\s*[-–—]\s*/i,
  /\bproduct\s+analyst\b/i,
  // Project manager — sometimes used interchangeably with product in APAC
  /\bproject\s*manager\b/i,
  /\bproject\s*management\b/i,
  /\btechnical\s+project\s*manager\b/i,
  /\bsenior\s+project\s*manager\b/i,
];

export function isProductManagementRole(title: string): boolean {
  return PM_PATTERNS.some((p) => p.test(title));
}

// ── Experience Extraction ─────────────────────────────────────────

const NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10
};

/** Matches a digit or number word, captures just the value (no + or spaces) */
const N = '(\\d+|one|two|three|four|five|six|seven|eight|nine|ten)\\b';

function parseNumber(s: string): number {
  return NUMBER_WORDS[s.toLowerCase()] ?? parseInt(s);
}

export function extractMinExperienceYears(text: string | null): number | null {
  if (!text) return null;

  // Strip ceiling-only phrases so they don't leak into catch-all patterns.
  // "Up to N years" is a maximum, not a minimum — treat as entry-level.
  text = text.replace(/(?:up\s+to|no\s+more\s+than|as\s+many\s+as)\s+\d+\+?\s*years?(?:\s+(?:of\s+)?[\s\S]{0,60}?experience)?/gi, '');

  // "5-7 years of ... experience" → take lower bound (must go before "X+ years" to avoid
  // the latter matching the second number, e.g. "5-7 years" → 5, not 7)
  let m = text.match(new RegExp(`${N}\\s*[-–—]\\s*\\d+\\s*years?\\s+(?:of\\s+)?[\\s\\S]{0,60}?experience`, 'i'));
  if (m) return parseNumber(m[1]);

  // "5+ years of ... experience" — flexible middle
  m = text.match(new RegExp(`${N}\\+?\\s*years?\\s+(?:of\\s+)?[\\s\\S]{0,60}?experience`, 'i'));
  if (m) return parseNumber(m[1]);

  // "at least 5 years", "minimum 5 years", "more than 5 years", "no less than 5 years"
  m = text.match(new RegExp(`(?:at\\s+least|minimum(?:\\s+of)?|more\\s+than|no\\s+less\\s+than)\\s+${N}\\+?\\s*years?`, 'i'));
  if (m) return parseNumber(m[1]);

  // "5 years of ... experience", "5 years ... experience" (catch-all, after range/plus/threshold)
  m = text.match(new RegExp(`${N}\\s*years?\\s+(?:of\\s+)?[\\s\\S]{0,60}?experience`, 'i'));
  if (m) return parseNumber(m[1]);

  // "with 5+ years", "over 5 years" (without "experience" word — last resort)
  m = text.match(new RegExp(`(?:with|over)\\s+${N}\\+?\\s*years?`, 'i'));
  if (m) return parseNumber(m[1]);

  return null;
}

/** Infer minimum experience years from job title seniority. */
function inferExperienceFromTitle(title: string): number | null {
  // Highest seniority first — order matters for titles containing multiple signals
  if (/\b(?:Senior\s*VP|SVP|EVP|Executive\s*VP|First\s*VP|Managing\s*Director|MD|Head\s+of)\b/i.test(title)) return 10;
  if (/\bVP\b|\bVice\s*President\b/i.test(title)) return 7;
  if (/\bAVP\b|\bAssistant\s*VP\b|\bAssistant\s*Vice\s*President\b/i.test(title)) return 5;
  if (/\bSenior\s*(?:Officer|Analyst|Associate|Manager|Engineer|Team\s*Lea[dr])\b/i.test(title)) return 4;
  if (/\b(?:Officer|Analyst|Associate|Engineer|Team\s*Lea[dr]|Manager)\b/i.test(title)) return 2;
  if (/\b(?:Intern|Trainee|Graduate|GRIT|Apprentice|Future\s*Bankers?\s*Program)\b/i.test(title)) return 0;
  return null;
}

// ── Expiry Detection ────────────────────────────────────────────────

const SHORT_MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

function monthIndex(name: string): number | undefined {
  return SHORT_MONTHS[name.toLowerCase().slice(0, 3)];
}

/** Try to parse a date string like "11 May 2026", "May 11, 2026", "2026-05-11" */
function tryParseDate(s: string): Date | null {
  // "11 May 2026" or "11th May 2026"
  let m = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s*(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*,?\s*(\d{4})/i);
  if (m) {
    const month = monthIndex(m[2].toLowerCase());
    if (month !== undefined) return new Date(parseInt(m[3]), month, parseInt(m[1]));
  }
  // "May 11, 2026" or "May 11 2026"
  m = s.match(/(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s*,?\s*(\d{4})/i);
  if (m) {
    const month = monthIndex(m[1].toLowerCase());
    if (month !== undefined) return new Date(parseInt(m[3]), month, parseInt(m[2]));
  }
  // "2026-05-11"
  m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  return null;
}

const EXPIRY_PATTERNS = [
  // "onboard by <date>", "onboard before <date>"
  /onboard\s+(?:by|before|in)\s+(.+?)(?:\.|$|\)|\n)/i,
  // "start (by|date|in) <date>"
  /start\s+(?:by|date|in)\s*:?\s*(.+?)(?:\.|$|\)|\n)/i,
  // "commencing (in|by) <date>"
  /commenc(?:ing|es?)\s+(?:in|by)\s+(.+?)(?:\.|$|\)|\n)/i,
  // "application(s) deadline: <date>", "apply by <date>"
  /appl(?:ication|y)\s+(?:deadline|by|close[ds]?)\s*:?\s*(.+?)(?:\.|$|\)|\n)/i,
  // "from <month> to <month> <year>" — internship windows
  /from\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(?:to|until|and|–|—|-)\s+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{4})/i,
];

/**
 * Check if a job description suggests the position has expired.
 * Looks for deadline/start-date language with dates now in the past.
 */
export function appearsExpired(description: string | null, requirement?: string | null): boolean {
  const text = [description, requirement].filter(Boolean).join('\n');
  if (!text) return false;

  const now = Date.now();

  for (const pattern of EXPIRY_PATTERNS) {
    let m: RegExpExecArray | null;
    // Re-create with 'g' so exec() advances past each match
    const re = new RegExp(pattern.source, pattern.flags + 'g');
    while ((m = re.exec(text)) !== null) {
      const dateStr = m[1];
      if (!dateStr) continue;

      // Check for "from X to Y year" pattern — captures groups 1,2,3
      const fromMonth = m[2];
      const toMonth = m[3];
      const year = m[4];
      if (fromMonth && toMonth && year) {
        const endMonth = monthIndex(toMonth.toLowerCase());
        if (endMonth !== undefined) {
          const endDate = new Date(parseInt(year), endMonth + 1, 0); // last day of end month
          if (endDate.getTime() < now) return true;
        }
        continue;
      }

      const parsed = tryParseDate(dateStr.trim());
      if (parsed && parsed.getTime() < now) return true;
    }
  }

  return false;
}

// ── Language Detection ──────────────────────────────────────────────

const MANDARIN_PATTERNS = [
  /\bmandarin\b/i,
  /\bchinese\s+(?:language|speaker|speaking|proficiency|fluency)\b/i,
  /(?:fluent|proficient|proficiency)\s+in\s+(?:mandarin|chinese)\b/i,
  /\bbilingual\b.{0,20}\b(?:mandarin|chinese)\b/i,
  /\b(?:mandarin|chinese)\b.{0,20}\bbilingual\b/i,
  /(?:speak|spoken|speaking)\s+(?:mandarin|chinese)\b/i,
  /\bbahasa\s+mandarin\b/i,
  /\bchinese\s+(?:required|preferred|is\s+a\s+must)\b/i,
  /(?:able|ability)\s+to\s+(?:speak|communicate\s+in)\s+(?:mandarin|chinese)\b/i,
];

export function requiresChineseLanguage(description: string | null, requirement?: string | null): boolean {
  const text = [description, requirement].filter(Boolean).join('\n');
  if (!text) return false;
  return MANDARIN_PATTERNS.some((p) => p.test(text));
}

function normalizeRecruitType(rt: { id?: string | number; en_name?: string } | null | undefined): string | null {
  if (!rt) return null;
  const id = String(rt.id ?? '');
  if (id === '201') return 'graduate';
  if (id === '202') return 'intern';
  // '101' = regular — not surfaced in UI, treat as null
  return null;
}

const FETCH_OPTS = {
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
  signal: AbortSignal.timeout(20000)
};

// ── Types ─────────────────────────────────────────────────────────

export interface JobListingInput {
  title: string;
  url: string;
  department: string | null;
  location: string | null;
  description: string | null;
  publishedAt: Date | null;
  isPM: boolean;
  experienceYears: number | null;
  requiresChinese: boolean;
  recruitType: string | null; // 'graduate' | 'intern' | 'regular' | null
}

interface JobFetchResult {
  sourceName: string;
  listings: JobListingInput[];
  error: string | null;
}

// ── ByteDance API Fetcher ─────────────────────────────────────────
// Public API: POST https://jobs.bytedance.com/api/v1/public/supplier/search/job/posts
// No auth needed, just needs website-path and x-tt-env headers from joinbytedance.com

interface BDJobPost {
  id: string;
  code: string;
  title: string;
  description: string;
  requirement?: string;
  recruit_type?: { id: string | number; name: string; en_name: string; i18n_name: string };
  job_category?: { name: string; en_name: string };
  city_info?: {
    code: string;
    name: string;
    en_name: string;
    parent?: { name: string; en_name: string; parent?: { name: string; en_name: string } };
  };
}

async function fetchByteDance(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    // Parse query params from the URL to extract search criteria
    const urlObj = new URL(source.url);
    const keyword = urlObj.searchParams.get('keyword') ?? '';
    const locationList = urlObj.searchParams.get('location_code_list') || 'CT_169';

    // Fetch all pages
    const allPosts: BDJobPost[] = [];
    const pageSize = 100;
    let pageOffset = 0;
    let totalCount = 0;

    const fetchPage = async (off: number) => {
      const body = {
        recruitment_id_list: [],
        job_category_id_list: [],
        subject_id_list: [],
        location_code_list: locationList.split(',').filter(Boolean),
        keyword,
        limit: pageSize,
        offset: off
      };
      return fetch('https://jobs.bytedance.com/api/v1/public/supplier/search/job/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'website-path': 'en',
          'x-tt-env': 'boe_epam_api',
          'Origin': 'https://joinbytedance.com',
          'Referer': 'https://joinbytedance.com/',
          'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000)
      });
    };

    const firstRes = await fetchPage(0);
    if (!firstRes.ok) {
      return { sourceName: source.name, listings: [], error: `ByteDance API returned ${firstRes.status}` };
    }

    const firstJson = await firstRes.json();
    if (firstJson.code !== 0) {
      return { sourceName: source.name, listings: [], error: `ByteDance API error: ${firstJson.message || firstJson.code}` };
    }

    allPosts.push(...(firstJson.data?.job_post_list ?? []));
    totalCount = firstJson.data?.count ?? allPosts.length;

    // Fetch remaining pages
    const pages = [];
    for (pageOffset = pageSize; pageOffset < totalCount; pageOffset += pageSize) {
      pages.push(pageOffset);
    }

    if (pages.length > 0) {
      const remainingResults = await Promise.allSettled(
        pages.map((off) => fetchPage(off).then(r => r.ok ? r.json() : null))
      );
      for (const r of remainingResults) {
        if (r.status === 'fulfilled' && r.value?.code === 0) {
          allPosts.push(...(r.value.data?.job_post_list ?? []));
        }
      }
    }

    const posts = allPosts;

    // Filter out jobs whose descriptions indicate they've already expired
    const activePosts = posts.filter((p) => !appearsExpired(p.description, p.requirement));
    if (activePosts.length < posts.length) {
      console.log(`[ByteDance] filtered ${posts.length - activePosts.length} expired listings`);
    }

    return {
      sourceName: source.name,
      listings: activePosts.map((p) => {
          // Build location string from city_info hierarchy
          let location = '';
          const c = p.city_info;
          if (c) {
            location = [c.en_name, c.parent?.en_name, c.parent?.parent?.en_name]
              .filter((n) => n && n !== c.en_name)
              .join(', ') || c.en_name;
          }

          const reqText = p.requirement ?? '';
          const descText = p.description ?? '';
          const fullDesc = [
            descText && `### Responsibilities\n${descText}`,
            reqText && `### Qualifications\n${reqText}`
          ].filter(Boolean).join('\n\n');
          return {
            title: p.title,
            url: `https://joinbytedance.com/search/${p.id}`,
            department: p.job_category?.en_name ?? null,
            location: location || null,
            description: fullDesc?.slice(0, 20000) || null,
            publishedAt: null,
            isPM: isProductManagementRole(p.title) || p.job_category?.en_name?.toLowerCase().startsWith('product') || false,
            experienceYears: extractMinExperienceYears(reqText),
            requiresChinese: requiresChineseLanguage(descText, reqText),
            recruitType: normalizeRecruitType(p.recruit_type)
          };
        }),
      error: posts.length === 0 ? 'No listings returned' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown ByteDance API error'
    };
  }
}

// ── Static HTML Fetcher (cheerio) ─────────────────────────────────

function extractJobsFromHtml(html: string, baseUrl: string): JobListingInput[] {
  const $ = cheerio.load(html);
  const jobs: JobListingInput[] = [];
  const seen = new Set<string>();

  // JSON-LD (Google Jobs structured data)
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() || '');
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        if (item['@type'] === 'JobPosting' && item.title) {
          const url = item.url || '';
          if (seen.has(url)) continue;
          seen.add(url);
          jobs.push({
            title: item.title,
            url,
            department: item.employmentType ?? null,
            location: item.jobLocation?.name || item.jobLocation?.address?.addressLocality || null,
            description: item.description?.slice(0, 10000) ?? null,
            publishedAt: item.datePosted ? new Date(item.datePosted) : null,
            isPM: isProductManagementRole(item.title),
            experienceYears: extractMinExperienceYears(item.description),
            requiresChinese: requiresChineseLanguage(item.description, null),
            recruitType: null
          });
        }
      }
    } catch { /* skip */ }
  });
  if (jobs.length > 0) return jobs;

  // Generic: find <a> links that look like job listings
  $('a[href]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const text = $el.text().trim();
    if (!text || text.length < 5 || text.length > 200) return;
    if (/^(Home|About|Careers|Jobs|Search|Menu|Apply|Login|Sign|Back|Next|Load)/i.test(text)) return;

    let url: string;
    try { url = new URL(href, baseUrl).href; } catch { return; }
    if (!url.startsWith('http') || seen.has(url)) return;

    const parentText = $el.parent().text().slice(0, 10000);
    if (!/(?:job|position|opening|career|hiring|apply|department|location|full.time|remote|hybrid|on.site|engineering|product|design|data)/i.test(parentText)) return;

    seen.add(url);
    jobs.push({
      title: text,
      url,
      department: null,
      location: null,
      description: null,
      publishedAt: null,
      isPM: isProductManagementRole(text),
      experienceYears: null,
      requiresChinese: false,
      recruitType: null
    });
  });

  return jobs;
}

async function fetchHtml(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const res = await fetch(source.url, FETCH_OPTS);
    if (!res.ok) return { sourceName: source.name, listings: [], error: `HTTP ${res.status}` };
    const html = await res.text();
    const jobs = extractJobsFromHtml(html, source.url);
    return {
      sourceName: source.name,
      listings: jobs,
      error: jobs.length === 0 ? 'No job listings found in HTML' : null
    };
  } catch (err) {
    return { sourceName: source.name, listings: [], error: err instanceof Error ? err.message : 'Unknown fetch error' };
  }
}

// ── RSS Fetcher ───────────────────────────────────────────────────

async function fetchRssJobs(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const feed = await parser.parseURL(source.url);
    return {
      sourceName: source.name,
      listings: (feed.items ?? []).map((item) => ({
        title: item.title || 'Untitled',
        url: item.link || '',
        department: item.categories?.join(', ') ?? null,
        location: null,
        description: item.contentSnippet?.slice(0, 10000) ?? item.summary?.slice(0, 10000) ?? null,
        publishedAt: item.isoDate ? new Date(item.isoDate) : null,
        isPM: isProductManagementRole(item.title || ''),
        experienceYears: null,
        requiresChinese: requiresChineseLanguage(item.contentSnippet ?? item.summary ?? null, null),
        recruitType: null
      })).filter((j) => j.url),
      error: null
    };
  } catch (err) {
    return { sourceName: source.name, listings: [], error: err instanceof Error ? err.message : 'Unknown RSS error' };
  }
}

// ── SEA / Shopee Career Fetcher ────────────────────────────────────
// Public API: GET https://career.sea.com/api/user/job/list
// city_ids: 25=Singapore, 10=Jakarta, 13=Yogyakarta, 8=Bandung, 12=Solo, 11=Medan
// employment_ids: 1=Experienced, 2=Experienced, 3=Lead, 4=Intern

interface SEAJobPost {
  id: number;
  job_id: string;
  job_name: string;
  department_id: number;
  employment_id: number;
  region_id: number;
  city_id: number;
  job_type_id: number;
  job_description: string;
  requirements?: string;
  sub_team_description?: string;
  external_entity_id?: number;
  seamoney_job_id?: string;
}

function seaCityName(cityId: number): string {
  const map: Record<number, string> = {
    25: 'Singapore',
  };
  // Indonesian city IDs all map to "Indonesia"
  const idCities = new Set([10, 9, 8, 11, 12, 13]);
  if (idCities.has(cityId)) return 'Indonesia';
  return map[cityId] ?? `City ${cityId}`;
}

function seaDepartmentName(departmentId: number): string | null {
  const map: Record<number, string> = {
    1: 'Business Development',
    2: 'Cross Border',
    3: 'Business Intelligence',
    4: 'Finance',
    5: 'Design',
    6: 'Engineering',
    7: 'Legal',
    8: 'Marketing',
    9: 'Operations',
    10: 'People',
    11: 'Product Management',
    12: 'Graduate Program',
    100005: 'Compliance',
    100006: 'Risk Management',
    100008: 'SPX Express',
    100009: 'SPX Strategy',
    100012: 'Corporate Affairs',
    100017: 'Finance (MariBank)',
    100019: 'Customer Service',
    100020: "COO's Office",
    100023: "President's Office",
  };
  return map[departmentId] ?? null;
}

function seaRecruitType(employmentId: number): string | null {
  if (employmentId === 4) return 'intern';
  return null; // 1,2,3 are various experienced levels
}

async function fetchSea(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const urlObj = new URL(source.url);
    const cityIds = urlObj.searchParams.getAll('city_id');
    const empIds = urlObj.searchParams.getAll('employment_id');
    const limit = 200;

    // Fetch each city separately to avoid the 200-result cap.
    // SEA API pagination is broken (page > 1 repeats), so per-city
    // queries keep each result set small enough to get everything.
    const cityResults = await Promise.allSettled(
      cityIds.map(async (cityId) => {
        const params = new URLSearchParams();
        params.append('city_ids', cityId);
        empIds.forEach((e) => params.append('employment_ids', e));
        params.set('limit', String(limit));
        params.set('page', '1');

        const res = await fetch(`https://career.sea.com/api/user/job/list?${params}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
          signal: AbortSignal.timeout(20000)
        });
        if (!res.ok) return [] as SEAJobPost[];
        const json = await res.json();
        return (json.code === 0 ? (json.data?.job_list ?? []) : []) as SEAJobPost[];
      })
    );

    // Merge all city results, deduplicate by job_id
    const seen = new Set<string>();
    const allPosts: SEAJobPost[] = [];
    for (const r of cityResults) {
      if (r.status !== 'fulfilled') continue;
      for (const p of r.value) {
        if (seen.has(p.job_id)) continue;
        seen.add(p.job_id);
        allPosts.push(p);
      }
    }

    const activePosts = allPosts.filter((p) => !appearsExpired(p.job_description, null));

    return {
      sourceName: source.name,
      listings: activePosts.map((p) => {
        // Strip HTML, convert <li> to bullets
        const strip = (html: string | null | undefined) => {
          if (!html) return '';
          return html
            .replace(/<li[^>]*>/gi, '\n- ')
            .replace(/<\/li>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>/gi, '\n')
            .replace(/<\/p>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d)))
            .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        };
        const respText = strip(p.job_description);
        const reqText = strip(p.requirements);
        const fullDesc = [
          respText && `### Responsibilities\n${respText}`,
          reqText && `### Qualifications\n${reqText}`
        ].filter(Boolean).join('\n\n');
        return {
          title: p.job_name,
          url: `https://career.sea.com/position/${p.job_id}`,
          department: seaDepartmentName(p.department_id),
          location: seaCityName(p.city_id),
          description: fullDesc.slice(0, 20000) || null,
          publishedAt: null,
          isPM: isProductManagementRole(p.job_name),
          experienceYears: extractMinExperienceYears(reqText || respText),
          requiresChinese: requiresChineseLanguage(respText, reqText),
          recruitType: seaRecruitType(p.employment_id)
        };
      }),
      error: activePosts.length === 0 ? 'No listings returned' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown SEA API error'
    };
  }
}

// ── Shopee SG (ATS API) ────────────────────────────────────────────
// Public API: GET https://ats.workatsea.com/ats/api/v1/user/job/list
// Source URL format: https://careers.shopee.sg/jobs?region_id=10,11,9,8,12,13&dept_id=11&limit=50&offset=0
// region_id → city_ids param, dept_id → department_ids param

function shopeeSGCityName(cityId: number): string {
  // Same city IDs as SEA API
  return seaCityName(cityId);
}

async function fetchShopeeSG(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const urlObj = new URL(source.url);
    const regionIds = (urlObj.searchParams.get('region_id') ?? urlObj.searchParams.get('location'))?.split(',').filter(Boolean) ?? [];
    const deptIds = urlObj.searchParams.get('dept_id')?.split(',').filter(Boolean) ?? [];
    const limit = parseInt(urlObj.searchParams.get('limit') ?? '200');

    const pageSize = Math.min(limit, 200);
    const fetchPage = async (offset: number): Promise<SEAJobPost[]> => {
      const params = new URLSearchParams();
      for (const id of regionIds) params.append('city_ids', id);
      for (const id of deptIds) params.append('department_ids', id);
      params.set('limit', String(pageSize));
      params.set('offset', String(offset));

      const res = await fetch(
        `https://ats.workatsea.com/ats/api/v1/user/job/list?${params}`,
        {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
          signal: AbortSignal.timeout(20000)
        }
      );
      if (!res.ok) throw new Error(`ATS API returned ${res.status}`);
      const json = await res.json();
      if (json.code !== 0) throw new Error(`ATS API error: ${json.message || json.code}`);
      return json.data?.job_list ?? [];
    };

    // Fetch first page to get total count
    const firstParams = new URLSearchParams();
    for (const id of regionIds) firstParams.append('city_ids', id);
    for (const id of deptIds) firstParams.append('department_ids', id);
    firstParams.set('limit', String(pageSize));
    firstParams.set('offset', '0');

    const firstRes = await fetch(
      `https://ats.workatsea.com/ats/api/v1/user/job/list?${firstParams}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
        signal: AbortSignal.timeout(20000)
      }
    );
    if (!firstRes.ok) {
      return { sourceName: source.name, listings: [], error: `ATS API returned ${firstRes.status}` };
    }
    const firstJson = await firstRes.json();
    if (firstJson.code !== 0) {
      return { sourceName: source.name, listings: [], error: `ATS API error: ${firstJson.message || firstJson.code}` };
    }

    const allPosts: SEAJobPost[] = [...(firstJson.data?.job_list ?? [])];
    const totalCount: number = firstJson.data?.total_count ?? allPosts.length;

    // Fetch remaining pages in parallel
    const offsets: number[] = [];
    for (let off = pageSize; off < totalCount; off += pageSize) offsets.push(off);

    if (offsets.length > 0) {
      const remaining = await Promise.allSettled(offsets.map((off) => fetchPage(off)));
      for (const r of remaining) {
        if (r.status === 'fulfilled') allPosts.push(...r.value);
      }
    }

    const activePosts = allPosts.filter((p) => !appearsExpired(p.job_description, null));

    return {
      sourceName: source.name,
      listings: activePosts.map((p) => {
        const strip = (html: string | null | undefined) => {
          if (!html) return '';
          return html
            .replace(/<li[^>]*>/gi, '\n- ')
            .replace(/<\/li>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p>/gi, '\n')
            .replace(/<\/p>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d)))
            .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        };
        const respText = strip(p.job_description);
        const reqText = strip(p.requirements);
        const fullDesc = [
          respText && `### Responsibilities\n${respText}`,
          reqText && `### Qualifications\n${reqText}`
        ].filter(Boolean).join('\n\n');
        return {
          title: p.job_name,
          url: `https://careers.shopee.sg/job-detail/${p.job_id}/1?channel=10001`,
          department: seaDepartmentName(p.department_id),
          location: shopeeSGCityName(p.city_id),
          description: fullDesc.slice(0, 20000) || null,
          publishedAt: null,
          isPM: isProductManagementRole(p.job_name),
          experienceYears: extractMinExperienceYears(reqText || respText),
          requiresChinese: requiresChineseLanguage(respText, reqText),
          recruitType: seaRecruitType(p.employment_id)
        };
      }),
      error: activePosts.length === 0 ? 'No listings returned' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown ATS API error'
    };
  }
}

// ── Grab Careers ────────────────────────────────────────────────────
// XML feed: https://grab.careers/en/jobs/xml/?rss=true&country=...

async function fetchGrab(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const urlObj = new URL(source.url);
    // Build the XML feed URL from the page URL params
    const countryParams = urlObj.searchParams.getAll('country');
    const xmlUrl = new URL('https://grab.careers/en/jobs/xml/');
    xmlUrl.searchParams.set('rss', 'true');
    for (const c of countryParams) xmlUrl.searchParams.append('country', c);

    const res = await fetch(xmlUrl.toString(), {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) return { sourceName: source.name, listings: [], error: `HTTP ${res.status}` };

    const xml = await res.text();
    const jobs: JobListingInput[] = [];
    // Extract each <job>...</job> block
    const jobBlocks = xml.match(/<job>[\s\S]*?<\/job>/g) ?? [];

    for (const block of jobBlocks) {
      const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? '';
      const url = block.match(/<url><!\[CDATA\[(.*?)\]\]><\/url>/)?.[1] ?? '';
      const city = block.match(/<city><!\[CDATA\[(.*?)\]\]><\/city>/)?.[1] ?? '';
      const country = block.match(/<country><!\[CDATA\[(.*?)\]\]><\/country>/)?.[1] ?? '';
      const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ?? '';
      const dateStr = block.match(/<date><!\[CDATA\[(.*?)\]\]><\/date>/)?.[1] ?? '';
      const category = block.match(/<category><!\[CDATA\[(.*?)\]\]><\/category>/)?.[1] ?? '';
      const jobType = block.match(/<jobtype><!\[CDATA\[(.*?)\]\]><\/jobtype>/)?.[1] ?? '';

      if (!url) continue;

      // Detect recruit type from job type or title
      let recruitType: string | null = null;
      const jt = jobType.toLowerCase();
      if (/intern/i.test(jt) || /intern/i.test(title)) recruitType = 'intern';
      else if (/graduate|fresh grad/i.test(jt) || /graduate|fresh grad/i.test(title)) recruitType = 'graduate';

      // Convert Grab HTML description — strip boilerplate, keep role content
      let desc = description
        .replace(/<p>\s*<strong>(.*?)<\/strong>\s*<\/p>/gi, '\n### $1\n')
        .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n### $1\n')
        .replace(/<li[^>]*>/gi, '\n- ')
        .replace(/<\/li>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<p>/gi, '\n')
        .replace(/<\/p>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Drop the generic Grab boilerplate section
      desc = desc.replace(/(?:###\s*)?About Grab and Our Workplace[\s\S]*?(?=###\s*Get to Know)/, '').trim();

      jobs.push({
        title,
        url,
        department: category || null,
        location: [city, country].filter(Boolean).join(', ') || null,
        description: desc.slice(0, 20000) || null,
        publishedAt: dateStr ? new Date(dateStr) : null,
        isPM: isProductManagementRole(title),
        experienceYears: extractMinExperienceYears(desc),
        requiresChinese: requiresChineseLanguage(desc, null),
        recruitType
      });
    }

    return {
      sourceName: source.name,
      listings: jobs,
      error: jobs.length === 0 ? 'No listings found in XML feed' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown Grab fetch error'
    };
  }
}

// ── Title-based fallback ───────────────────────────────────────────

/** Catches grad/intern roles that source-specific parsing missed
 *  (e.g. SEA API has no graduate enum). */
function detectRecruitTypeFromTitle(title: string): string | null {
  if (/intern(?:ship)?/i.test(title)) return 'intern';
  if (/graduate|fresh grad|management trainee|grad program/i.test(title)) return 'graduate';
  return null;
}

// ── Workday CXS API Fetcher ───────────────────────────────────────
// Public REST API: POST https://{host}/wday/cxs/{tenant}/{siteId}/jobs
// Source URL: https://{tenant}.wdN.myworkdayjobs.com/{locale}/{siteId}/jobs?locationCountry=...

interface WDJobPosting {
  title: string;
  externalPath: string;
  locationsText: string;
  postedOn: string;
  bulletFields: string[];
}

async function fetchWorkday(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const urlObj = new URL(source.url);
    const host = urlObj.host; // e.g. dbs.wd3.myworkdayjobs.com
    const tenant = host.split('.')[0]; // e.g. "dbs"
    const pathParts = urlObj.pathname.split('/').filter(Boolean); // ["en-GB", "DBS_Careers", "jobs"]
    const siteId = pathParts.length >= 2 ? pathParts[1] : pathParts[0]; // "DBS_Careers"
    const locationIds = urlObj.searchParams.getAll('locationCountry');

    const baseUrl = `https://${host}`;
    const apiBase = `${baseUrl}/wday/cxs/${tenant}/${siteId}`;
    const listUrl = `${apiBase}/jobs`;

    // Pre-filter with searchText to reduce pages
    const pageSize = 20; // DBS Workday API max limit is 20
    const allPosts: WDJobPosting[] = [];

    const fetchPage = async (offset: number): Promise<WDJobPosting[]> => {
      const res = await fetch(listUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)'
        },
        body: JSON.stringify({ limit: pageSize, offset, searchText: '', locations: locationIds, categories: [] }),
        signal: AbortSignal.timeout(30000)
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error(`[Workday: ${source.name}] page ${offset}: HTTP ${res.status} — ${text.slice(0, 300)}`);
        throw new Error(`Workday API returned ${res.status}: ${text.slice(0, 200)}`);
      }
      const json = await res.json();
      return json.jobPostings ?? [];
    };

    // First page
    const firstPage = await fetchPage(0);
    allPosts.push(...firstPage);

    // Fetch remaining pages in parallel (max 12 pages = 600 jobs, plenty for PM filter)
    if (firstPage.length === pageSize) {
      const MAX_PAGES = 70; // 70 × 20 = 1400 jobs — covers full catalog
      const offsets = [];
      for (let off = pageSize; off < pageSize * MAX_PAGES; off += pageSize) {
        offsets.push(off);
      }

      let done = false;
      for (let i = 0; i < offsets.length && !done; i += 5) {
        const batch = offsets.slice(i, i + 5);
        const results = await Promise.allSettled(batch.map((off) => fetchPage(off)));
        for (const r of results) {
          if (r.status === 'fulfilled') {
            if (r.value.length === 0) { done = true; break; }
            allPosts.push(...r.value);
            if (r.value.length < pageSize) { done = true; break; }
          }
        }
      }
    }

    // Filter by PM title
    const pmPosts = allPosts.filter((p) => isProductManagementRole(p.title));

    // Fetch detail pages for descriptions (in parallel, with concurrency limit)
    const listings: JobListingInput[] = [];
    const CONCURRENCY = 5;

    for (let i = 0; i < pmPosts.length; i += CONCURRENCY) {
      const batch = pmPosts.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.allSettled(
        batch.map(async (p) => {
          const jobUrl = `${baseUrl}/${pathParts.slice(0, 2).join('/')}${p.externalPath}`;
          let description: string | null = null;
          let department: string | null = null;
          // Only keep jobs in Singapore or Indonesia — Workday API ignores location filter.
          // Check both locationsText and bulletFields (which often contain the country).
          const locText = p.locationsText || '';
          const combinedText = `${locText} ${(p.bulletFields || []).join(' ')}`;
          let location: string | null = null;
          // Singapore — check bulletText for country, or known SG location/office patterns
          if (/singapore/i.test(combinedText) ||
              /SGP[-_]/i.test(locText) ||
              /dbs\s*(asia|bank|marina)/i.test(locText) ||
              /(capital\s*place|city\s*hall|technology\s*centre|treasures?\s*ctr|two\s*harbour)/i.test(locText)) {
            location = `${locText}, Singapore`;
          }
          // Indonesia
          else if (/indonesia|jakarta|bandung|surabaya|medan|makassar|semarang|solo|pekanbaru|pontianak|palembang|samarinda/i.test(combinedText)) {
            location = `${locText}, Indonesia`;
          } else {
            // Not in SG or ID — skip this job
            return null;
          }
          let recruitType: string | null = null;
          let publishedAt: Date | null = null;

          // Try to fetch job page for description
          try {
            const pageRes = await fetch(jobUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
              signal: AbortSignal.timeout(10000)
            });
            if (pageRes.ok) {
              const html = await pageRes.text();

              // Extract meta description
              const metaMatch = html.match(/<meta\s+(?:name|property)="(?:description|og:description)"[^>]+content="([^"]+)"/i);
              if (metaMatch) {
                let rawDesc = metaMatch[1]
                  .replace(/&#39;/g, "'")
                  .replace(/&amp;amp;/g, '&')  // double-encoded in Workday meta
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&quot;/g, '"');
                // Convert section headers to ### format for modal display.
                // Handles both DBS and UOB description formats.
                // Order matters: specific patterns before generic ones.
                description = rawDesc
                  // UOB: strip "Company: ..." prefix boilerplate up to "Job Description"
                  .replace(/^Company:[\s\S]*?(?=\s*Job\s+Description)/i, '')
                  // OCBC: strip "WHO WE ARE: ... Your Opportunity Starts Here." boilerplate
                  .replace(/^WHO\s+WE\s+ARE:[\s\S]*?Your\s+Opportunity\s+Starts\s+Here\.\s*/i, '')
                  // Strip company-history boilerplate phrases that leak experience years.
                  // These appear in UOB's "About UOB" section and must be removed regardless
                  // of whether the main stripping regex matched.
                  .replace(/\b(?:Our\s+history\s+spans?\s+more\s+than\s+\d+\s+years?\.?\s*)/gi, '')
                  .replace(/\b(?:over\s+\d+\s+years?\s+of\s+history\.?\s*)/gi, '')
                  .replace(/\b(?:more\s+than\s+\d{2,}\s+years?\s+of\s+history)\b/gi, '')
                  .replace(/\b(?:a\s+leading\s+bank\s+(?:in\s+Asia\s+)?for\s+more\s+than\s+\d+\s+years?)\b/gi, '')
                  // UOB section headers
                  .replace(/\s*Job\s+Description\s*/i, '\n### Job Description\n')
                  .replace(/\s*Job\s+Requirements?\s*/i, '\n### Requirements\n')
                  .replace(/\s*Additional\s+Requirements\s*/i, '\n### Requirements\n')
                  // DBS section headers
                  .replace(/Business Function:?\s*/i, '\n### Business Function\n')
                  .replace(/Job\s+Purpose:?\s*/i, '\n### Job Purpose\n')
                  .replace(/Principal\s+Accountabilities:?\s*/i, '\n### Principal Accountabilities\n')
                  .replace(/Key\s+Accountabilities:?\s*/i, '\n### Key Accountabilities\n')
                  .replace(/(?:Key\s+)?Responsibilities:?\s*/i, '\n### Responsibilities\n')
                  .replace(/Required\s+Experience:?\s*/i, '\n### Required Experience\n')
                  .replace(/Education\s*(?:\/\s*)?Preferred\s+Qualifications:?\s*/i, '\n### Education & Qualifications\n')
                  .replace(/(?:Candidate\s+)?Requirements:?\s*/i, '\n### Qualifications\n')
                  // Strip metadata lines
                  .replace(/\s*Apply\s+Now\s*/i, '\n')
                  .replace(/\s*Location:?\s*/i, '\n')
                  .replace(/\s*Job:\s*.+?(?=\n|$)/i, '')
                  .replace(/\s*Schedule:\s*.+?(?=\n|$)/i, '')
                  .replace(/\s*Employee\s*Status:?\s*.+?(?=\n|$)/i, '')
                  // UOB trailer boilerplate
                  .replace(/\s*Be a Part of the UOB Family[\s\S]*$/, '')
                  .replace(/\s*Apply now and make a Difference[\s\S]*$/, '')
                  .replace(/\s*Career\s*Site:\s*UOB Career site[\s\S]*$/, '')
                  // OCBC trailer boilerplate
                  .replace(/\s*Your\s+Opportunity\s+Starts\s+Here[\s\S]*$/, '')
                  .replace(/\s*As the longest established Singapore bank[\s\S]*$/, '')
                  // DBS trailer boilerplate
                  .replace(/\n\s*We offer a competitive salary[\s\S]*$/, '')
                  .replace(/\n\s*DBS is more than a bank[\s\S]*$/, '')
                  .replace(/\n{3,}/g, '\n\n')
                  .trim();

                // For list-heavy sections, split on ". " to create bullet points
                description = description.replace(
                  /(### (?:Principal Accountabilities|Key Accountabilities|Responsibilities|Required Experience|Qualifications|Education & Qualifications)\n)([\s\S]*?)(?=\n###|\nLocation|\nJob:|\nSchedule:|\n$)/gi,
                  (_, header, body) => {
                    const items = body.split(/\.\s+(?=[A-Z])/).filter(s => s.trim());
                    if (items.length <= 1) return header + body;
                    return header + items.map(s => `- ${s.trim()}${s.endsWith('.') ? '' : '.'}`).join('\n');
                  }
                );

                // Extract "Job: X" as department (DBS format)
                const jobMatch = rawDesc.match(/Job:\s*(.+?)(?:\s*Schedule:|$)/i);
                if (jobMatch) department = jobMatch[1].trim();

                // Extract "Schedule:" for recruit type
                const schedMatch = rawDesc.match(/Schedule:\s*(.+?)(?:\s*Employee|$)/i);
                if (schedMatch) {
                  const sched = schedMatch[1].trim().toLowerCase();
                  if (sched.includes('intern')) recruitType = 'intern';
                  else if (sched.includes('graduate') || sched.includes('associate programme')) recruitType = 'graduate';
                }
              }

              // Also try JSON-LD
              const ldMatch = html.match(/<script\s+type="application\/ld\+json">([^<]+)<\/script>/i);
              if (ldMatch) {
                try {
                  const ld = JSON.parse(ldMatch[1]);
                  if (ld.description && !description) description = ld.description;
                  if (ld.employmentType && !recruitType) {
                    const et = String(ld.employmentType).toLowerCase();
                    if (et.includes('intern')) recruitType = 'intern';
                  }
                  if (ld.datePosted && !publishedAt) {
                    const dp = tryParseDate(ld.datePosted);
                    if (dp) publishedAt = dp;
                  }
                } catch { /* skip */ }
              }
            }
          } catch { /* page fetch failed, continue without description */ }

          return {
            title: p.title,
            url: jobUrl,
            department,
            location,
            description: description?.slice(0, 20000) || null,
            publishedAt,
            isPM: true,
            experienceYears: extractMinExperienceYears(description),
            requiresChinese: requiresChineseLanguage(description, null),
            recruitType
          } satisfies JobListingInput;
        })
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled' && r.value) listings.push(r.value);
      }
    }

    console.log(`[Workday: ${source.name}] ${listings.length} listings returned`);
    return {
      sourceName: source.name,
      listings,
      error: listings.length === 0 ? 'No PM listings found' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown Workday fetch error'
    };
  }
}

// ── Workable Markdown API Fetcher ─────────────────────────────────
// Public .md endpoints: /jobs.md (list) and /jobs/view/ID.md (detail)
// Source URL: https://apply.workable.com/{company}/

async function fetchWorkable(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const baseUrl = source.url.replace(/\/$/, '');
    const slug = baseUrl.split('/').pop()!; // e.g. "fundingsocieties"

    // 1. Get department list from the base /jobs.md page
    const indexRes = await fetch(`${baseUrl}/jobs.md`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
      signal: AbortSignal.timeout(15000)
    });
    if (!indexRes.ok) throw new Error(`Workable index returned ${indexRes.status}`);
    const indexMd = await indexRes.text();

    // Parse department names from the "## Departments" section
    const deptSection = indexMd.match(/## Departments\n\n([\s\S]*?)(?=\n## |\n---$)/);
    const deptNames: string[] = [];
    if (deptSection) {
      for (const line of deptSection[1].split('\n')) {
        const m = line.match(/^- (.+?) \(\d+ roles?\)/);
        if (m) deptNames.push(m[1]);
        // Sub-department: "  - Compliance & Operations (1 role)"
        const sub = line.match(/^  - (.+?) \(\d+ roles?\)/);
        if (sub) deptNames.push(sub[1]);
      }
    }

    // 2. Query each department for jobs, deduplicate by job ID
    const seen = new Set<string>();
    interface WJob {
      title: string; department: string; location: string;
      type: string; posted: string; url: string; id: string;
    }
    const allJobs: WJob[] = [];

    for (const dept of deptNames) {
      try {
        const deptRes = await fetch(`${baseUrl}/jobs.md?department=${encodeURIComponent(dept)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
          signal: AbortSignal.timeout(15000)
        });
        if (!deptRes.ok) continue;
        const md = await deptRes.text();

        // Parse markdown table rows
        // | Title | Department | Location | Type | Salary | Posted | Details |
        const rows = md.matchAll(/^\| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| (.+?) \| \[View\]\((.+?)\) \|$/gm);
        for (const r of rows) {
          const title = r[1].trim();
          const department = r[2].trim();
          const location = r[3].trim();
          const type = r[4].trim();
          const posted = r[5].trim();
          const url = r[6].trim();
          const id = url.split('/').pop()?.replace('.md', '') || url;

          if (seen.has(id) || title === 'Title') continue;
          seen.add(id);
          allJobs.push({ title, department, location, type, posted, url, id });
        }
      } catch { /* skip failed department queries */ }
    }

    // 3. PM filter
    const pmJobs = allJobs.filter((j) => isProductManagementRole(j.title));

    // 4. Fetch detail pages for descriptions (concurrency 5, like Workday)
    const listings: JobListingInput[] = [];
    const CONCURRENCY = 5;

    for (let i = 0; i < pmJobs.length; i += CONCURRENCY) {
      const batch = pmJobs.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.allSettled(
        batch.map(async (j) => {
          let description: string | null = null;

          // Location: strip workplace type "(Hybrid)", "(Remote)" etc.
          const cleanLoc = j.location.replace(/\s*\([^)]*\)\s*$/, '').trim();
          let location: string | null = null;

          // SG
          if (/singapore/i.test(cleanLoc)) {
            location = `${cleanLoc}, Singapore`;
          }
          // ID cities
          else if (/jakarta|bandung|surabaya|medan|denpasar|bali|makassar|semarang|solo|pekanbaru|pontianak|palembang|samarinda/i.test(cleanLoc)) {
            location = `${cleanLoc}, Indonesia`;
          } else {
            return null;
          }

          // Recruit type from job type
          let recruitType: string | null = null;
          const jt = j.type.toLowerCase();
          if (jt.includes('intern') || jt.includes('trainee')) recruitType = 'intern';
          else if (jt.includes('contract') || jt.includes('temporary')) recruitType = null; // still regular

          // Fetch detail .md page
          try {
            const detailRes = await fetch(`${baseUrl}${j.url}`, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
              signal: AbortSignal.timeout(10000)
            });
            if (detailRes.ok) {
              const detailMd = await detailRes.text();

              // Extract description section (between ## Description and next ##)
              const descMatch = detailMd.match(/## Description\n\n([\s\S]*?)(?=\n## [A-Z])/);
              let desc = descMatch ? descMatch[1].trim() : '';

              // Append requirements if present
              const reqMatch = detailMd.match(/## Requirements\n\n([\s\S]*?)(?=\n## [A-Z])/);
              if (reqMatch) {
                desc += '\n\n### Requirements\n\n' + reqMatch[1].trim();
              }

              // Strip company boilerplate
              desc = desc
                .replace(/\*\*Funding Societies \| Modalku\*\* is the largest[\s\S]*?(?=\n-|\n\*\*|\n\n\w)/, '')
                .replace(/\nHere at Funding Societies[\s\S]*?(?=\n\n\*\*|\n\n\w)/i, '')
                .replace(/\nInterested to know more[\s\S]*$/, '')
                .trim();

              if (desc) description = desc.slice(0, 20000);

              // Extract posted date from header line: "Posted 2026-05-26"
              const dateMatch = detailMd.match(/Posted (\d{4}-\d{2}-\d{2})/);
              const publishedAt = dateMatch ? tryParseDate(dateMatch[1]) : null;

              return {
                title: j.title,
                url: j.url.startsWith('http') ? j.url.replace(/\.md$/, '') : `${baseUrl}${j.url.replace(/\.md$/, '')}`,
                department: j.department,
                location,
                description,
                publishedAt,
                isPM: true,
                experienceYears: extractMinExperienceYears(description),
                requiresChinese: requiresChineseLanguage(description, null),
                recruitType
              } satisfies JobListingInput;
            }
          } catch { /* detail fetch failed */ }

          return {
            title: j.title,
            url: j.url.startsWith('http') ? j.url.replace(/\.md$/, '') : `${baseUrl}${j.url.replace(/\.md$/, '')}`,
            department: j.department,
            location,
            description,
            publishedAt: null,
            isPM: true,
            experienceYears: extractMinExperienceYears(description),
            requiresChinese: requiresChineseLanguage(description, null),
            recruitType
          } satisfies JobListingInput;
        })
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled' && r.value) listings.push(r.value);
      }
    }

    console.log(`[Workable: ${source.name}] ${listings.length} PM listings from ${allJobs.length} total`);
    return {
      sourceName: source.name,
      listings,
      error: listings.length === 0 && pmJobs.length > 0 ? 'PM listings filtered out (location)' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown Workable fetch error'
    };
  }
}

// ── MokaHR API Fetcher ────────────────────────────────────────────
// Public REST API behind an SPA — parse init-data for credentials.
// Source URL: https://hire-r1.mokahr.com/social-recruitment/advance/{id}

async function fetchMokaHR(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const baseUrl = new URL(source.url).origin;
    const pathMatch = source.url.match(/\/advance\/(\d+)/);
    if (!pathMatch) throw new Error('MokaHR URL must contain /advance/{id}');
    const siteId = pathMatch[1];

    // 1. Fetch page HTML to extract orgId from init-data
    const pageRes = await fetch(source.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
      signal: AbortSignal.timeout(15000)
    });
    if (!pageRes.ok) throw new Error(`MokaHR page returned ${pageRes.status}`);
    const html = await pageRes.text();

    const initMatch = html.match(/id="init-data"[^>]+value="([^"]+)"/);
    if (!initMatch) throw new Error('Could not find init-data on MokaHR page');
    const initData = JSON.parse(initMatch[1].replace(/&quot;/g, '"'));
    const orgId = initData.org?.id;
    if (!orgId) throw new Error('Could not extract orgId from init-data');

    const apiBase = `${baseUrl}/api/outer/ats-apply/website`;

    // 2. Fetch all jobs for SG and ID locations
    const allJobs: { id: string; title: string; deptId: number; description: string; commitment: string; createdAt: string }[] = [];

    for (const loc of ['Singapore', 'Indonesia']) {
      let page = 1;
      while (true) {
        const listRes = await fetch(`${apiBase}/jobs/v2`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
          body: JSON.stringify({ siteId, orgId, locale: 'en-US', page, pageSize: 50, location: [loc] }),
          signal: AbortSignal.timeout(15000)
        });
        if (!listRes.ok) break;
        const listJson = await listRes.json();
        if (listJson.code !== 0) break;
        const jobs = listJson.data?.jobs ?? [];
        for (const j of jobs) {
          allJobs.push({
            id: j.id,
            title: j.title,
            deptId: j.deptId,
            description: j.jobDescription || '',
            commitment: j.commitment || '',
            createdAt: j.createdAt || ''
          });
        }
        if (jobs.length < 50) break;
        page++;
      }
    }

    // Deduplicate by job ID
    const seen = new Set<string>();
    const unique = allJobs.filter((j) => { if (seen.has(j.id)) return false; seen.add(j.id); return true; });

    // 3. PM filter
    const pmJobs = unique.filter((j) => isProductManagementRole(j.title));

    // 4. Fetch detail for location and department (concurrency 5)
    const listings: JobListingInput[] = [];
    const CONCURRENCY = 5;

    for (let i = 0; i < pmJobs.length; i += CONCURRENCY) {
      const batch = pmJobs.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.allSettled(
        batch.map(async (j) => {
          let location: string | null = null;
          let department: string | null = null;

          try {
            const detailRes = await fetch(`${apiBase}/job`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
              body: JSON.stringify({ siteId, orgId, locale: 'en-US', jobId: j.id }),
              signal: AbortSignal.timeout(10000)
            });
            if (detailRes.ok) {
              const detailJson = await detailRes.json();
              if (detailJson.code === 0 && detailJson.data) {
                const d = detailJson.data;

                // Location from customFields.Office
                const office = d.customFields?.['100004130']?.value || '';
                if (office.startsWith('SG-') || /singapore/i.test(office)) {
                  location = `${office.replace('SG-', '')}, Singapore`;
                } else if (office.startsWith('ID-') || /jakarta|bandung|surabaya|indonesia/i.test(office)) {
                  location = `${office.replace('ID-', '')}, Indonesia`;
                } else {
                  return null; // not SG/ID
                }

                // Department from departments array
                const depts = d.departments || [];
                if (depts.length > 0) {
                  department = depts[depts.length - 1].name.split('/').pop() || depts[0].name;
                }

                // Parse HTML description
                let desc = d.jobDescription || '';
                if (desc) {
                  desc = cheerio.load(desc).text()
                    .replace(/\s{3,}/g, '\n')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim();
                }

                // Recruit type from commitment
                let recruitType: string | null = null;
                const comm = (d.commitment || '').toLowerCase();
                if (comm.includes('实习') || comm.includes('intern')) recruitType = 'intern';

                // publishedAt from createdAt
                const publishedAt = d.createdAt ? tryParseDate(d.createdAt) : null;

                return {
                  title: j.title,
                  url: `${source.url.replace(/\/$/, '')}?jobId=${j.id}`,
                  department,
                  location,
                  description: desc.slice(0, 20000),
                  publishedAt,
                  isPM: true,
                  experienceYears: extractMinExperienceYears(desc),
                  requiresChinese: requiresChineseLanguage(desc, null),
                  recruitType
                } satisfies JobListingInput;
              }
            }
          } catch { /* detail fetch failed */ }

          return null;
        })
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled' && r.value) listings.push(r.value);
      }
    }

    console.log(`[MokaHR: ${source.name}] ${listings.length} PM listings from ${unique.length} total`);
    return {
      sourceName: source.name,
      listings,
      error: listings.length === 0 && pmJobs.length > 0 ? 'PM listings filtered out (location)' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown MokaHR fetch error'
    };
  }
}

// ── Oracle HCM Fetcher ────────────────────────────────────────────
// Individual job pages at /job/{id}/ have OG meta tags.
// Discover job IDs by scanning, then fetch detail pages.

async function fetchOracle(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const urlObj = new URL(source.url);
    const base = `${urlObj.protocol}//${urlObj.host}`;
    const siteMatch = urlObj.pathname.match(/\/sites\/([^/]+)/);
    if (!siteMatch) throw new Error('Oracle URL must contain /sites/{siteNumber}');
    const siteNumber = siteMatch[1]; // e.g. CX_1001

    // 1. Query the finder API to get the actual open job count.
    // This lets us calibrate how many IDs to keep — newer IDs = newer jobs.
    let expectedCount = 500; // fallback
    try {
      const finderRes = await fetch(
        `${base}/hcmRestApi/resources/11.13.18.05/recruitingCEJobRequisitions?onlyData=true&finder=findReqs;siteNumber=${siteNumber}&limit=1`,
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' }, signal: AbortSignal.timeout(10000) }
      );
      if (finderRes.ok) {
        const finderJson = await finderRes.json();
        expectedCount = finderJson.items?.[0]?.TotalJobsCount ?? expectedCount;
      }
    } catch { /* keep fallback */ }

    // 2. Discover all valid job IDs by scanning the full range.
    // Oracle IDs are roughly sequential — higher = newer. Closed jobs keep
    // serving detail pages (the tombstone message is JS-rendered, invisible here).
    const jobBase = `${base}/hcmUI/CandidateExperience/en/sites/${siteNumber}/job`;
    const allDiscovered: { id: number; title: string }[] = [];
    const BATCH = 20;
    const CONSECUTIVE_MISSES = 30;

    let probeId = 1000;
    let consecutiveMisses = 0;

    while (consecutiveMisses < CONSECUTIVE_MISSES && probeId < 20000) {
      const ids = Array.from({ length: BATCH }, (_, i) => probeId + i);
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`${jobBase}/${id}/`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
            signal: AbortSignal.timeout(5000)
          }).then(async (r) => {
            if (!r.ok) return null;
            const html = await r.text();
            if (/no longer available|position (has been|is) (filled|closed)/i.test(html)) return null;
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
            return titleMatch ? { id, title: titleMatch[1].replace(/&amp;/g, '&') } : null;
          }).catch(() => null)
        )
      );
      let batchMisses = 0;
      for (const r of results) {
        if (r.status === 'fulfilled' && r.value) {
          allDiscovered.push(r.value);
          batchMisses = 0;
        } else {
          batchMisses++;
        }
      }
      if (batchMisses >= BATCH) { consecutiveMisses += batchMisses; }
      else { consecutiveMisses = 0; }
      probeId += BATCH;
    }

    // 3. Sort by ID descending, PM filter, then fetch detail API to verify
    // each job is still open (ExternalPostedEndDate). The detail API returns
    // full data including posting dates — no more guessing.
    allDiscovered.sort((a, b) => b.id - a.id);
    const pmJobs = allDiscovered.filter((j) => isProductManagementRole(j.title));

    const detailApiBase = `${base}/hcmRestApi/resources/11.13.18.05/recruitingCEJobRequisitionDetails`;
    const detailHeaders = {
      'Content-Type': 'application/vnd.oracle.adf.resourceitem+json',
      'ora-irc-language': 'en',
      'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)'
    };

    const listings: JobListingInput[] = [];
    const CONCURRENCY = 5;
    const now = new Date();

    for (let i = 0; i < pmJobs.length; i += CONCURRENCY) {
      const batch = pmJobs.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.allSettled(
        batch.map(async (j) => {
          try {
            const detailUrl = `${detailApiBase}?expand=all&onlyData=true&finder=ById;Id=${j.id},siteNumber=${siteNumber}`;
            const detailRes = await fetch(detailUrl, {
              headers: detailHeaders,
              signal: AbortSignal.timeout(10000)
            });
            if (!detailRes.ok) return null;
            const detailJson = await detailRes.json();
            const item = detailJson.items?.[0];
            if (!item) return null;

            // Filter out expired jobs
            const endDate = item.ExternalPostedEndDate;
            if (endDate && new Date(endDate) < now) return null;

            // Description from the rich HTML field
            let description: string | null = null;
            if (item.ExternalDescriptionStr) {
              description = cheerio.load(item.ExternalDescriptionStr).text()
                .replace(/\s{3,}/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            }

            // Location — all OCBC ID jobs are Indonesia
            const location = 'Indonesia';

            // Recruit type from JobSchedule or Title
            let recruitType: string | null = null;
            if (/intern/i.test(item.Title || '')) recruitType = 'intern';
            else if (/intern/i.test(item.JobSchedule || '')) recruitType = 'intern';

            // Published date
            const publishedAt = item.ExternalPostedStartDate
              ? tryParseDate(item.ExternalPostedStartDate) : null;

            return {
              title: item.Title || j.title,
              url: `${jobBase}/${j.id}/`,
              department: item.Category || null,
              location,
              description: description?.slice(0, 20000) || null,
              publishedAt,
              isPM: true,
              experienceYears: extractMinExperienceYears(description),
              requiresChinese: requiresChineseLanguage(description, null),
              recruitType
            } satisfies JobListingInput;
          } catch { return null; }
        })
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled' && r.value) listings.push(r.value);
      }
    }

    console.log(`[Oracle: ${source.name}] ${listings.length} PM listings from ${allDiscovered.length} discovered (${pmJobs.length} PM, ${expectedCount} expected open)`);
    return {
      sourceName: source.name,
      listings,
      error: null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown Oracle fetch error'
    };
  }
}

// ── Lever API Fetcher ─────────────────────────────────────────────
// Public REST API: GET https://api.lever.co/v0/postings/{company}?mode=json
// Source URL: https://jobs.lever.co/{company} or https://api.lever.co/v0/postings/{company}

async function fetchLever(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    // Extract company slug from URL
    const slugMatch = source.url.match(/lever\.co\/([^/\s?]+)/) ||
                     source.url.match(/api\.lever\.co\/v0\/postings\/([^/\s?]+)/);
    if (!slugMatch) throw new Error('Lever URL must contain company slug');
    const company = slugMatch[1];

    const apiUrl = `https://api.lever.co/v0/postings/${company}?mode=json`;
    const res = await fetch(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) throw new Error(`Lever API returned ${res.status}`);
    const allJobs = await res.json();

    // PM filter
    const pmJobs = allJobs.filter((j: any) => isProductManagementRole(j.text));

    // Map to listings
    const listings: JobListingInput[] = [];

    for (const j of pmJobs) {
      const country = (j.country || '').toUpperCase();
      const loc = j.categories?.location || '';

      // Location: only keep SG and ID
      let location: string | null = null;
      if (country === 'SG' || /singapore/i.test(loc)) {
        location = `${loc}, Singapore`;
      } else if (country === 'ID' || /indonesia|jakarta|bandung|surabaya|medan|bali/i.test(loc)) {
        location = `${loc}, Indonesia`;
      } else {
        continue; // skip other countries
      }

      // Build description from plain text + lists
      let desc = j.descriptionPlain || '';
      if (j.lists) {
        for (const list of j.lists) {
          desc += `\n\n### ${list.text}\n\n${cheerio.load(list.content || '').text().trim()}`;
        }
      }
      // Strip company boilerplate
      desc = desc
        .replace(/About GoTo Group[\s\S]*?(?=\n\n###|\n\nAbout the Role|\n\n$)/, '')
        .replace(/About Gojek[\s\S]*?(?=\n\n###|\n\nAbout the Role|\n\n$)/, '')
        .replace(/About GoTo Financial[\s\S]*?(?=\n\n###|\n\nAbout the Role|\n\n$)/, '')
        .replace(/GoTo and its business units[\s\S]*$/, '')
        .trim();

      // Recruit type from commitment
      let recruitType: string | null = null;
      const commitment = (j.categories?.commitment || '').toLowerCase();
      if (commitment.includes('intern')) recruitType = 'intern';
      else if (commitment.includes('contract')) recruitType = null;

      listings.push({
        title: j.text,
        url: j.hostedUrl || `https://jobs.lever.co/${company}/${j.id}`,
        department: j.categories?.department || null,
        location,
        description: desc.slice(0, 20000),
        publishedAt: j.createdAt ? new Date(j.createdAt) : null,
        isPM: true,
        experienceYears: extractMinExperienceYears(desc),
        requiresChinese: requiresChineseLanguage(desc, null),
        recruitType
      });
    }

    console.log(`[Lever: ${source.name}] ${listings.length} PM listings from ${allJobs.length} total`);
    return {
      sourceName: source.name,
      listings,
      error: listings.length === 0 && pmJobs.length > 0 ? 'PM listings filtered out (location)' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown Lever fetch error'
    };
  }
}

// ── Catapa Careerpage API Fetcher ─────────────────────────────────
// Public REST API: GET https://api-apps.catapa.com/careerpage/{company}/jobs
// Source URL: https://career.catapa.com/{company}/jobs

async function fetchCatapa(source: typeof jobSource.$inferSelect): Promise<JobFetchResult> {
  try {
    const slugMatch = source.url.match(/career\.catapa\.com\/([^/]+)/);
    if (!slugMatch) throw new Error('Catapa URL must contain company slug');
    const company = slugMatch[1];

    // Paginate through all pages
    const allJobs: any[] = [];
    let page = 0;
    while (true) {
      const apiUrl = `https://api-apps.catapa.com/careerpage/${company}/jobs?page=${page}&size=50`;
      const res = await fetch(apiUrl, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0 (compatible; Produck Job Board/1.0)' },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) throw new Error(`Catapa API returned ${res.status}`);
      const data = await res.json();
      const jobs = data.content ?? [];
      allJobs.push(...jobs);
      if (data.last || jobs.length === 0) break;
      page++;
    }

    // PM filter
    const pmJobs = allJobs.filter((j: any) => isProductManagementRole(j.jobTitle?.name ?? ''));

    const listings: JobListingInput[] = [];
    for (const j of pmJobs) {
      // Location from nested city/state/country or fallback
      const city = j.location?.city?.name || j.location?.name || '';
      const country = j.location?.city?.state?.country?.name || 'Indonesia';
      const location = city ? `${city}, ${country}` : `${j.location?.name || 'Jakarta'}, ${country}`;

      // Build description from jobDetail — convert HTML to readable plain text
      const htmlToText = (html: string): string => {
        const $ = cheerio.load(html);
        $('li').each((i, el) => {
          const parent = $(el).parent();
          const prefix = parent.is('ol') ? `${i + 1}. ` : '- ';
          $(el).prepend(prefix).append('\n');
        });
        $('br').replaceWith('\n');
        $('p,div,ol,ul,section').each((_, el) => { $(el).append('\n'); });
        $('strong,b').each((_, el) => { $(el).prepend('**').append('**'); });
        return $.text().replace(/\n{3,}/g, '\n\n').trim();
      };

      let desc = '';
      if (j.jobDetail?.description) {
        desc += htmlToText(j.jobDetail.description);
      }
      if (j.jobDetail?.requirement) {
        desc += '\n\n' + htmlToText(j.jobDetail.requirement);
      }
      if (j.jobDetail?.benefit) {
        desc += '\n\n' + htmlToText(j.jobDetail.benefit);
      }

      // Recruit type from jobType
      let recruitType: string | null = null;
      if (/intern/i.test(j.jobType || '')) recruitType = 'intern';

      // Department from titleDescription (format: "[Type | Department | ...]")
      let department: string | null = null;
      const tdMatch = (j.titleDescription || '').match(/\[[^|]+\|\s*([^|\]]+)/);
      if (tdMatch) department = tdMatch[1].trim();

      listings.push({
        title: j.jobTitle?.name || j.code || '',
        url: `https://career.catapa.com/${company}/${j.id}`,
        department,
        location,
        description: desc.slice(0, 20000),
        publishedAt: j.createdDate ? new Date(j.createdDate) : null,
        isPM: true,
        experienceYears: extractMinExperienceYears(desc),
        requiresChinese: requiresChineseLanguage(desc, null),
        recruitType
      });
    }

    console.log(`[Catapa: ${source.name}] ${listings.length} PM listings from ${allJobs.length} total`);
    return {
      sourceName: source.name,
      listings,
      error: listings.length === 0 && pmJobs.length > 0 ? 'PM listings filtered out (location)' : null
    };
  } catch (err) {
    return {
      sourceName: source.name,
      listings: [],
      error: err instanceof Error ? err.message : 'Unknown Catapa fetch error'
    };
  }
}

// ── Dispatcher ────────────────────────────────────────────────────

export async function fetchJobsFromSource(
  source: typeof jobSource.$inferSelect
): Promise<JobFetchResult> {
  let result: JobFetchResult;
  switch (source.type) {
    case 'bytedance':
      result = await fetchByteDance(source);
      break;
    case 'rss':
      result = await fetchRssJobs(source);
      break;
    case 'sea':
      result = await fetchSea(source);
      break;
    case 'sea-sg':
      result = await fetchShopeeSG(source);
      break;
    case 'grab':
      result = await fetchGrab(source);
      break;
    case 'workday':
      result = await fetchWorkday(source);
      break;
    case 'workable':
      result = await fetchWorkable(source);
      break;
    case 'mokahr':
      result = await fetchMokaHR(source);
      break;
    case 'oracle':
      result = await fetchOracle(source);
      break;
    case 'lever':
      result = await fetchLever(source);
      break;
    case 'catapa':
      result = await fetchCatapa(source);
      break;
    case 'html':
    default:
      result = await fetchHtml(source);
      break;
  }

  // Title-based fallbacks — catch what source-specific parsing missed
  for (const listing of result.listings) {
    if (!listing.recruitType) {
      listing.recruitType = detectRecruitTypeFromTitle(listing.title);
    }
    if (listing.experienceYears == null) {
      listing.experienceYears = inferExperienceFromTitle(listing.title);
    }
  }

  const emoji = result.listings.length === 0 ? '⚠️' : '✅';
  console.log(`${emoji} [${source.name}] ${result.listings.length} PM listings${result.error ? ' — ' + result.error : ''}`);

  return result;
}

export function staleCutoff(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}
