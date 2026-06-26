---
name: find-career-links
description: Find and verify company career page URLs for the job board aggregator.
---

# Find Career Links

Given a company name, find their career/jobs page. If it works, add the source. If it needs a new fetcher, build one.

## Process

1. **WebSearch** `"{company} careers"` or `"{company} jobs"` — must list open roles, not an about/life page.
2. **WebFetch** the URL. If it's server-rendered (JSON-LD, `<a>` links), use the `html` fetcher. If it's an SPA (`<div id=app>`), look for the API.
3. **Add to DEFAULT_SOURCES** in `+page.server.ts` and wire the fetcher.

## Source Types

| Type        | When                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------- |
| `bytedance` | ByteDance-specific API                                                                        |
| `sea`       | `career.sea.com` API (old SEA careers)                                                        |
| `sea-sg`    | `ats.workatsea.com` API (unified SEA Group: Shopee, Monee, MariBank, Garena)                  |
| `grab`      | Grab XML career feed                                                                          |
| `workday`   | Workday CXS REST API (many banks, enterprises — DBS, UOB, OCBC)                               |
| `workable`  | Workable `.md` endpoints (LLM-friendly markdown API)                                          |
| `mokahr`    | MokaHR ATS (Atome — parse `init-data` for orgId, `POST /api/outer/ats-apply/website/jobs/v2`) |
| `oracle`    | Oracle HCM Candidate Experience (OCBC Indonesia — ID scanning + OG meta tags)                 |
| `lever`     | Lever public REST API (`GET https://api.lever.co/v0/postings/{company}?mode=json`)            |
| `html`      | Server-rendered pages (Cheerio)                                                               |
| `rss`       | RSS/Atom feeds                                                                                |

## APIs We Know

### ByteDance

- `POST https://jobs.bytedance.com/api/v1/public/supplier/search/job/posts`
- Headers: `website-path: en`, `x-tt-env: boe_epam_api`
- Body: `{ keyword, location_code_list, limit, offset }`
- Detail: `https://joinbytedance.com/search/{id}`
- Location codes: CT_169=Jakarta, CT_163=Singapore

### SEA Group — Old (`sea` type)

- `GET https://career.sea.com/api/user/job/list`
- Params: `city_ids` (repeated), `employment_ids` (repeated), `keyword`, `limit`, `page`
- **Pagination broken** — page > 1 repeats. Workaround: query each city separately.
- Detail: `https://career.sea.com/position/{job_id}` (client-side redirect, broken for hotlinks)

### SEA Group — Unified ATS (`sea-sg` type)

- `GET https://ats.workatsea.com/ats/api/v1/user/job/list`
- Params: `city_ids` (repeated), `department_ids` (repeated), `employment_ids` (repeated), `limit`, `offset`, `search_content`
- **Pagination works** — `offset`-based, `total_count` in response. Fetch all pages.
- Detail: `https://careers.shopee.sg/job-detail/{job_id}/1?channel=10001`
- Source URLs can use `region_id` or `location` for the city filter — fetcher handles both.
- Same city/department/employment IDs as the old SEA API.
- Also powers `careers.monee.com`, `careers.shopee.sg` — same backend, different frontends.

### City IDs (shared across both SEA APIs)

| ID                   | Location  |
| -------------------- | --------- |
| 25                   | Singapore |
| 10, 9, 8, 11, 12, 13 | Indonesia |

### Department IDs

| ID  | Department           |
| --- | -------------------- |
| 11  | Product Management   |
| 6   | Engineering          |
| 1   | Business Development |

### Employment IDs: 1-3 = Experienced, 4 = Intern

### Grab XML feed

- `GET https://grab.careers/en/jobs/xml/?rss=true&country=...`
- Each `<job>` block has CDATA fields: `<title>`, `<url>`, `<city>`, `<country>`, `<description>`, `<date>`, `<category>`, `<jobtype>`
- Description is HTML — convert `<p><strong>` and `<h1>-<h6>` to `### Headers` for modal display.
- `<category>` → department, `<jobtype>` + title → recruitType detection.
- Strip "About Grab and Our Workplace…" boilerplate, accounting for `###` prefix after conversion.

### Workday CXS

- `POST https://{tenant}.wd{N}.myworkdayjobs.com/wday/cxs/{tenant}/{siteId}/jobs`
- Body: `{ limit, offset, searchText, locations: string[], categories: string[] }`
- **Max `limit` is 20** — 400 error above that.
- **Location filter does NOT work** — `total` and results always include all countries. Filter by location name in the fetcher instead.
- **`searchText` parameter works but is dangerously broad** (matches body text, not just title). Better to fetch all and PM-filter client-side.
- No auth needed — cookie/CSRF optional for public sites.
- Response: `{ total, jobPostings: [{ title, externalPath, locationsText, postedOn, bulletFields }] }`
- **No description in list** — fetch each job's HTML page at `{host}/{locale}/{siteId}{externalPath}`. URL format varies: some tenants use `/en-GB/{siteId}/jobs`, others use `/{siteId}` directly with no locale prefix. Fetcher adapts automatically via `pathParts`.
- **Meta tag may use `property="og:description"`**, not `name="description"` — match both.
- **Multi-tenant** — shared `fetchWorkday` function. Different companies have different description formats:
  - **DBS**: `Business Function:`, `Responsibilities:`, `Requirements:`, `Job: X` for department, `Schedule: X` for recruitType. Office codes like "DBS Asia Central".
  - **UOB**: `Company: ... About UOB ... Job Description ... Job Requirements ... Additional Requirements ... Be a Part of the UOB Family ...` No `Job:` field — department stays `null`. Strip boilerplate with `/^Company:[\s\S]*?(?=\s*Job\s+Description)/i`.
  - **OCBC**: `WHO WE ARE: ... Your Opportunity Starts Here.` Strip with `/^WHO\s+WE\s+ARE:[\s\S]*?Your\s+Opportunity\s+Starts\s+Here\.\s*/i`. Office codes like "OCBC Singapore", "BOS Singapore", "SGP-Head Office".
- **Location detection** — check both `locationsText` and `bulletFields` (combined) since bulletFields often contain the country. Key patterns:
  - Singapore: `/singapore/i` in combined text, `/SGP[-_]/i` for Oracle-style codes, `/dbs\s*(asia|bank|marina)/i` for DBS offices
  - Indonesia: `/indonesia|jakarta|bandung|surabaya|medan|makassar|semarang|solo|pekanbaru|pontianak|palembang|samarinda/i`
- **`locationCountry` UUIDs** (consistent across tenants): `80938777cac5440fab50d729f9634969` = Singapore, `b31234dbcdda4da9ba8fa073c5944e36` = Indonesia.
- **JSON-LD** on detail pages has `datePosted` — extract for `publishedAt`.
- Also parses `Job: X` from meta for department (DBS only), `Schedule: X` for recruitType.
- Pagination: fetch pages in parallel batches of 5, each with 30s timeout.

### Workable

- Markdown-based public API — extremely easy to parse.
- List: `GET https://apply.workable.com/{company}/jobs.md?department=X` — returns markdown table.
- Detail: `GET https://apply.workable.com/{company}/jobs/view/{ID}.md` — structured markdown with `**Department:**`, `**Workplace:**`, `## Description`, `## Requirements`, `## Benefits`, `## Apply`.
- **Single-department queries return all jobs** in that department. Multi-department queries cap at ~30 results — query each department separately and deduplicate.
- Job IDs (hex) from the view URL. No auth needed.
- Parse markdown table rows: `| Title | Department | Location | Type | Salary | Posted | Details |`
- Location in table includes workplace type in parens — strip with `.replace(/\s*\([^)]*\)\s*$/, '')`.
- Detail page has company boilerplate — strip per-company (e.g. Funding Societies: `**Funding Societies | Modalku** is the largest...`).

### MokaHR

- SPA with hidden `<input id="init-data" type="hidden" value="{JSON}">`. Extract `org.id` and `org.siteId`.
- List API: `POST https://{host}/api/outer/ats-apply/website/jobs/v2` with body `{ siteId, orgId, locale: "en-US", page, pageSize, location: ["Singapore"|"Indonesia"] }`.
- **Location filter may not work** — response includes all locations. The `location` param only affects `total` count in `jobStats`.
- Response: `{ data: { jobStats: { total }, jobs: [{ id, title, deptId, jobDescription, commitment, createdAt, status }] } }`.
- Detail API: `POST https://{host}/api/outer/ats-apply/website/job` with body `{ siteId, orgId, locale, jobId }`.
- Detail returns: `customFields[100004130].value` = office location (e.g. "ID-Jakarta", "SG-Singapore"), `departments[].name` = full dept path, `jobDescription` = HTML, `commitment` (全职, 实习).
- Recruit type from `commitment`: "实习" or "intern" → intern.

### Oracle HCM Candidate Experience

- **Limited reliability** — can't distinguish open from closed jobs in raw HTML.
- Job detail pages: `GET https://{host}/hcmUI/CandidateExperience/en/sites/{siteNumber}/job/{id}/` — server-rendered with OG meta tags (`og:title`, `og:description`).
- Job IDs are roughly sequential (higher = newer). Scan IDs in batches to discover valid pages.
- Finder API: `GET /hcmRestApi/resources/{version}/recruitingCEJobRequisitions?onlyData=true&finder=findReqs;siteNumber={site}&limit=1` — returns `TotalJobsCount` and facets, but **NOT individual job IDs**.
- **Critical limitation**: closed/expired jobs keep serving their detail pages with indistinguishable HTML. The "job-expired" detection is JS-only. Use finder's `TotalJobsCount` to calibrate how many recent IDs to keep (sort by ID descending, keep top N).
- Extract `og:title` and `og:description` from meta tags. All jobs from an ID site are in that site's country.
- Closed jobs self-clean via 30-day `staleCutoff`.

### Lever

- **Best public API** — clean JSON, no auth, full data.
- `GET https://api.lever.co/v0/postings/{company}?mode=json`
- Returns array of job objects: `{ id, text (title), categories: { department, location, commitment }, country, descriptionPlain, lists: [{ text, content }], hostedUrl, applyUrl, createdAt, workplaceType }`.
- PM-filter on `text` field. Location-filter on `country` (SG/ID) and `categories.location`.
- Combine `descriptionPlain` + `lists[]` (with `###` headers) for full description.
- Recruit type from `categories.commitment` ("Internship" → intern).
- Published date from `createdAt` (epoch millis).
- Strip per-company boilerplate from descriptions (e.g. GoTo: "About GoTo Group...", "About Gojek...", "About GoTo Financial...").

### Catapa

- Public careerpage API — no auth needed (`credentials: "omit"`).
- List: `GET https://api-apps.catapa.com/careerpage/{company}/jobs` — returns `{ content: [{ id, tenant, jobTitle: { name, code }, code, titleDescription, jobDetail: { description, qualifications }, location: { name, code }, jobStatus, jobType, organization: { name }, createdDate, ... }] }`.
- Detail: `GET https://api-apps.catapa.com/careerpage/{company}/jobs/{jobId}`.
- **NOT at `/api/company/...`** — the path is `/careerpage/{company}/jobs`. All earlier attempts at `/api/company/...` returned 401 because that's the internal API path, not the public career one.
- Location from `location.name` or `location.code` (e.g. "Jakarta", "JKT").
- Department from `organization.name` or `jobTitle.code`.
- Recruit type from `titleDescription` or `jobType` (contains "Internship").
- `jobDetail.description` and `jobDetail.qualifications` are HTML — parse with Cheerio.

## Finding APIs

1. Check for JSON-LD first.
2. Check for `llms.txt` or `.md` endpoints (Workable).
3. Grep JS bundles for `baseURL`, `/api/`, `job/list`, `init-data`.
4. Look for Lever/Greeenhouse/Workable URLs — they have public APIs.
5. Brute-force endpoint names from bundle paths.
6. Puppeteer only as last resort — Vercel Security Checkpoint and similar bot walls make raw HTTP impossible for some sites (e.g. GoTo's gojek.io API).

## PM Detection

Title regex matching (~27 patterns) + ByteDance category check. Includes both `product` and `project` manager variants (APAC often uses them interchangeably). See `isProductManagementRole()`.

Note: "Productive" in titles (e.g. "Credit Analyst (Productive / Secured Financing)") does NOT match — `\bproduct\b` correctly excludes it since "Productive" has no word boundary after "Product".

## Key Utilities

All in `jobs.ts`:

- `extractMinExperienceYears` — strips "up to N years" ceilings first, then matches range/plus/threshold patterns.
- `inferExperienceFromTitle` — title-based fallback when description doesn't state years: SVP/Head→10, VP→7, AVP→5, Senior→4, Officer/Analyst/Manager→2, Intern/Trainee→0. Applied in dispatcher for ALL sources when `experienceYears` is null.
- `appearsExpired` — checks description for expiration clues.
- `requiresChineseLanguage` — detects Mandarin requirements.
- `detectRecruitTypeFromTitle` — title-based fallback for recruitType (intern/graduate).
- `staleCutoff` — 30 days.
- `tryParseDate` — parses various date formats including ISO, "11 May 2026", "May 11, 2026".

## viewedAt Preservation

The `/api/jobs/fetch` handler snapshots existing `viewedAt` keyed by canonical job ID (`jobKey` function) before wiping listings, then carries them forward on re-insert. Both `+page.server.ts` and `/api/jobs/fetch/+server.ts` have identical `jobKey` functions — **keep them in sync**.

- ByteDance: `bd-{numericId}` (prefix prevents collision with other numeric-only keys)
- ATS/Shopee SG: `J{id}` from `/job-detail/J{id}` or `?id=J{id}`
- SEA: `J{id}` from `/position/J{id}`
- Workday/UOB/DBS/Lever/Oracle: falls through to full URL

## Merge Groups

In `+page.svelte` `groupedSources`: merge sources by name prefix for multi-entity companies:

- SEA Group: `s.type === 'sea' || s.type === 'sea-sg'`
- OCBC Group: `/ocbc/i.test(s.name)` — merges Workday (SG) + Oracle (ID)

## Source URLs

Encode API params as query strings. `+page.server.ts` syncs DEFAULT_SOURCES on every load.
