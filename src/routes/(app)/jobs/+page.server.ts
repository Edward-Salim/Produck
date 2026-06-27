import { db } from '$lib/server/db/index.js';
import { jobSource, jobListing } from '$lib/server/db/schema.js';
import { eq, desc, lt, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';

// Seed default sources on first visit if table is empty
const DEFAULT_SOURCES = [
  {
    name: 'ByteDance',
    url: 'https://joinbytedance.com/search?keyword=&location_code_list=CT_169,MDCY00007928,CT_163&limit=50&offset=0',
    type: 'bytedance',
    region: 'sea'
  },
  {
    name: 'SEA (Shopee)',
    url: 'https://career.sea.com/jobs?city_id=25&city_id=10&city_id=13&city_id=8&city_id=12&city_id=11&city_id=9&employment_id=1&employment_id=2&employment_id=3&employment_id=4',
    type: 'sea',
    region: 'sea'
  },
  {
    name: 'Shopee SG',
    url: 'https://careers.shopee.sg/jobs?region_id=25,10,9,8,11,12,13&limit=200&offset=0',
    type: 'sea-sg',
    region: 'sea'
  },
  {
    name: 'Monee',
    url: 'https://careers.monee.com/jobs?location=10,13,25&limit=200&offset=0',
    type: 'sea-sg',
    region: 'sea'
  },
  {
    name: 'Grab',
    url: 'https://grab.careers/en/jobs/?search=&country=Indonesia&country=Singapore&pagesize=20',
    type: 'grab',
    region: 'sea'
  },
  {
    name: 'DBS',
    url: 'https://dbs.wd3.myworkdayjobs.com/en-GB/DBS_Careers/jobs?locationCountry=80938777cac5440fab50d729f9634969&locationCountry=b31234dbcdda4da9ba8fa073c5944e36',
    type: 'workday',
    region: 'sea'
  },
  {
    name: 'UOB',
    url: 'https://uobgroup.wd3.myworkdayjobs.com/UOBExternal?locationCountry=80938777cac5440fab50d729f9634969&locationCountry=b31234dbcdda4da9ba8fa073c5944e36',
    type: 'workday',
    region: 'sea'
  },
  {
    name: 'Funding Societies',
    url: 'https://apply.workable.com/fundingsocieties/',
    type: 'workable',
    region: 'sea'
  },
  {
    name: 'Atome',
    url: 'https://hire-r1.mokahr.com/social-recruitment/advance/100004054',
    type: 'mokahr',
    region: 'sea'
  },
  {
    name: 'OCBC',
    url: 'https://ocbc.wd102.myworkdayjobs.com/External?locationCountry=80938777cac5440fab50d729f9634969',
    type: 'workday',
    region: 'sea'
  },
  {
    name: 'OCBC Indonesia',
    url: 'https://empq.fa.ap2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/jobs',
    type: 'oracle',
    region: 'sea'
  },
  {
    name: 'GoTo',
    url: 'https://jobs.lever.co/GoToGroup',
    type: 'lever',
    region: 'sea'
  },
  {
    name: 'GDP Labs',
    url: 'https://career.catapa.com/GDPLabs/jobs',
    type: 'catapa',
    region: 'sea'
  }
];

export const load: PageServerLoad = async () => {
  // Reset and reseed — always ensure default sources exist with correct URLs
  const existingSources = await db.select().from(jobSource);
  for (const ds of DEFAULT_SOURCES) {
    const existing = existingSources.find((s) => s.type === ds.type && s.name === ds.name);
    if (!existing) {
      await db.insert(jobSource).values(ds);
    } else if (existing.url !== ds.url) {
      await db.update(jobSource).set({ url: ds.url }).where(eq(jobSource.id, existing.id));
    }
  }

  const sources = await db
    .select()
    .from(jobSource)
    .where(eq(jobSource.enabled, true))
    .orderBy(jobSource.region, jobSource.name);

  // Prune stale
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db.delete(jobListing).where(lt(jobListing.fetchedAt, cutoff));

  // Get all non-rejected listings, newest first
  const listings = await db
    .select({
      id: jobListing.id,
      title: jobListing.title,
      url: jobListing.url,
      department: jobListing.department,
      location: jobListing.location,
      description: jobListing.description,
      publishedAt: jobListing.publishedAt,
      fetchedAt: jobListing.fetchedAt,
      isPM: jobListing.isPM,
      experienceYears: jobListing.experienceYears,
      rejected: jobListing.rejected,
      requiresChinese: jobListing.requiresChinese,
      recruitType: jobListing.recruitType,
      viewedAt: jobListing.viewedAt,
      sourceName: jobSource.name,
      sourceType: jobSource.type
    })
    .from(jobListing)
    .innerJoin(jobSource, eq(jobListing.sourceId, jobSource.id))
    .where(eq(jobListing.rejected, false))
    .orderBy(
      // Interns first, then graduate, then regular
      sql`CASE ${jobListing.recruitType} WHEN 'intern' THEN 0 WHEN 'graduate' THEN 1 ELSE 2 END`,
      // Lower experience first, "any level" at the top
      sql`${jobListing.experienceYears} ASC NULLS FIRST`,
      // Newest fetched first within each tier
      desc(jobListing.fetchedAt),
      // Deterministic tiebreaker so rows don't swap between queries
      desc(jobListing.id)
    );

  // Extract external job ID from URL for cross-source dedup
  // SEA: /position/J02091584, ATS: ?id=J02091584, ByteDance: /search/123
  const jobKey = (url: string) => {
    let m = url.match(/\/job-detail\/(J\d+)/); // ATS / Shopee SG (new format)
    if (m) return m[1];
    m = url.match(/[?&]id=(J\d+)/); // ATS / Shopee SG (old format)
    if (m) return m[1];
    m = url.match(/\/position\/(J\d+)/); // SEA
    if (m) return m[1];
    m = url.match(/\/search\/(\d+)/); // ByteDance
    if (m) return 'bd-' + m[1];
    return url; // fallback
  };

  // Deduplicate by external job ID (catches ATS↔SEA overlap)
  const seen = new Set<string>();
  const deduped = listings.filter((l) => {
    const key = jobKey(l.url);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Normalize for serialization
  const flatListings = deduped.map((l) => ({
    id: l.id,
    title: l.title,
    url: l.url,
    department: l.department ?? '',
    location: l.location ?? '',
    description: l.description ?? '',
    publishedAt: l.publishedAt?.toISOString() ?? null,
    fetchedAt: l.fetchedAt.toISOString(),
    isPM: l.isPM,
    experienceYears: l.experienceYears,
    requiresChinese: l.requiresChinese,
    recruitType: l.recruitType,
    viewedAt: l.viewedAt?.toISOString() ?? null,
    sourceName: l.sourceName,
    sourceType: l.sourceType
  }));

  // Separate PM and non-PM
  const pmJobs = flatListings.filter((l) => l.isPM);
  const otherJobs = flatListings.filter((l) => !l.isPM);

  // Split PM jobs by region
  const sgJobs = pmJobs.filter((j) => /\bsingapore\b/i.test(j.location));
  const idJobs = pmJobs.filter((j) =>
    /\b(?:indonesia|jakarta|bandung|surabaya|medan|yogyakarta|bali)\b/i.test(j.location)
  );

  const sourcesWithCounts = sources.map((s) => ({
    ...s,
    listingCount: flatListings.filter((l) => l.sourceName === s.name).length
  }));

  return {
    sources: sourcesWithCounts,
    pmJobs,
    sgJobs,
    idJobs,
    otherJobs,
    totalPM: pmJobs.length,
    totalSG: sgJobs.length,
    totalID: idJobs.length,
    totalOther: otherJobs.length,
    lastFetched: listings[0]?.fetchedAt?.toISOString() ?? null
  };
};
