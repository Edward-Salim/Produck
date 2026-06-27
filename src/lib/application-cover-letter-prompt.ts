export const APPLICATION_COVER_LETTER_SYSTEM_PROMPT =
  'Return valid JSON only. No markdown, code fences, explanations, or reasoning.';

export const PROFILE_CONTEXT = `Edward Salim
Technical Product Manager | Fintech Enthusiast | Product Discovery Specialist
Jakarta, Indonesia
Email is injected privately into generated PDFs.
Phone number is injected privately into generated PDFs.
linkedin.com/in/edward-salim

CV evidence to use selectively:
- Fresh Computer Science graduate from Universitas Indonesia, Information Systems concentration, expected Jul 2026, GPA 3.57/4.00.
- 2nd Place Most Outstanding Student of Faculty of Computer Science 2025 and full tuition scholarship from the Indonesian Ministry of Education and Culture.
- Legally authorized to work in Indonesia, available immediately, and open to Jakarta/Banten area opportunities.
- Languages: Indonesian native, Hokkien native, English professional fluency with Duolingo English Test 140/160, Mandarin HSK 2.
- DANA Indonesia, Automation Product Developer Intern. Synthesized pain points from 15+ tech and non-tech stakeholders across DANA's largest Backoffice system, identified root causes, and proposed prioritized product recommendations for operational bottlenecks. Led product discovery for AI HR Interviewer and AI CV Scoring through competitor benchmarking, cost analysis, and recruitment flow mapping with potential to cut hiring cycle time from 1 month to 3 weeks.
- Kitabisa, Test Engineer Intern. Conducted market, competitive, financial, and cost analysis of SaaS test management tools, led a proof of concept for an in-house alternative, and identified IDR 300M+ in potential cost optimization.
- Indodana Fintech, Marketing Technology Intern. Optimized CRM campaigns through data analysis, A/B testing, segmentation, and tracking across campaigns reaching 300K+ users per cycle. Supported customer-wide communications to 1M+ users with Product, BI, and Design.
- UKM KMBUI, Project Officer. Led a 52-member, 9-division community development initiative, raised IDR 70M+, launched seputarkrecek.com, and delivered measurable social and economic outcomes.
- Projects include K-Owl AI learning management system, Produck personal AI utility website, and customer churn analysis dashboard.
- Awards include 1st place IDEAS Business Plan Competition, 1st place RASIO Data Science Competition, 1st place TECHFEST Big Data Competition.
- Product methods: Inspired, The Mom Test, Continuous Discovery Habits, Outcomes Over Output, ICE Done Right, Evidence-Guided, User Story Mapping, Sprint.
- Fintech context: card networks, real-time payments, OJK/BI regulation, Indonesian fintech power user across DANA, GoPay, OVO, ShopeePay, Flip, Pluang, Stockbit, Bibit, mobile banking, and merchant tools.
- Technical and data fluency: SQL, Python, TypeScript, SvelteKit, React, API design, PostgreSQL, MySQL, Tableau, Excel, A/B testing, PostHog, MoEngage, Playwright, UiPath, AI tools.`;

export function buildApplicationCoverLetterPrompt(input: string): string {
  return `You generate Edward Salim's tailored job application cover letters.

Return ONLY valid JSON with this exact shape:
{
  "company": "short company name",
  "role": "role title",
  "recipient": "Hiring Team, Company",
  "companyTag": "filesystem_safe_short_tag",
  "plainText": "greeting and cover letter body only"
}

The PDF renderer owns all layout, portrait, signature, contact details, links, and CV attachment. Generate only the recipient and cover-letter body content.

Edward profile and CV context:
${PROFILE_CONTEXT}

Writing rules:
- Generate only recipient and plainText content. Do not generate layout, source markup, links, signature text, contact details, or a CV.
- recipient is the inferred hiring contact, usually "Hiring Team, COMPANY". Never leave placeholders.
- plainText is only the greeting plus 3 concise paragraphs. The greeting should be "Dear Hiring Team," unless a specific recipient is known. Do not append the company name to the greeting.
- Write 175-220 words unless the input asks otherwise. Prefer 2-4 sentences per paragraph. Never exceed 220 words unless the input explicitly requests a longer letter.
- Open with whichever is sharper for the role: a specific market, product, customer, or operating-context insight, or Edward's strongest relevant fit signal. Never open with "I am writing".
- Structure: paragraph 1 explains why the company, role, or problem space matters. Paragraph 2 connects Edward's judgment to the role with selective proof. Paragraph 3 looks forward to the contribution he would make.
- Keep each paragraph focused on one clear point: topic sentence, compressed proof, relevance bridge. Do not add extra "also" evidence after the main proof or turn the letter into a checklist.
- Use proof over explanation: credibility signal, action or judgment, result, then why it transfers. Use a metric only when it is the single strongest proof. Otherwise describe the result qualitatively.
- For Edward's past work, only claim actions and outcomes stated in the profile context. Do not say recommendations were adopted, shipped, implemented, reduced, improved, or achieved unless that outcome is explicitly provided.
- Use one primary CV evidence point. Add a second only when unusually relevant. Choose the proof closest to the role's domain, not the most impressive unrelated proof. For consulting, management trainee, strategy, operations, or leadership-program roles, you may add up to two brief supporting credibility signals if they serve one cohesive argument.
- Do not restate the CV or write one paragraph per past role. Avoid recap sequences like "At DANA...", "During my internship at Kitabisa...", or "I bring SQL...".
- Name DANA, Kitabisa, Indodana, a project, method, metric, award, language, availability, or work authorization only when it directly supports the target role. If naming an employer as the main proof, do not also name a separate project, award, or unrelated metric in the same letter. Never list technical tools in the letter. Use "technical fluency" or "computer science background" instead when relevant. Do not mention AI HR Interviewer or AI CV Scoring unless the target role involves HR, recruiting, or hiring tools.
- Tailor role emphasis: for consulting or leadership programs, surface analytical problem solving, stakeholder influence, and academic or achievement credibility when relevant. For product, fintech, data, growth, or AI roles, prioritize product judgment, user or business context, technical fluency, and execution tradeoffs.
- Explain "why this role" through the work it represents. Explain "why this company" only with facts from the user dump, such as a real conversation, recruiter name, event, office, product, market, or company fact. Do not invent mission, strategy, tagline, market-position claims, or personal claims such as having followed the company.
- Keep the tone direct, warm, natural, and modest. Avoid grand phrases, abstract metaphors, self-congratulatory claims, generic enthusiasm, and prestige-heavy praise such as "world-class" or "industry-leading".
- If mentioning the appended CV, keep it low-friction, such as "The projects behind this approach are detailed in the attached CV." Do not write "as shown in my CV", "please see my CV", or similar self-promotional attachment language.
- End after the final body sentence. Do not include sign-offs such as "Sincerely", "Warm regards", or "Edward Salim".
- Avoid markdown, semicolons, prose colons, em dashes, en dashes, and curly punctuation. Use ASCII commas, periods, and apostrophes instead.

Before returning, silently verify that plainText has exactly one greeting, exactly 3 body paragraphs, no sign-off, no signature, no tool list, no off-domain AI hiring proof, no more than one primary CV proof, and no unrelated extra evidence.

User dump:
${input}`;
}
