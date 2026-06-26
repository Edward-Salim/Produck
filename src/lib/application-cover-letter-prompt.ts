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

export const LATEX_SHELL = String.raw`\documentclass[letterpaper,11pt]{article}

% Design inspired by a soft framed cover-letter page.
\usepackage[margin=0in]{geometry}
\usepackage[T1]{fontenc}
\usepackage[english]{babel}
\usepackage[lf]{ebgaramond}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{tikz}
\usepackage{tabularx}
\usepackage{array}
\usepackage{fontawesome5}
\usepackage[hidelinks,colorlinks=true]{hyperref}
\usetikzlibrary{calc}
\input{glyphtounicode}

% Page setup
\pagestyle{empty}
\urlstyle{same}
\setlength{\parindent}{0pt}
\setlength{\parskip}{1.02em}
\setlength{\tabcolsep}{0pt}

% Colors
\definecolor{brand}{RGB}{130, 95, 55}
\definecolor{pagebg}{RGB}{236, 229, 216}
\definecolor{accentwash}{RGB}{205, 195, 174}
\definecolor{panel}{RGB}{255, 255, 255}
\definecolor{coinbase}{RGB}{151, 124, 73}
\definecolor{coinrim}{RGB}{92, 75, 58}
\definecolor{coinshine}{RGB}{221, 212, 194}
\definecolor{ink}{RGB}{42, 35, 26}
\definecolor{muted}{RGB}{107, 94, 74}
\hypersetup{urlcolor=brand,linkcolor=brand}
\pdfgentounicode=1

\tikzset{
  coin/.pic={
    \fill[coinrim, opacity=0.16] (0.08,-0.08) circle (1.04);
    \fill[coinbase, opacity=0.34] (0,0) circle (1);
    \draw[coinrim, opacity=0.48, line width=1.6pt] (0,0) circle (0.96);
    \draw[coinshine, opacity=0.34, line width=0.7pt] (0,0) circle (0.78);
    \fill[pagebg, opacity=0.95] (-0.22,-0.22) rectangle (0.22,0.22);
    \draw[coinrim, opacity=0.56, line width=0.8pt] (-0.22,-0.22) rectangle (0.22,0.22);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (-0.56,0.00) -- (-0.32,0.00);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (0.32,0.00) -- (0.56,0.00);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (0.00,0.32) -- (0.00,0.56);
    \draw[coinrim, opacity=0.28, line width=0.65pt] (0.00,-0.32) -- (0.00,-0.56);
  }
}

\newcommand{\contactrow}[2]{%
  \textcolor{brand}{\makebox[0.18in][c]{\faIcon{#1}}}%
  \hspace{0.07in}{#2}\\[0.115in]%
}

\begin{document}
\pagecolor{pagebg}

% Background and letter panel
\begin{tikzpicture}[remember picture, overlay]
  \fill[pagebg] (current page.south west) rectangle (current page.north east);
  \pic[scale=2.10, rotate=-10] at ($(current page.north west)+(0.00in,-0.08in)$) {coin};
  \pic[scale=0.56, rotate=18] at ($(current page.north west)+(1.06in,-0.58in)$) {coin};
  \pic[scale=0.42, rotate=32] at ($(current page.north east)+(-0.92in,-0.28in)$) {coin};
  \pic[scale=1.62, rotate=14] at ($(current page.north east)+(0.75in,-3.40in)$) {coin};
  \pic[scale=0.52, rotate=-18] at ($(current page.north east)+(-0.26in,-2.30in)$) {coin};
  \pic[scale=1.55, rotate=-18] at ($(current page.south west)+(0.05in,0.15in)$) {coin};
  \pic[scale=0.50, rotate=12] at ($(current page.south west)+(1.05in,0.42in)$) {coin};
  \pic[scale=0.48, rotate=17] at ($(current page.south east)+(-0.52in,0.44in)$) {coin};
  \path[fill=panel, rounded corners=0.22in] ($(current page.south west)+(0.72in,0.62in)$) rectangle ($(current page.south west)+(7.78in,8.08in)$);
\end{tikzpicture}

% Header
\vspace*{0.66in}
\hspace*{1.70in}
\begin{tabularx}{5.56in}{@{}m{1.52in}@{\hspace{0.38in}}X@{}}
  {\setlength{\fboxsep}{0.025in}\setlength{\fboxrule}{0.035in}\fcolorbox{white}{white}{\includegraphics[trim=0 620 0 620, clip, width=1.48in]{Edward_Salim.jpg}}}
  &
  \begin{minipage}[c]{\linewidth}
    {\fontsize{24}{28}\selectfont\bfseries\color{ink} Edward Salim, S.Kom}\\[0.07in]
    {\normalsize\color{muted} Building Fintech and AI Products}
  \end{minipage}
\end{tabularx}

\vspace{0.58in}
\hspace*{1.16in}
\begin{minipage}{6.14in}
  \normalsize\color{ink}
  \begin{tabularx}{\linewidth}{@{}X r@{}}
    \begin{minipage}[t]{0.50\linewidth}
      \textbf{To.}\\
      RECIPIENT
    \end{minipage}
    &
    \begin{minipage}[t]{0.28\linewidth}
      \raggedleft \today
    \end{minipage}
  \end{tabularx}

  \vspace{0.36in}
  {
  \setlength{\parskip}{0.13in}
  \setlength{\baselineskip}{14.4pt}

BODY\par}

  \vspace{0.22in}
  \includegraphics[width=0.92in]{ttd_edward.png}\\[-0.05in]
  \textbf{Edward Salim, S.Kom}

  \vspace{-0.58in}
  \hfill
  \begin{minipage}[t]{2.42in}
    \small\color{ink}
    \contactrow{map-marker-alt}{Jakarta, Indonesia}
    \contactrow{envelope}{\href{mailto:CONTACT_EMAIL}{CONTACT_EMAIL}}
    \contactrow{phone-alt}{\href{CONTACT_PHONE_URL}{CONTACT_PHONE_DISPLAY}}
    \contactrow{linkedin}{\href{http://linkedin.com/in/edward-salim}{linkedin.com/in/edward-salim}}
  \end{minipage}
\end{minipage}

\end{document}`;

export function buildApplicationCoverLetterPrompt(input: string): string {
  return `You generate Edward Salim's tailored job application cover letters.

Return ONLY valid JSON with this exact shape:
{
  "company": "short company name",
  "role": "role title",
  "recipient": "Hiring Team, Company",
  "companyTag": "filesystem_safe_short_tag",
  "plainText": "greeting and cover letter body only",
  "latex": "full compilable LaTeX document"
}

Use this LaTeX shell and replace RECIPIENT and BODY:
${LATEX_SHELL}

Edward profile and CV context:
${PROFILE_CONTEXT}

Writing rules:
- Use the LaTeX shell exactly. Replace only RECIPIENT and BODY. Keep all layout, assets, colors, spacing, and contact/signature elements unchanged.
- RECIPIENT is the inferred hiring contact, usually "Hiring Team, COMPANY". Never leave placeholders.
- BODY is only the greeting plus 3 concise paragraphs. No closing line or typed signature because the shell already provides the signature area.
- Write 180-245 words unless the input asks otherwise. Open with a specific market, product, customer, or operating-context insight, not "I am writing".
- Do not restate the CV. The appended CV already contains education, internship bullets, projects, awards, language scores, and technical tools. This page should add context, judgment, motivation, and fit that the CV cannot show by itself.
- Use at most 1 strong CV evidence point, or 2 only when both are unusually relevant. Mention an employer, project, method, tool, or metric only if it directly supports the target company's problem.
- Prefer describing evidence as "in one product discovery project" or "through fintech operations work" instead of naming DANA, Kitabisa, Indodana, or a project. Name the employer only when the target role strongly benefits from that exact context.
- Never structure the letter as one paragraph per past role. Avoid recap sequences like "At DANA...", "During my internship at Kitabisa...", "I bring SQL...". Do not list skills, frameworks, tools, metrics, or achievements.
- Use evidence as a short supporting detail inside a broader argument about how Edward thinks and how he would help the target team.
- Do not copy CV metrics such as "15+ stakeholders", "IDR 300M+", "300K+ users", "1M+ users", or "52-member team" unless the metric is the single most relevant proof for the target role. If used, use only one metric in the whole letter.
- For motivation, infer only from Edward's pattern: interest in product work that connects users, business constraints, technical systems, fintech, AI tooling, data, operations, and implementation. Do not claim lifelong passion for a company, industry, or mission unless the user dump directly supports it.
- Explain "why this role" through the type of work it represents. Explain "why this company" only with facts from the user dump. If company-specific facts are thin, focus on the role's problem space instead of using generic praise.
- Fresh graduate framing is allowed, but only when it supports the role. Present it as recent, hands-on product exposure across internships and projects, not as lack of experience.
- Mention language ability only for regional, cross-cultural, partner-facing, Chinese-company, operations, consulting, or stakeholder-heavy roles.
- Mention scholarship, Most Outstanding Student, Duolingo score, awards, or speaking experience only for graduate programs, leadership programs, consulting, management trainee roles, or roles that explicitly value academic distinction and communication.
- Mention immediate availability or work authorization only if the job post asks about start date, graduate hiring, relocation, or eligibility.
- Preferred structure: paragraph 1 explains why the company or problem space matters, paragraph 2 connects Edward's product judgment to the role with one selective proof point, paragraph 3 looks forward to the contribution he would make.
- In paragraph 3, create a natural transition to the appended CV by naming the broader pattern the CV will evidence, such as bringing structure to ambiguous work, aligning stakeholders, translating business needs into technical requirements, or moving ideas into execution. Do not write "as shown in my CV", "please see my CV", or similar attachment language.
- Mention fintech, AI, product frameworks, rails, trust, credit, risk, payments, growth, retention, or regulation only when relevant to the pasted input and only in natural prose.
- Do not invent company facts. Do not mention a company's mission, tagline, market position, or strategic goal unless it appears in the user dump.
- Avoid markdown, semicolons, and prose colons. Do not use em dashes or en dashes. Use commas or periods instead. Escape LaTeX special characters.
- The CV is appended automatically after this page. Do not generate a CV.

User dump:
${input}`;
}
