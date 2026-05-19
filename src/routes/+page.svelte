<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    GraduationCap, 
    Briefcase, 
    Trophy, 
    Code, 
    Languages, 
    ArrowUpRight, 
    LogIn, 
    LayoutDashboard,
    FileText,
    Wrench,
    Sparkles,
    ChevronDown,
    BookOpen,
    Terminal as TerminalIcon,
    Heart,
    Coins,
    Wallet,
    Award,
    TrendingUp,
    Mic
  } from '@lucide/svelte';
  
  // Static assets & SVGs from SVGL CLI
  import edwardAvatar from '$lib/assets/edward.jpg';
  import logoProduck from '$lib/assets/logo-produck.png';
  import linkedinSvg from '$lib/assets/tech/linkedin.svg';
  import githubSvg from '$lib/assets/tech/github_light.svg';
  import gmailSvg from '$lib/assets/tech/gmail.svg';
  import pythonSvg from '$lib/assets/tech/python.svg';
  import typescriptSvg from '$lib/assets/tech/typescript.svg';
  import svelteSvg from '$lib/assets/tech/svelte.svg';
  import postgresqlSvg from '$lib/assets/tech/postgresql.svg';
  import dockerSvg from '$lib/assets/tech/docker.svg';
  import supabaseSvg from '$lib/assets/tech/supabase.svg';
  import djangoSvg from '$lib/assets/tech/django.svg';
  import gitSvg from '$lib/assets/tech/git.svg';
  import springSvg from '$lib/assets/tech/spring.svg';
  import reactSvg from '$lib/assets/tech/react_dark.svg';
  import whatsappSvg from '$lib/assets/tech/whatsapp-icon.svg';
  import nextjsSvg from '$lib/assets/tech/nextjs_icon_dark.svg';
  import mysqlSvg from '$lib/assets/tech/mysql-icon-dark.svg';
  import sqliteSvg from '$lib/assets/tech/sqlite.svg';
  import posthogSvg from '$lib/assets/tech/posthog.svg';
  import playwrightSvg from '$lib/assets/tech/playwright.svg';
  import atlassianSvg from '$lib/assets/tech/atlassian.svg';
  import excelSvg from '$lib/assets/tech/microsoft-excel.svg';
  import sheetsSvg from '$lib/assets/tech/google-sheets.svg';
  import claudeSvg from '$lib/assets/tech/claude-ai-icon.svg';
  import geminiSvg from '$lib/assets/tech/gemini.svg';
  import openaiSvg from '$lib/assets/tech/openai.svg';

  // Professional Experience Logos
  import danaLogo from '$lib/assets/fintech_logos/indonesia/dana.png';
  import kitabisaLogo from '$lib/assets/fintech_logos/indonesia/kitabisa.png';
  import indodanaLogo from '$lib/assets/fintech_logos/indonesia/indodana.png';

  // Lomba/Award & Project Images
  import datathonImg from '$lib/assets/awards/award-datathon.png';
  import finditImg from '$lib/assets/awards/award-findit.png';
  import rasioImg from '$lib/assets/awards/award-rasio.png';
  import techfestImg from '$lib/assets/awards/award-techfest.png';
  import churnImg from '$lib/assets/projects/project-churn.png';

  let { data } = $props();

  // Lightbox modal state
  let lightboxOpen = $state(false);
  let lightboxImage = $state('');
  let lightboxTitle = $state('');

  function openLightbox(img: string, title: string) {
    lightboxImage = img;
    lightboxTitle = title;
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightboxOpen = false;
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  }
  
  // Navigation elements
  const sections = [
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'speaking', label: 'Speaking', icon: Mic },
    { id: 'volunteering', label: 'Volunteering', icon: Heart },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'awards', label: 'Awards', icon: Trophy },
    { id: 'bookshelf', label: 'Bookshelf', icon: BookOpen }
  ];

  // Headline rotating list
  const roles = [
    "Fintech Automation Developer 金融科技开发",
    "Data Science Champion 数据科学优胜者",
    "Information Systems Student @ UI 计算机学子",
    "Product Discovery & Automation Builder 产品与自动化构建"
  ];
  
  let currentRoleIndex = $state(0);
  let currentRoleText = $state("");
  let isDeleting = $state(false);

  // Coin and click text states for the interactive widget
  interface Coin {
    id: number;
    x: number;
    y: number;
    size: number;
    rotation: number;
    speedY: number;
    speedX: number;
    rotSpeed: number;
  }

  interface ClickText {
    id: number;
    x: number;
    y: number;
    text: string;
  }

  let coins = $state<Coin[]>([]);
  let clickTexts = $state<ClickText[]>([]);
  let nextCoinId = 0;
  let nextTextId = 0;
  let animationFrameId: number;

  function spawnCoins() {
    const newCoins: Coin[] = [];
    for (let i = 0; i < 25; i++) {
      newCoins.push({
        id: nextCoinId++,
        x: Math.random() * 100, // viewport width %
        y: -10 - Math.random() * 20, // above viewport
        size: 16 + Math.random() * 24, // pixel diameter
        rotation: Math.random() * 360,
        speedY: 3 + Math.random() * 5,
        speedX: -1.5 + Math.random() * 3,
        rotSpeed: -5 + Math.random() * 10
      });
    }
    coins = [...coins, ...newCoins];
    if (coins.length === newCoins.length) {
      animateCoins();
    }
  }

  function animateCoins() {
    if (coins.length === 0) {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      return;
    }
    coins = coins
      .map(c => ({
        ...c,
        y: c.y + c.speedY,
        x: c.x + c.speedX,
        rotation: c.rotation + c.rotSpeed
      }))
      .filter(c => c.y < 110);
    animationFrameId = requestAnimationFrame(animateCoins);
  }

  function triggerFortune(e: MouseEvent) {
    spawnCoins();
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || window.innerHeight / 2;
    const sayings = [
      "招财进宝 (Attract Wealth!)",
      "金玉满堂 (Abundant Wealth!)",
      "万事如意 (Good Fortune!)",
      "DANA Automation +888!",
      "Kitabisa Savings +300M!",
      "Indodana Growth +168%!",
      "GPA Luck +8.88!",
      "Hokkien Power!",
      "Prosperity +88%",
      "大吉大利 (Great Fortune!)",
      "财源广进 (Wealth Flows In!)"
    ];
    const text = sayings[Math.floor(Math.random() * sayings.length)];
    const newText = {
      id: nextTextId++,
      x,
      y,
      text
    };
    clickTexts = [...clickTexts, newText];
    setTimeout(() => {
      clickTexts = clickTexts.filter(t => t.id !== newText.id);
    }, 1500);
  }

  // Typing effect & lightbox keyboard shortcut on mount
  onMount(() => {
    let timer: any;
    const tick = () => {
      const fullTxt = roles[currentRoleIndex];
      if (isDeleting) {
        currentRoleText = fullTxt.substring(0, currentRoleText.length - 1);
      } else {
        currentRoleText = fullTxt.substring(0, currentRoleText.length + 1);
      }
      
      let delta = 80 - Math.random() * 40;
      if (isDeleting) delta /= 2;
      
      if (!isDeleting && currentRoleText === fullTxt) {
        delta = 2000; // Delay before deleting
        isDeleting = true;
      } else if (isDeleting && currentRoleText === "") {
        isDeleting = false;
        currentRoleIndex = (currentRoleIndex + 1) % roles.length;
        delta = 400; // Pause before typing the next one
      }
      
      timer = setTimeout(tick, delta);
    };
    timer = setTimeout(tick, 500);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpen) {
        lightboxOpen = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  onDestroy(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
  });

  // Quick stats computed from CV details (Fintech & Wealth themes)
  const stats = [
    { value: '3.57', label: 'GPA at UI', detail: 'Information Systems', positive: '+3.57%' },
    { value: 'IDR 300M+', label: 'Cost Optimization', detail: 'Identified at Kitabisa', positive: '+88.8%' },
    { value: '300K+', label: 'CRM Engagement', detail: 'Indodana Active Users', positive: '▲ 1.68x' },
    { value: '3x', label: 'National Champion', detail: 'Hackathons & Data', positive: '🏆 Top 1' }
  ];

  // Terminal state
  let terminalHistory = $state([
    { type: 'output', text: 'Welcome to Edward\'s Fintech & Tech Ledger v1.6.8.\nType "help" to start, or "fortune" to check your financial horoscope!' }
  ]);
  let terminalInput = $state('');
  let terminalContainer: HTMLDivElement | null = $state(null);

  function handleTerminalSubmit(e: SubmitEvent) {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    // Log the input command
    terminalHistory = [...terminalHistory, { type: 'input', text: `visitor@edward-salim:~$ ${terminalInput}` }];
    
    // Command routing
    switch (cmd) {
      case 'help':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: 'Available commands:\n  [about]      - Short biography & focus\n  [skills]     - Primary tech stack and languages\n  [experience] - Professional experience timeline\n  [speaking]   - Speaking engagements & keynotes\n  [projects]   - Featured developer/product builds\n  [books]      - Key product management books I read\n  [fortune]    - Get a random Chinese fintech fortune\n  [clear]      - Clear screen logs\n  [secret]     - Unlock custom hackathon stats' 
        }];
        break;
      case 'fortune':
      case 'lucky':
        const sayings = [
          "🧧 Great Fortune (大吉大利)! Your next Svelte run compiles with 0 warnings.",
          "💰 Wealth & Flow! Kitabisa savings model optimizes another 300M IDR.",
          "📈 Bull Run! DANA automated workflows will save you 168 hours of manual testing.",
          "😺 Lucky Cat Waves! Indodana's CRM user engagement surges by 88%.",
          "🪙 Double Blessings! Hokkien fluency boosts your cross-border collaboration potential.",
          "🔮 Prosperity Awaits! An hidden refactoring will clear 88 bugs from production.",
          "🎋 Golden Bamboo growth! Your technical skills grow by 8.88x this cycle."
        ];
        const saying = sayings[Math.floor(Math.random() * sayings.length)];
        terminalHistory = [...terminalHistory, { type: 'output', text: saying }];
        break;
      case 'about':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: 'Edward Salim is an Information Systems major at Universitas Indonesia (GPA 3.57). He bridges product management with engineering automation, streamlining developer feedback loops, and identifying key business and software optimization paths.' 
        }];
        break;
      case 'skills':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: 'Languages:   Python, TypeScript, JavaScript, SQL, Hokkien (Native), English\nFrameworks:  SvelteKit, Next.js, Django, SpringBoot\nDatabases:   PostgreSQL, SQLite, MySQL\nData/Prod:   Tableau, MoEngage, PostHog, A/B Testing, Playwright, Docker' 
        }];
        break;
      case 'experience':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: '💼 Professional timeline:\n  • DANA Indonesia - Automation Product Developer Intern (2025-2026)\n  • Kitabisa - Test Engineer Intern (2025)\n  • Indodana Fintech - Marketing Technology Intern (2024)\n  • Central KMBUI - Head of Finance (2024)' 
        }];
        break;
      case 'speaking':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: '🎙️ Speaking engagements:\n  • Speaker - Dasar-Dasar Pemrograman 0 (Aug 2025, 540+ freshmen)\n  • Speaker - UKM KMBUI Project Management (May 2026)\n  • Speaker - UKM KMBUI Insight Hunting (Aug 2025)\n  • Mentor  - Dasar-Dasar Pemrograman 0 (Aug 2023)' 
        }];
        break;
      case 'projects':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: '💻 Code builds:\n  • Produck: This product discovery & productivity tool (SvelteKit, SQLite)\n  • K-Owl: AI Learning Management System (Next.js, Django, LLM APIs)\n  • Churn Forecasting: Telecom subscriber analytics model & Tableau dashboard' 
        }];
        break;
      case 'books':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: '📚 Key product/discovery literature:\n  • Continuous Discovery Habits (Teresa Torres)\n  • Evidence-Guided (Itamar Gilad)\n  • The Mom Test (Rob Fitzpatrick)\n  • Inspired (Marty Cagan)\n  • Sprint (Jake Knapp)\n  • User Story Mapping (Jeff Patton)' 
        }];
        break;
      case 'clear':
        terminalHistory = [];
        break;
      case 'secret':
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: '🏆 Data & Innovation Awards unlocked:\n  • 1st Place - IDEAS Batch 11 Business Plan (UGM, 2025)\n  • 1st Place - RASIO 7.0 Data Science Competition (UNPAD, 2023)\n  • 1st Place - TECHFEST Big Data Competition (BINUS, 2023)' 
        }];
        break;
      default:
        terminalHistory = [...terminalHistory, { 
          type: 'output', 
          text: `Command "${cmd}" not recognized. Type "help" for lists.` 
        }];
    }

    terminalInput = '';

    // Scroll container
    setTimeout(() => {
      if (terminalContainer) {
        terminalContainer.scrollTop = terminalContainer.scrollHeight;
      }
    }, 40);
  }

  // Skills with their SVGs downloaded from SVGL
  const marqueeSkills = [
    { name: 'Python', icon: pythonSvg },
    { name: 'TypeScript', icon: typescriptSvg },
    { name: 'SvelteKit', icon: svelteSvg },
    { name: 'React', icon: reactSvg },
    { name: 'Next.js', icon: nextjsSvg },
    { name: 'Django', icon: djangoSvg },
    { name: 'PostgreSQL', icon: postgresqlSvg },
    { name: 'Docker', icon: dockerSvg },
    { name: 'Supabase', icon: supabaseSvg },
    { name: 'Spring Boot', icon: springSvg },
    { name: 'Git', icon: gitSvg },
    { name: 'SQLite', icon: sqliteSvg },
    { name: 'MySQL', icon: mysqlSvg },
    { name: 'PostHog', icon: posthogSvg },
    { name: 'Playwright', icon: playwrightSvg },
    { name: 'Claude', icon: claudeSvg },
    { name: 'Gemini', icon: geminiSvg },
    { name: 'OpenAI', icon: openaiSvg }
  ];

  // Map skill labels to SVGs for category pills
  const skillIconMap: Record<string, string> = {
    'Python': pythonSvg,
    'TypeScript': typescriptSvg,
    'React': reactSvg,
    'SvelteKit': svelteSvg,
    'Django': djangoSvg,
    'PostgreSQL': postgresqlSvg,
    'Docker': dockerSvg,
    'Supabase': supabaseSvg,
    'SpringBoot': springSvg,
    'Spring Boot': springSvg,
    'Git': gitSvg,
    'SQL': sqliteSvg,
    'MySQL': mysqlSvg,
    'Next.js': nextjsSvg,
    'Playwright': playwrightSvg,
    'Jira': atlassianSvg,
    'Excel/Sheets': sheetsSvg,
    'PostHog': posthogSvg,
    'Claude/Claude Code': claudeSvg,
    'Gemini': geminiSvg,
    'ChatGPT': openaiSvg
  };

  // Professional experiences lists
  const experiences = [
    {
      company: 'DANA Indonesia',
      logo: danaLogo,
      industry: 'E-Wallet & Digital Payments',
      role: 'Automation Product Developer Intern',
      period: 'Jul 2025 - Jan 2026',
      cardTheme: 'from-[#0086E6] via-[#005FA3] to-[#003866]',
      bullets: [
        'Synthesized operational bottlenecks from <strong>15+ cross-functional stakeholders</strong> across DANA\'s <strong>largest backoffice system</strong>, proposing prioritized product solutions.',
        'Led <strong>product discovery</strong> for AI recruitment features (CV Scoring & HR Video bot), delivering cost and benchmarking models to project reduction in hiring cycle times from <strong>1 month to 3 weeks</strong>.'
      ]
    },
    {
      company: 'Kitabisa',
      logo: kitabisaLogo,
      industry: 'Indonesia\'s Largest Donation Platform',
      role: 'Test Engineer Intern',
      period: 'Feb 2025 - May 2025',
      cardTheme: 'from-[#0F9E98] via-[#0A6D69] to-[#05423F]',
      bullets: [
        'Led cost-benefit analysis and proof-of-concept for an in-house QA management system, identifying <strong>IDR 300M+ in cost optimization</strong> for engineering leadership.',
        'Automated <strong>50+ API test cases</strong> using a schema validation approach, cutting boilerplate code and strengthening QA coverage across 5+ core repositories.'
      ]
    },
    {
      company: 'Indodana Fintech',
      logo: indodanaLogo,
      industry: 'Consumer Lending',
      role: 'Marketing Technology Intern',
      period: 'Jul 2024 - Sep 2024',
      cardTheme: 'from-[#0D9488] via-[#0F766E] to-[#115E59]',
      bullets: [
        'Optimized campaign outcomes using <strong>A/B testing</strong> and user segmentation, boosting active CRM engagement across a base of <strong>300K+ users</strong>.',
        'Managed cross-functional execution of Indodana\'s official rebrand announcement microsite and notifications sent to <strong>1M+ users</strong>.'
      ]
    },
    {
      company: 'Desa Binaan UKM KMBUI',
      logo: null,
      industry: 'Community Development & Finance',
      role: 'Project Officer / Head of Finance',
      period: 'May 2024 - Dec 2024',
      cardTheme: 'from-[#B91C1C] via-[#851010] to-[#580505]',
      bullets: [
        'Managed financial planning and fundraising of <strong>IDR 70M+ (3x YoY increase)</strong>, established community koperasi model, and launched rural web hub seputarkrecek.com.'
      ]
    }
  ];

  let activeExperienceIndex = $state(0); // Open first one by default

  // Projects lists
  const projects = [
    {
      title: 'Produck',
      tag: 'You are here',
      category: 'product',
      description: 'A personal productivity and product management workspace. Integrates user-journey mapping, OKR tracking, background removal tools, fintech tracking, and AI-assisted workflows.',
      tech: ['SvelteKit', 'SQLite', 'Drizzle ORM', 'Bun', 'Tailwind CSS'],
      isSelf: true,
      image: null
    },
    {
      title: 'K-Owl',
      tag: 'Thesis Project',
      category: 'product',
      description: 'An AI-powered Learning Management System (LMS) engineered alongside faculty advisors to streamline student evaluation, automate grading feedback, and personalize course discovery paths.',
      tech: ['Next.js', 'Django', 'PostgreSQL', 'FastAPI', 'LLM Agent APIs'],
      isSelf: false,
      image: null
    },
    {
      title: 'Customer Churn Analysis',
      tag: 'Data Project',
      category: 'data',
      description: 'Telecom subscriber churn forecasting model and interactive executive Tableau dashboard detailing customer churn indicators and proposing high-impact retention strategies.',
      tech: ['Python', 'Pandas', 'Scikit-learn', 'Tableau'],
      isSelf: false,
      image: churnImg
    }
  ];

  let activeProjectFilter = $state('all');
  
  // Dynamic project filtering
  let filteredProjects = $derived(
    activeProjectFilter === 'all' 
      ? projects 
      : projects.filter(p => p.category === activeProjectFilter)
  );

  const awards = [
    { title: 'Scholarship Recipient', competition: 'Full Tuition Scholarship', organizer: 'Indonesian Ministry of Education and Culture', scope: 'National', year: '2022 - Present', image: null },
    { title: 'Champion (1st)', competition: 'IDEAS Batch 11 Business Plan Competition', organizer: 'Universitas Gadjah Mada', scope: 'National', year: '2025', image: null },
    { title: 'Champion (1st)', competition: 'RASIO 7.0 Data Science Competition', organizer: 'Universitas Padjadjaran', scope: 'International', year: '2023', image: rasioImg },
    { title: 'Champion (1st)', competition: 'TECHFEST Big Data Competition', organizer: 'BINUS University', scope: 'National', year: '2023', image: techfestImg },
    { title: 'Finalist (6th)', competition: 'RISTEK Datathon', organizer: 'Universitas UI', scope: 'National', year: '2023', image: datathonImg },
    { title: 'Finalist (Top 10)', competition: 'FIND IT! Data Analytics Competition', organizer: 'Universitas Gadjah Mada', scope: 'National', year: '2023', image: finditImg }
  ];

  // Bookshelf list
  const bookshelf = [
    { title: 'Continuous Discovery Habits', author: 'Teresa Torres', cover: 'continuous_discovery_habits.jpg', takeaway: 'Structured discovery loops to map user problems to business outcomes.' },
    { title: 'Evidence-Guided', author: 'Itamar Gilad', cover: 'evidence_guided.png', takeaway: 'Driving product roadmaps and features with GIST validation frameworks.' },
    { title: 'Inspired', author: 'Marty Cagan', cover: 'inspired.jpg', takeaway: 'Understanding why strong product teams create products customers love.' },
    { title: 'The Mom Test', author: 'Rob Fitzpatrick', cover: 'the_mom_test.jpg', takeaway: 'How to interview customers and get honest feedback when everyone is lying to you.' },
    { title: 'Sprint', author: 'Jake Knapp', cover: 'sprint.jpg', takeaway: '5-day process to prototype and validate ideas with real users.' },
    { title: 'User Story Mapping', author: 'Jeff Patton', cover: 'user_story_mapping.jpg', takeaway: 'Building maps to understand user journey steps and slice releases.' },
    { title: 'Outcomes Over Output', author: 'Josh Seiden', cover: 'outcomes_over_output.png', takeaway: 'Shifting team goals from shipping features to driving actual user behavioral changes.' },
    { title: 'Problem Solving 101', author: 'Ken Watanabe', cover: 'problem_solving_101.png', takeaway: 'Simple, powerful framework to diagnose root causes and map solutions.' }
  ];

  // Volunteering & Leadership list
  const volunteering = [
    {
      role: 'Speaker',
      organization: 'Dasar-Dasar Pemrograman 0',
      period: 'Aug 2025',
      duration: '1 mo',
      category: 'Education',
      description: 'Delivered opening keynote to <strong>540+ CS freshmen</strong> on career path exploration, tech vs. non-tech trajectories, and building continuous learning frameworks.',
      type: 'Speaking',
      badge: 'Keynote Speech',
      attachments: [{ name: 'Certificate', type: 'certificate', image: null }]
    },
    {
      role: 'Speaker',
      organization: 'UKM KMBUI',
      period: 'May 2026',
      duration: '1 mo',
      category: 'Social Services',
      description: 'Conducted Project Management workshop for <strong>40+ members</strong> on structured execution, vision alignment, and metric-driven project tracking.',
      type: 'Speaking',
      badge: 'Workshop Host',
      attachments: []
    },
    {
      role: 'Speaker',
      organization: 'UKM KMBUI',
      period: 'Aug 2025',
      duration: '1 mo',
      category: 'Education',
      description: 'Shared competitive strategies with <strong>60+ freshmen</strong>, focusing on teamwork dynamics, learning by doing, and leveraging failures for competitive growth.',
      type: 'Speaking',
      badge: 'Sharing Session',
      attachments: [{ name: 'Certificate', type: 'certificate', image: null }]
    },
    {
      role: 'Local Organizing Committee',
      organization: 'The Pacific Rim International Conference on Artificial Intelligence (PRICAI)',
      period: 'Nov 2023',
      duration: '1 mo',
      category: 'Science and Technology',
      description: 'Managed logistics and international delegate hospitality for the PRICAI AI conference in Jakarta.',
      type: 'Leadership',
      attachments: [
        { name: 'Farewell', type: 'farewell', image: null },
        { name: 'Certificate', type: 'certificate', image: null }
      ]
    },
    {
      role: 'Engagement with AIESEC',
      organization: 'AIESEC Universitas UI',
      period: 'Nov 2023 - Feb 2024',
      duration: '4 mos',
      category: 'Environment',
      description: 'Contributed to sustainability campaigns and team leadership workshops.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Head of Finance Department KMBUI XXXII',
      organization: 'UKM KMBUI',
      period: 'Feb 2024 - Dec 2024',
      duration: '11 mos',
      category: 'Social Services',
      description: 'Directly managed budgeting, bookkeeping, and resource allocations for the central organization.',
      type: 'Leadership',
      attachments: [{ name: 'Honorable Mention', type: 'certificate', image: null }]
    },
    {
      role: 'Deputy Head of Finance for Bakti Sosial 2024',
      organization: 'UKM KMBUI',
      period: 'Nov 2023 - May 2024',
      duration: '7 mos',
      category: 'Social Services',
      description: 'Co-managed financial distribution, purchasing logs, and health program campaign budgets.',
      type: 'Leadership',
      attachments: [
        { name: 'Product Distribution', type: 'photo', image: null },
        { name: 'Blood Pressure Checks & GCU', type: 'photo', image: null }
      ]
    },
    {
      role: 'Head of Public Relations for Vesak 2024',
      organization: 'UKM KMBUI',
      period: 'Apr 2024 - Jun 2024',
      duration: '3 mos',
      category: 'Arts and Culture',
      description: 'Led marketing, ticket distributions, and stakeholder relations for the annual cultural event.',
      type: 'Leadership',
      attachments: [{ name: 'Event Day', type: 'photo', image: null }]
    },
    {
      role: 'Staff of Partnership for Desa Binaan 2023',
      organization: 'UKM KMBUI',
      period: 'Jun 2023 - Oct 2023',
      duration: '5 mos',
      category: 'Social Services',
      description: 'Secured external sponsors and established community-driven agricultural partnerships.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Staff of Direct Marketing',
      organization: 'Pesta Rakyat Komputer',
      period: 'Mar 2023 - Sep 2023',
      duration: '7 mos',
      category: 'Arts and Culture',
      description: 'Managed sales strategies and hosted episode 1 of the NGOPREK! podcast.',
      type: 'Community',
      attachments: [{ name: 'NGOPREK! Podcast Eps 1', type: 'media', image: null }]
    },
    {
      role: 'Staff of Public Relations, Publication, Documentation, and Creative',
      organization: 'Pemira IKM Fasilkom UI',
      period: 'Jan 2023',
      duration: '1 mo',
      category: 'Politics',
      description: 'Designed candidate brochures, media publications, and voter engagement platforms.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Super Member of Data Science',
      organization: 'Google Developer Student Club Universitas UI',
      period: 'Jun 2023 - Jul 2023',
      duration: '2 mos',
      category: 'Science and Technology',
      description: 'Collaborated on ML training sessions, Kaggle dataset sprints, and python study groups.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Intern Staff at Department of Business and Partnership',
      organization: 'BEM Fakultas Ilmu Komputer Universitas UI',
      period: 'Sep 2022 - Dec 2022',
      duration: '4 mos',
      category: 'Science and Technology',
      description: 'Maintained corporate partnership outreach database and secured sponsorship pipelines.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Mentor',
      organization: 'Dasar-Dasar Pemrograman 0',
      period: 'Aug 2023 - Sep 2023',
      duration: '2 mos',
      category: 'Education',
      description: 'Coached incoming freshmen on fundamental programming concepts, Git version control, and Linux terminal operations.',
      type: 'Speaking',
      badge: 'Mentorship',
      attachments: []
    }
  ];

  // Dynamic speaking & volunteering split
  const speakingList = volunteering.filter(v => v.type === 'Speaking');
  const volunteeringList = volunteering.filter(v => v.type !== 'Speaking');

  let activeVolunteerFilter = $state('all');
  
  let filteredVolunteering = $derived(
    activeVolunteerFilter === 'all'
      ? volunteeringList
      : volunteeringList.filter(v => v.type === activeVolunteerFilter)
  );

  // Skill categories list
  const skillCategories = [
    {
      title: 'Technical Stack',
      skills: ['Python', 'SQL', 'TypeScript', 'React', 'Next.js', 'SvelteKit', 'Django', 'SpringBoot', 'Git', 'Docker', 'CI/CD', 'PostgreSQL', 'MySQL']
    },
    {
      title: 'Data & Fintech Tools',
      skills: ['Tableau', 'MoEngage', 'PostHog', 'A/B Testing', 'FinOps', 'Playwright', 'Jira', 'Excel/Sheets', 'Supabase', 'WhatsApp API']
    },
    {
      title: 'AI Tools',
      skills: ['Claude/Claude Code', 'Gemini', 'ChatGPT', 'Cline/RooCode', 'Google Stitch', 'NotebookLM']
    }
  ];

  // Languages with rating (gold coins!)
  const languages = [
    { name: 'English', flag: '🇬🇧', rating: 5, detail: 'Professional Fluency', desc: 'Duolingo Test: 140/160 (IELTS 7.5 equivalent)' },
    { name: 'Indonesian', flag: '🇮🇩', rating: 5, detail: 'Native', desc: 'Mother tongue, formal instruction' },
    { name: 'Hokkien', flag: '🇨🇳', rating: 5, detail: 'Native (Spoken)', desc: 'Ancestral spoken dialect, daily use' },
    { name: 'Mandarin', flag: '🇨🇳', rating: 2, detail: 'Elementary (HSK 2)', desc: 'Basic writing, basic conversation' }
  ];
</script>

<svelte:head>
  <title>Edward Salim | Portfolio & Fintech Workspace</title>
  <meta name="description" content="Personal portfolio and fintech workspace of Edward Salim. Information Systems at Universitas Indonesia, Automation Product Developer, and Data Science Champion." />
</svelte:head>

<style>
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    display: flex;
    width: max-content;
    animation: marquee 30s linear infinite;
  }
  .animate-marquee:hover {
    animation-play-state: paused;
  }

  @keyframes float-up-fade {
    0% {
      transform: translate(-50%, -100%) scale(0.8);
      opacity: 0;
    }
    15% {
      transform: translate(-50%, -140%) scale(1.1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -240%) scale(0.95);
      opacity: 0;
    }
  }
  .animate-float-up {
    animation: float-up-fade 1.5s ease-out forwards;
  }

  @keyframes wave-arm {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-22deg); }
  }
  .wave-arm {
    animation: wave-arm 1.4s ease-in-out infinite;
    transform-origin: 75px 75px;
  }



  .hongbao-flap {
    transition: transform 0.4s ease-in-out;
    transform-origin: top;
    backface-visibility: hidden;
  }
</style>

<!-- Global Layout Container (Luxury Fintech Theme: Charcoal & Gold/Crimson) -->
<div class="min-h-screen bg-[#0C0A09] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stone-900 via-[#0A0908] to-[#120909] font-sans text-stone-200 antialiased selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden pb-12">
  
  <!-- Subtle Chinese Clouds Overlay Pattern -->
  <div class="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-repeat" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><path d=%22M30 15c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm-15 20c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm30 0c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z%22 fill=%22%23F59E0B%22 fill-opacity=%220.6%22 fill-rule=%22evenodd%22/></svg>');"></div>

  <!-- Interactive Floating Coins Overlay -->
  {#each coins as coin (coin.id)}
    <div 
      class="fixed pointer-events-none z-50 select-none"
      style="left: {coin.x}vw; top: {coin.y}vh; width: {coin.size}px; height: {coin.size}px; transform: rotate({coin.rotation}deg); transition: transform 0.05s linear;"
    >
      <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-2xl">
        <defs>
          <radialGradient id="gold-grad-{coin.id}" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#FFE082" />
            <stop offset="35%" stop-color="#FFD54F" />
            <stop offset="75%" stop-color="#FFB300" />
            <stop offset="100%" stop-color="#FF6F00" />
          </radialGradient>
        </defs>
        <path d="M 50,5 A 45,45 0 1,0 50,95 A 45,45 0 1,0 50,5 Z M 35,35 H 65 V 65 H 35 Z" 
              fill="url(#gold-grad-{coin.id})" 
              fill-rule="evenodd" 
              stroke="#D97706" 
              stroke-width="1.5" />
        <circle cx="50" cy="50" r="37" fill="none" stroke="#FFF59D" stroke-width="0.8" stroke-dasharray="3,3" />
        <path d="M 35,35 H 65 V 65 H 35 Z" fill="none" stroke="#B45309" stroke-width="1" />
        
        <!-- Chinese Characters (Traditional Wealth Characters) -->
        <text x="50" y="24" font-family="'ZCOOL Xiaowei', serif" font-size="10.5" font-weight="bold" fill="#5D4037" text-anchor="middle">招</text>
        <text x="76" y="54.5" font-family="'ZCOOL Xiaowei', serif" font-size="10.5" font-weight="bold" fill="#5D4037" text-anchor="middle">財</text>
        <text x="50" y="84" font-family="'ZCOOL Xiaowei', serif" font-size="10.5" font-weight="bold" fill="#5D4037" text-anchor="middle">進</text>
        <text x="24" y="54.5" font-family="'ZCOOL Xiaowei', serif" font-size="10.5" font-weight="bold" fill="#5D4037" text-anchor="middle">寶</text>
      </svg>
    </div>
  {/each}

  <!-- Floating Fortune Words Container -->
  {#each clickTexts as ct (ct.id)}
    <div 
      class="fixed pointer-events-none z-50 select-none animate-float-up text-sm font-black text-amber-300 font-chinese px-3 py-1 bg-red-950/80 border border-amber-500/40 rounded-full shadow-lg"
      style="left: {ct.x}px; top: {ct.y}px; text-shadow: 0 0 8px rgba(245,158,11,0.6);"
    >
      {ct.text}
    </div>
  {/each}

  <!-- Header / Top Navigation -->
  <header class="sticky top-0 z-40 border-b border-stone-800/80 bg-[#0C0A09]/80 backdrop-blur-md">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <a href="/dashboard" class="group flex items-center gap-2">
          <img src={logoProduck} alt="Produck Logo" class="size-6 object-contain transition-transform group-hover:scale-105" />
          <span class="font-outfit text-lg font-bold tracking-wider text-amber-500 uppercase">produck</span>
        </a>
      </div>
      
      <!-- Nav Menu items -->
      <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-400">
        {#each sections as section (section.id)}
          <a href="#{section.id}" class="hover:text-amber-400 transition-colors uppercase tracking-wider">{section.label}</a>
        {/each}
      </nav>

      <!-- Auth Action -->
      <div class="flex items-center gap-4">
        {#if data.currentUser}
          <a 
            href="/dashboard" 
            class="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-stone-950 shadow-md transition-all hover:bg-amber-400 hover:scale-105 cursor-pointer"
          >
            <LayoutDashboard class="size-3.5" />
            <span>Workspace App</span>
          </a>
        {:else}
          <a 
            href="/login" 
            class="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-600 border border-amber-500/30 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:from-red-600 hover:to-red-500 hover:scale-105 cursor-pointer"
          >
            <LogIn class="size-3.5 text-amber-300" />
            <span>Workspace Sign In</span>
          </a>
        {/if}
      </div>
    </div>
  </header>
  <!-- Hero Section -->
  <section class="relative overflow-hidden px-6 pt-12 pb-8 md:pt-16 md:pb-12">
    <!-- Red & Gold Ambient glow circles -->
    <div class="absolute top-10 right-10 -z-10 size-96 rounded-full bg-amber-500/5 blur-[120px]"></div>
    <div class="absolute bottom-10 left-10 -z-10 size-96 rounded-full bg-red-600/5 blur-[120px]"></div>

    <div class="mx-auto max-w-5xl">
      <div class="grid grid-cols-1 gap-y-8 gap-x-12 md:grid-cols-12 md:items-start">
        
        <!-- Intro text (Bio & Contacts) -->
        <div class="md:col-span-7 md:row-span-2 space-y-6 text-center md:text-left order-2 md:order-1">
          <div class="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-3 py-1.5 text-xs font-semibold text-amber-400">
            <Sparkles class="size-3 text-amber-400 animate-pulse" />
            <span>Automation & Fintech Developer &middot; UI IS Student</span>
          </div>
          
          <div class="space-y-3">
            <h1 class="font-outfit text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Edward Salim <span class="font-chinese text-amber-500 text-3xl font-medium tracking-normal ml-3">叶艾德</span>
            </h1>
            
            <!-- Headline rotater / typing effect in Gold -->
            <div class="min-h-[4.5rem] sm:min-h-[3.5rem] md:min-h-[2.5rem] h-auto font-chinese text-xl font-bold text-amber-400 sm:text-2xl md:text-3xl leading-snug pb-1">
              <span>{currentRoleText}</span>
              <span class="inline-block w-0.5 h-6 ml-0.5 bg-amber-400 animate-pulse align-middle">|</span>
            </div>
          </div>
          
          <p class="font-outfit text-sm text-stone-400 sm:text-base md:max-w-lg leading-relaxed">
            Engineering robust financial pipelines, automated backoffice infrastructure, and predictive intelligence models. Ex-Intern at DANA, Indodana & Kitabisa.
          </p>

          <!-- Interactive Chinese Cat Widget embedded in Hero -->
          <div class="py-2 flex items-center justify-center md:justify-start gap-4">
            <button 
              type="button"
              class="relative flex items-center gap-3 bg-stone-900/80 border border-amber-500/30 hover:border-amber-400 rounded-2xl p-3 pr-5 text-left group transition-all hover:scale-[1.03] cursor-pointer"
              onclick={triggerFortune}
            >
              <div class="shrink-0 -mt-2 -mb-2">
                <!-- Golden Waving Cat SVG -->
                <svg viewBox="0 0 100 120" class="size-16 drop-shadow-md select-none">
                  <ellipse cx="50" cy="70" rx="35" ry="40" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5" />
                  <circle cx="50" cy="75" r="18" fill="#DC2626" stroke="#F59E0B" stroke-width="1" />
                  <text x="50" y="80" font-family="'ZCOOL Xiaowei', serif" font-weight="900" font-size="12" fill="#FBBF24" text-anchor="middle">吉</text>
                  <polygon points="20,40 30,20 40,42" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5" />
                  <polygon points="17,37 25,23 32,38" fill="#FCA5A5" />
                  <polygon points="80,40 70,20 60,42" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5" />
                  <polygon points="83,37 75,23 68,38" fill="#FCA5A5" />
                  <ellipse cx="38" cy="48" rx="3.5" ry="1.5" fill="#5D4037" />
                  <ellipse cx="62" cy="48" rx="3.5" ry="1.5" fill="#5D4037" />
                  <circle cx="32" cy="54" r="2.5" fill="#FCA5A5" opacity="0.6" />
                  <circle cx="68" cy="54" r="2.5" fill="#FCA5A5" opacity="0.6" />
                  <path d="M 47,51 Q 50,54 53,51" fill="none" stroke="#5D4037" stroke-width="1.5" />
                  <circle cx="25" cy="78" r="8" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5" />
                  <circle cx="24" cy="78" r="5" fill="#FBBF24" stroke="#D97706" stroke-width="0.5" />
                  <rect x="35" y="58" width="30" height="3" fill="#DC2626" rx="2.5" />
                  <circle cx="50" cy="61" r="3.5" fill="#F59E0B" stroke="#D97706" stroke-width="0.5" />
                  <g class="wave-arm">
                    <path d="M 72,70 C 72,60 84,40 88,44 C 92,48 82,75 80,78 Z" fill="#FFFFFF" stroke="#D97706" stroke-width="1.5" />
                    <circle cx="84" cy="48" r="5" fill="#FCA5A5" />
                  </g>
                </svg>
              </div>
              <div class="space-y-0.5">
                <span class="block text-[10px] font-bold text-amber-500 uppercase tracking-widest">Fortune Clicker</span>
                <span class="block text-xs font-semibold text-stone-200">Tap Waving Cat</span>
                <span class="block text-[9px] text-stone-500 group-hover:text-stone-300 transition-colors">Generate gold & check luck!</span>
              </div>
              <!-- Floating Coin Indicators inside button -->
              <div class="absolute -top-1 -right-1 size-5 rounded-full bg-amber-500 border border-amber-600 flex items-center justify-center text-[9px] font-bold text-amber-950 animate-bounce">🪙</div>
            </button>
          </div>

          <!-- Red Envelope (Hongbao) Contact Links -->
          <div class="pt-2">
            <span class="block text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 text-center md:text-left">Open Red Envelopes (Contact Edward)</span>
            <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full max-w-xl">
              <!-- Gmail Red Envelope -->
              <a 
                href="mailto:edwardsalim29@gmail.com" 
                class="group relative block h-36 rounded-xl bg-gradient-to-b from-red-600 to-red-800 border border-amber-500/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 [perspective:1000px]"
              >
                <!-- Flap -->
                <div class="absolute top-0 left-0 w-full h-11 bg-red-700 border-b border-amber-500/40 rounded-b-[40%] flex items-center justify-center transition-all duration-300 origin-top group-hover:[transform:rotateX(180deg)] z-20 shadow-xs">
                  <div class="size-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-600 flex items-center justify-center text-[9px] font-black text-amber-950">福</div>
                </div>
                <!-- Sliding Card -->
                <div class="absolute inset-x-2 bottom-2 top-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg border border-amber-400/40 p-2 flex flex-col items-center justify-center text-center transition-all duration-300 translate-y-6 group-hover:translate-y-0 z-10">
                  <img src={gmailSvg} alt="Gmail" class="size-4.5 object-contain" />
                  <span class="text-[9px] font-black text-amber-950 mt-1 uppercase tracking-wider">Email</span>
                  <span class="text-[8px] text-amber-800 font-medium truncate w-full">edwardsalim29</span>
                </div>
              </a>

              <!-- LinkedIn Red Envelope -->
              <a 
                href="http://linkedin.com/in/edward-salim" 
                target="_blank" 
                class="group relative block h-36 rounded-xl bg-gradient-to-b from-red-600 to-red-800 border border-amber-500/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 [perspective:1000px]"
              >
                <!-- Flap -->
                <div class="absolute top-0 left-0 w-full h-11 bg-red-700 border-b border-amber-500/40 rounded-b-[40%] flex items-center justify-center transition-all duration-300 origin-top group-hover:[transform:rotateX(180deg)] z-20 shadow-xs">
                  <div class="size-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-600 flex items-center justify-center text-[9px] font-black text-amber-950">禄</div>
                </div>
                <!-- Sliding Card -->
                <div class="absolute inset-x-2 bottom-2 top-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg border border-amber-400/40 p-2 flex flex-col items-center justify-center text-center transition-all duration-300 translate-y-6 group-hover:translate-y-0 z-10">
                  <img src={linkedinSvg} alt="LinkedIn" class="size-4.5 object-contain" />
                  <span class="text-[9px] font-black text-amber-950 mt-1 uppercase tracking-wider">LinkedIn</span>
                  <span class="text-[8px] text-amber-800 font-medium truncate w-full">edward-salim</span>
                </div>
              </a>

              <!-- GitHub Red Envelope -->
              <a 
                href="https://github.com/Edward-Salim" 
                target="_blank" 
                class="group relative block h-36 rounded-xl bg-gradient-to-b from-red-600 to-red-800 border border-amber-500/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 [perspective:1000px]"
              >
                <!-- Flap -->
                <div class="absolute top-0 left-0 w-full h-11 bg-red-700 border-b border-amber-500/40 rounded-b-[40%] flex items-center justify-center transition-all duration-300 origin-top group-hover:[transform:rotateX(180deg)] z-20 shadow-xs">
                  <div class="size-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-600 flex items-center justify-center text-[9px] font-black text-amber-950">寿</div>
                </div>
                <!-- Sliding Card -->
                <div class="absolute inset-x-2 bottom-2 top-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg border border-amber-400/40 p-2 flex flex-col items-center justify-center text-center transition-all duration-300 translate-y-6 group-hover:translate-y-0 z-10">
                  <img src={githubSvg} alt="GitHub" class="size-4.5 object-contain" />
                  <span class="text-[9px] font-black text-amber-950 mt-1 uppercase tracking-wider">GitHub</span>
                  <span class="text-[8px] text-amber-800 font-medium truncate w-full">Edward-Salim</span>
                </div>
              </a>

              <!-- WhatsApp Red Envelope -->
              <a 
                href="https://wa.me/6281287784722" 
                target="_blank" 
                class="group relative block h-36 rounded-xl bg-gradient-to-b from-red-600 to-red-800 border border-amber-500/30 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 [perspective:1000px]"
              >
                <!-- Flap -->
                <div class="absolute top-0 left-0 w-full h-11 bg-red-700 border-b border-amber-500/40 rounded-b-[40%] flex items-center justify-center transition-all duration-300 origin-top group-hover:[transform:rotateX(180deg)] z-20 shadow-xs">
                  <div class="size-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border border-amber-600 flex items-center justify-center text-[9px] font-black text-amber-950">喜</div>
                </div>
                <!-- Sliding Card -->
                <div class="absolute inset-x-2 bottom-2 top-6 bg-gradient-to-b from-amber-50 to-amber-100 rounded-lg border border-amber-400/40 p-2 flex flex-col items-center justify-center text-center transition-all duration-300 translate-y-6 group-hover:translate-y-0 z-10">
                  <img src={whatsappSvg} alt="WhatsApp" class="size-4.5 object-contain" />
                  <span class="text-[9px] font-black text-amber-950 mt-1 uppercase tracking-wider">WhatsApp</span>
                  <span class="text-[8px] text-amber-800 font-medium truncate w-full">+62812877...</span>
                </div>
              </a>
            </div>
            
            <div class="pt-3 text-center md:text-left">
              <a 
                href="https://drive.google.com/drive/folders/1luBgBfofDLsz1ZGwvQV0p1uGGDH_lB4-?usp=sharing" 
                target="_blank"
                class="inline-flex items-center gap-2 text-xs font-bold text-amber-500 transition-colors hover:text-amber-400 hover:underline"
              >
                <FileText class="size-3.5" />
                <span>View Google Drive Credentials Folder</span>
                <ArrowUpRight class="size-3" />
              </a>
            </div>
          </div>
        </div>

        <!-- Photo Avatar with Gold Border Frame -->
        <div class="md:col-span-5 md:col-start-8 md:row-start-1 flex justify-center md:justify-end order-1 md:order-2">
          <div class="relative shrink-0 select-none w-fit">
            <div class="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-200 to-amber-500 opacity-30 blur-xl"></div>
            <div class="relative p-1.5 rounded-2xl bg-gradient-to-tr from-amber-50 via-amber-200 to-amber-600 shadow-xl shadow-amber-500/10">
              <img 
                src={edwardAvatar} 
                alt="Edward Salim" 
                class="size-44 rounded-xl object-cover sm:size-52 md:size-60 border border-stone-900" 
              />
              
              <!-- Traditional Ornaments on Photo Corners -->
              <div class="absolute top-3 left-3 size-3.5 border-t border-l border-amber-300"></div>
              <div class="absolute top-3 right-3 size-3.5 border-t border-r border-amber-300"></div>
              <div class="absolute bottom-3 left-3 size-3.5 border-b border-l border-amber-300"></div>
              <div class="absolute bottom-3 right-3 size-3.5 border-b border-r border-amber-300"></div>
              
              <!-- Decorative ancient coins overlapping photo -->
              <div class="absolute -top-3 -left-3 size-7 bg-amber-500 rounded-full border border-amber-600 shadow-lg flex items-center justify-center text-[10px] font-black text-amber-950">福</div>
              <div class="absolute -bottom-3 -right-3 size-7 bg-amber-500 rounded-full border border-amber-600 shadow-lg flex items-center justify-center text-[10px] font-black text-amber-950">禄</div>
            </div>
          </div>
        </div>

        <!-- Interactive Terminal (Fintech Wealth Ledger Edition) -->
        <div class="md:col-span-5 md:col-start-8 md:row-start-2 order-3 md:order-3 w-full">
          <div class="rounded-2xl border border-stone-800 bg-[#0A0908] shadow-2xl overflow-hidden font-mono text-stone-300">
            <!-- Window Titlebar -->
            <div class="bg-[#141211] border-b border-stone-800/80 px-4 py-2.5 flex items-center justify-between">
              <div class="flex items-center gap-1">
                <div class="size-2 rounded-full bg-red-600/80"></div>
                <div class="size-2 rounded-full bg-amber-500/80"></div>
                <div class="size-2 rounded-full bg-stone-700"></div>
              </div>
              <div class="flex items-center gap-1.5 text-stone-500 text-[10px] font-semibold select-none">
                <TerminalIcon class="size-3 text-amber-500/60" />
                <span>visitor@edward-salim: ~/wealth-ledger (zsh)</span>
              </div>
              <div class="w-8"></div> 
            </div>
            
            <!-- Terminal Output Terminal Log -->
            <div 
              bind:this={terminalContainer}
              class="h-44 overflow-y-auto p-4 text-[11px] leading-normal space-y-2 select-text"
            >
              <!-- Welcome ASCII Coin -->
              <div class="text-amber-500/80 text-[9px] leading-none mb-2 whitespace-pre select-none font-bold">
{`      💰 EDWARD SALIM'S FINTECH LEDGER 💰
          .----------------.
         /     招 財 進 寶     \\
        |    '----------'    |
         \\   FINTECH ENGINE  /
          '----------------'`}
              </div>
              
              {#each terminalHistory as log, i (i)}
                {#if log.type === 'input'}
                  <div class="text-amber-400 font-bold">{log.text}</div>
                {:else}
                  <div class="whitespace-pre-wrap text-stone-300">{log.text}</div>
                {/if}
              {/each}
            </div>

            <!-- Input Form -->
            <form 
              onsubmit={handleTerminalSubmit}
              class="bg-[#0e0c0b] border-t border-stone-850 px-4 py-2 flex items-center gap-2"
            >
              <span class="text-red-500 font-bold shrink-0 select-none text-[10px]">visitor:~$</span>
              <input 
                type="text" 
                bind:value={terminalInput}
                placeholder='Type command (e.g. "help", "experience")...'
                class="flex-1 bg-transparent border-none text-stone-200 outline-none placeholder-stone-700 focus:ring-0 p-0 text-[11px] font-mono"
                autocomplete="off"
                spellcheck="false"
              />
              <button 
                type="submit" 
                class="bg-stone-900 hover:bg-stone-850 hover:text-amber-400 text-stone-400 text-[9px] font-semibold px-2 py-0.5 rounded border border-stone-800 cursor-pointer transition-colors"
              >
                Run
              </button>
            </form>
          </div>
        </div>

      </div>

      <!-- Quick Stats Dashboard (Styled as Gold Bullion Boxes) -->
      <div class="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {#each stats as stat (stat.label)}
          <div class="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-700/5 p-5 shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:border-amber-400/50 hover:shadow-amber-500/5 group">
            
            <!-- Shimmer effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div class="flex items-start justify-between">
              <span class="font-outfit text-2xl font-black text-amber-400 sm:text-3xl tracking-tight">{stat.value}</span>
              <span class="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp class="size-2.5" />
                {stat.positive}
              </span>
            </div>
            
            <p class="mt-2 text-[10px] font-black uppercase tracking-widest text-stone-400">{stat.label}</p>
            <p class="mt-0.5 text-xs text-stone-500 leading-snug">{stat.detail}</p>
            
            <!-- Mini graph background SVG -->
            <div class="absolute bottom-0 right-0 w-24 h-8 opacity-10 pointer-events-none">
              <svg viewBox="0 0 100 30" fill="none" class="w-full h-full text-amber-400">
                <path d="M0,25 Q15,20 30,22 T60,10 T90,5 L100,5 L100,30 L0,30 Z" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Infinite Skill Marquee Ticker -->
  <section class="w-full overflow-hidden border-y border-stone-850 bg-stone-900/40 backdrop-blur-xs py-4">
    <div class="animate-marquee gap-8 items-center">
      <!-- Normal list -->
      {#each marqueeSkills as skill (skill.name)}
        <span class="text-xs font-bold font-outfit uppercase tracking-widest text-stone-500 flex items-center gap-2 hover:text-amber-400 transition-colors">
          <img src={skill.icon} alt={skill.name} class="size-4.5 object-contain opacity-75 group-hover:opacity-100" />
          {skill.name}
        </span>
      {/each}
      <!-- Duplicate list for looping -->
      {#each marqueeSkills as skill (`dup-${skill.name}`)}
        <span class="text-xs font-bold font-outfit uppercase tracking-widest text-stone-500 flex items-center gap-2 hover:text-amber-400 transition-colors">
          <img src={skill.icon} alt={skill.name} class="size-4.5 object-contain opacity-75 group-hover:opacity-100" />
          {skill.name}
        </span>
      {/each}
    </div>
  </section>

  <!-- Main Content Grid -->
  <main class="mx-auto max-w-5xl px-6 py-12 space-y-16">

    <!-- Education Section (Styled as Scholarship Decree) -->
    <section id="education" class="scroll-mt-24 space-y-6">
      <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
        <GraduationCap class="size-6 text-amber-500" />
        <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
          Education Credentials <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">学历</span>
        </h2>
      </div>

      <!-- Scholarly Decree Box -->
      <div class="relative overflow-hidden rounded-2xl border-2 border-amber-600/40 bg-gradient-to-br from-[#181514] to-[#120F0E] p-6 md:p-8 shadow-xl">
        <!-- Golden Corner Brackets -->
        <div class="absolute top-2 left-2 size-5 border-t-2 border-l-2 border-amber-500/70"></div>
        <div class="absolute top-2 right-2 size-5 border-t-2 border-r-2 border-amber-500/70"></div>
        <div class="absolute bottom-2 left-2 size-5 border-b-2 border-l-2 border-amber-500/70"></div>
        <div class="absolute bottom-2 right-2 size-5 border-b-2 border-r-2 border-amber-500/70"></div>

        <!-- Large watermark Chinese character "学" (Study) in background -->
        <div class="absolute right-8 bottom-4 text-amber-500/5 select-none pointer-events-none text-9xl font-chinese font-bold leading-none">学</div>

        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start relative z-10">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <span class="rounded bg-red-950/60 border border-red-500/30 text-amber-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">Scholarship Recipient</span>
              <span class="text-xs text-stone-500">Universitas Indonesia</span>
            </div>
            
            <h3 class="font-outfit text-xl font-bold text-white sm:text-2xl">Universitas Indonesia</h3>
            <p class="text-sm font-semibold text-amber-400">Bachelor of Computer Science &middot; Information Systems Major</p>
            <p class="text-sm text-stone-400">GPA: <span class="font-bold text-stone-200">3.57 / 4.00</span> &middot; 8th Semester (Final Year)</p>
            
            <ul class="mt-4 list-disc pl-5 space-y-2.5 text-xs text-stone-400 md:max-w-xl">
              <li>
                <strong>2nd Place</strong> - Most Outstanding Student of Faculty of Computer Science (Pilmapres Fasilkom UI, 2025).
              </li>
              <li>
                <strong>Full Tuition Scholarship</strong> recipient, awarded by the Indonesian Ministry of Education and Culture.
              </li>
            </ul>
          </div>
          
          <div class="shrink-0 text-left md:text-right">
            <span class="inline-block rounded-full bg-stone-900 border border-stone-800 px-3 py-1 text-xs font-bold text-stone-400">
              Jul 2022 - Jul 2026 (expected)
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience Section (Interactive Digital Wallet & Credit Cards) -->
    <section id="experience" class="scroll-mt-24 space-y-6">
      <div class="flex items-center justify-between border-b border-stone-800 pb-3">
        <div class="flex items-center gap-3">
          <Briefcase class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
            Digital Wallet & Experience <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">经历</span>
          </h2>
        </div>
        <span class="text-xs text-stone-500 max-md:hidden font-mono">Toggle cards to view credentials</span>
      </div>

      <!-- Digital Credit Cards Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {#each experiences as exp, idx (exp.company)}
          {@const isActive = activeExperienceIndex === idx}
          <!-- Credit Card Component -->
          <button 
            type="button"
            class="group w-full h-48 rounded-xl bg-gradient-to-tr {exp.cardTheme} border border-amber-500/20 text-left relative overflow-hidden p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-400/50 cursor-pointer shadow-lg {isActive ? 'ring-2 ring-amber-400 scale-[1.02]' : 'opacity-85'}"
            onclick={() => activeExperienceIndex = idx}
          >
            <!-- Card Shimmer & Holographic lines -->
            <div class="absolute inset-0 bg-linear-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <!-- Traditional Chinese cloud pattern in the red card -->
            {#if exp.company === 'Desa Binaan UKM KMBUI'}
              <div class="absolute inset-0 opacity-10 pointer-events-none bg-repeat" style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22><path d=%22M15 5c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5 3.5-1.5 3.5-3.5S17 5 15 5z%22 fill=%22%23FFF%22/></svg>');"></div>
            {/if}

            <div class="flex items-start justify-between w-full relative z-10">
              <div class="space-y-0.5">
                <span class="block text-[8px] font-black uppercase tracking-widest text-amber-300 opacity-90">{exp.industry}</span>
                <h3 class="font-outfit text-base font-black text-white">{exp.company}</h3>
              </div>
              
              <!-- Card Logo or Initials -->
              {#if exp.logo}
                <div class="size-8 overflow-hidden rounded bg-white/10 p-1 flex items-center justify-center backdrop-blur-xs border border-white/10">
                  <img src={exp.logo} alt={exp.company} class="size-full object-contain filter brightness-100" />
                </div>
              {:else}
                <div class="size-8 rounded bg-white/10 flex items-center justify-center text-white font-outfit font-black text-sm border border-white/10">
                  {exp.company.charAt(0)}
                </div>
              {/if}
            </div>

            <!-- Card Chip & Signal symbol -->
            <div class="flex items-center gap-3 relative z-10 opacity-70">
              <!-- Golden Chip -->
              <div class="w-7 h-5 rounded bg-gradient-to-r from-amber-400 to-amber-300 border border-amber-600 flex flex-col justify-around p-0.5">
                <div class="h-0.5 w-full bg-amber-700/40"></div>
                <div class="h-0.5 w-full bg-amber-700/40"></div>
                <div class="h-0.5 w-full bg-amber-700/40"></div>
              </div>
              <!-- Contactless symbol -->
              <svg class="size-4 text-stone-200/60 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div class="relative z-10 flex items-end justify-between w-full">
              <div class="space-y-0.5">
                <p class="text-[9px] font-black text-white/80 uppercase tracking-widest truncate max-w-[120px]">{exp.role}</p>
                <p class="text-[8px] font-mono text-white/50 tracking-tight">{exp.period}</p>
              </div>
              <span class="text-[9px] font-black uppercase text-amber-300 bg-black/30 border border-white/10 px-2 py-0.5 rounded">Credentials</span>
            </div>
          </button>
        {/each}
      </div>

      <!-- Experience Bullets Container (Revealed like a Ledger/Receipt statement) -->
      {#if activeExperienceIndex >= 0 && activeExperienceIndex < experiences.length}
        {@const selectedExp = experiences[activeExperienceIndex]}
        <div class="rounded-2xl border border-amber-500/20 bg-[#141211] p-6 md:p-8 shadow-xl mt-6 relative animate-fade-in duration-300">
          
          <!-- Golden Corner Brackets -->
          <div class="absolute top-2 left-2 size-3.5 border-t border-l border-amber-500/40"></div>
          <div class="absolute top-2 right-2 size-3.5 border-t border-r border-amber-500/40"></div>
          <div class="absolute bottom-2 left-2 size-3.5 border-b border-l border-amber-500/40"></div>
          <div class="absolute bottom-2 right-2 size-3.5 border-b border-r border-amber-500/40"></div>

          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-850 pb-4 mb-5">
            <div>
              <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Financial Ledger Statement</span>
              <h4 class="font-outfit text-lg font-bold text-white">{selectedExp.company} &middot; {selectedExp.role}</h4>
            </div>
            <span class="text-xs font-mono font-bold text-stone-400 bg-stone-900 border border-stone-800 px-3 py-1 rounded-full uppercase tracking-wider">{selectedExp.period}</span>
          </div>

          <ul class="list-disc pl-5 space-y-4 text-sm text-stone-300">
            {#each selectedExp.bullets as bullet, idx (idx)}
              <li class="leading-relaxed">{@html bullet}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </section>

    <!-- Speaking Section (VIP Presenter Passes) -->
    <section id="speaking" class="scroll-mt-24 space-y-6">
      <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
        <Mic class="size-6 text-amber-500" />
        <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
          Public Speaking & Keynotes <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">演讲与分享</span>
        </h2>
      </div>

      <!-- Presenter Pass list -->
      <div class="space-y-6">
        {#each speakingList as item, idx (item.role + item.organization + item.period)}
          <div class="relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-r from-stone-900 via-stone-950/90 to-stone-900 p-6 flex flex-col justify-between md:flex-row gap-6 shadow-md hover:border-amber-400/50 hover:shadow-lg transition-all duration-300 group">
            
            <!-- Shimmer effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <!-- Left Side: Ticket Main Info -->
            <div class="flex-1 space-y-3 relative z-10">
              <div class="flex items-center gap-2">
                <span class="rounded bg-red-950 border border-red-800/40 px-2.5 py-0.5 text-[9px] font-black text-amber-400 uppercase tracking-widest">
                  {item.badge || item.type}
                </span>
                <span class="text-xs text-stone-500 font-mono">{item.period}</span>
              </div>
              <h3 class="font-outfit text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                {item.role}
              </h3>
              <p class="text-xs font-semibold text-amber-500/80">{item.organization}</p>
              <p class="text-xs leading-relaxed text-stone-400">{@html item.description}</p>
            </div>
            
            <!-- Ticket perforation divider (dashed line) -->
            <div class="hidden md:flex flex-col items-center justify-between py-2 relative shrink-0">
              <!-- Top punch circle -->
              <div class="absolute -top-9 size-6 rounded-full bg-[#0C0A09] border border-amber-500/20 group-hover:border-amber-400/50 z-30"></div>
              <div class="w-px h-full border-r border-dashed border-stone-800"></div>
              <!-- Bottom punch circle -->
              <div class="absolute -bottom-9 size-6 rounded-full bg-[#0C0A09] border border-amber-500/20 group-hover:border-amber-400/50 z-30"></div>
            </div>
            
            <!-- Right Side: Ticket Stub (Metadata & Action) -->
            <div class="w-full md:w-44 flex flex-col justify-center items-center text-center p-4 bg-stone-900/40 border border-stone-800/40 rounded-lg relative overflow-hidden shrink-0 z-10">
              <Mic class="size-6 text-amber-500/80 mb-2" />
              <span class="text-[9px] font-black text-stone-500 uppercase tracking-widest">
                {item.role === 'Mentor' ? 'Program Mentor' : 'Guest Speaker'}
              </span>
              <span class="text-xs font-bold text-stone-300 mt-1">
                {item.role === 'Mentor' ? '2-Month Term' : 'One-Time Event'}
              </span>
              
              {#if item.attachments && item.attachments.length > 0}
                {#each item.attachments as att, attIdx (attIdx)}
                  {#if att.image}
                    <button 
                      type="button"
                      class="mt-3 inline-flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer"
                      onclick={() => openLightbox(att.image || '', `${item.role} @ ${item.organization} - ${att.name}`)}
                    >
                      <span>View Credentials</span>
                      <ArrowUpRight class="size-3" />
                    </button>
                  {:else}
                    <span class="mt-3 text-[9px] text-stone-500 uppercase font-bold bg-stone-900 border border-stone-800 px-2 py-0.5 rounded">
                      {att.name} Verified
                    </span>
                  {/if}
                {/each}
              {:else}
                <span class="mt-3 text-[9px] text-stone-600 uppercase font-bold">Verified Speaker</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Volunteering Section (Red Lacquer Card Grid) -->
    <section id="volunteering" class="scroll-mt-24 space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stone-800 pb-3">
        <div class="flex items-center gap-3">
          <Heart class="size-6 text-red-500 animate-pulse" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
            Volunteering & Leadership <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">志愿与领导力</span>
          </h2>
        </div>
        
        <!-- Filter Pills -->
        <div class="flex flex-wrap gap-1.5">
          <button 
            type="button"
            class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer {activeVolunteerFilter === 'all' ? 'bg-red-700 border-red-600 text-white shadow-md shadow-red-950' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
            onclick={() => activeVolunteerFilter = 'all'}
          >
            All
          </button>

          <button 
            type="button"
            class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer {activeVolunteerFilter === 'Leadership' ? 'bg-red-700 border-red-600 text-white shadow-md shadow-red-950' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
            onclick={() => activeVolunteerFilter = 'Leadership'}
          >
            Leadership
          </button>
          <button 
            type="button"
            class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer {activeVolunteerFilter === 'Community' ? 'bg-red-700 border-red-600 text-white shadow-md shadow-red-950' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
            onclick={() => activeVolunteerFilter = 'Community'}
          >
            Community
          </button>
        </div>
      </div>

      <!-- Volunteer Card Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each filteredVolunteering as item (item.role + item.organization + item.period)}
          <!-- Crimson Lacquer styled card -->
          <div class="group flex flex-col justify-between rounded-xl border border-red-950/60 bg-stone-950 p-6 shadow-md hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-red-950/30 transition-all duration-300 relative overflow-hidden">
            
            <!-- Small Red Knot indicator/icon overlay -->
            <div class="absolute top-2.5 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <span class="text-sm">🏮</span>
            </div>

            <div class="space-y-3">
              <div class="flex items-start justify-between gap-2">
                <span class="rounded bg-red-950 border border-red-800/40 px-2 py-0.5 text-[8px] font-black text-red-400 uppercase tracking-widest">
                  {item.category}
                </span>
                <span class="text-[9px] text-stone-500 font-mono font-medium">
                  {item.period}
                </span>
              </div>
              
              <div class="space-y-1">
                <h3 class="font-outfit text-sm font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
                  {item.role}
                </h3>
                <p class="text-xs font-semibold text-stone-400">
                  {item.organization}
                </p>
              </div>
              
              {#if item.description}
                <p class="text-[11px] leading-relaxed text-stone-500">
                  {@html item.description}
                </p>
              {/if}
            </div>

            <!-- Attachments & Metadata -->
            {#if item.attachments && item.attachments.length > 0}
              <div class="mt-4 pt-3 border-t border-stone-850 flex flex-wrap gap-1.5">
                {#each item.attachments as att, idx (idx)}
                  {#if att.image}
                    <button 
                      type="button" 
                      class="inline-flex items-center gap-1 rounded bg-stone-900 border border-stone-800 px-2 py-0.5 text-[9px] font-bold text-amber-500 hover:text-amber-400 transition-colors cursor-zoom-in"
                      onclick={() => openLightbox(att.image || '', `${item.role} @ ${item.organization} - ${att.name}`)}
                    >
                      <span>📎</span>
                      <span>{att.name}</span>
                    </button>
                  {:else}
                    <span class="inline-flex items-center gap-1 rounded bg-stone-900 border border-stone-850 px-2 py-0.5 text-[9px] font-medium text-stone-600 select-none">
                      <span>📎</span>
                      <span>{att.name}</span>
                    </span>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Projects Section (Interactive Filters) -->
    <section id="projects" class="scroll-mt-24 space-y-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-stone-800 pb-3">
        <div class="flex items-center gap-3">
          <Code class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
            Featured Projects <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">项目作品</span>
          </h2>
        </div>
        
        <!-- Category Filter Pills -->
        <div class="flex flex-wrap gap-1.5">
          <button 
            type="button"
            class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer {activeProjectFilter === 'all' ? 'bg-amber-500 border-amber-600 text-stone-950 shadow-md' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
            onclick={() => activeProjectFilter = 'all'}
          >
            All
          </button>
          <button 
            type="button"
            class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer {activeProjectFilter === 'product' ? 'bg-amber-500 border-amber-600 text-stone-950 shadow-md' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
            onclick={() => activeProjectFilter = 'product'}
          >
            Products & Systems
          </button>
          <button 
            type="button"
            class="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer {activeProjectFilter === 'data' ? 'bg-amber-500 border-amber-600 text-stone-950 shadow-md' : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
            onclick={() => activeProjectFilter = 'data'}
          >
            Data & Analytics
          </button>
        </div>
      </div>

      <!-- Filtered Project Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        {#each filteredProjects as project (project.title)}
          <div class="flex flex-col justify-between rounded-2xl border transition-all duration-300 {project.isSelf ? 'border-amber-500/35 bg-stone-900/40' : 'border-stone-800/80 bg-stone-950'} overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl hover:border-amber-500/50">
            {#if project.image}
              <button 
                type="button"
                class="h-40 w-full overflow-hidden border-b border-stone-850 bg-stone-900/50 text-left focus:outline-none cursor-zoom-in"
                onclick={() => openLightbox(project.image, project.title)}
              >
                <img src={project.image} alt={project.title} class="size-full object-cover transition-transform duration-500 hover:scale-105" />
              </button>
            {/if}
            <div class="p-6 flex-1 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-start justify-between gap-1">
                  <h3 class="font-outfit text-base font-bold text-white">{project.title}</h3>
                  <span class="rounded bg-red-950 border border-red-800/35 px-2 py-0.5 text-[8px] font-black text-amber-400 uppercase tracking-widest shrink-0">{project.tag}</span>
                </div>
                <p class="text-xs leading-relaxed text-stone-400">{project.description}</p>
              </div>
            
              <div class="mt-6 space-y-4">
                <div class="flex flex-wrap gap-1.5">
                  {#each project.tech as tech (tech)}
                    <span class="rounded bg-stone-900 border border-stone-850 px-2 py-0.5 text-[9px] font-bold text-stone-500">{tech}</span>
                  {/each}
                </div>

                {#if project.isSelf}
                  {#if data.currentUser}
                    <a 
                      href="/dashboard"
                      class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 py-2 text-center text-xs font-bold text-stone-950 shadow-md transition-all hover:bg-amber-400 cursor-pointer"
                    >
                      <span>Launch Workspace</span>
                      <ArrowUpRight class="size-3.5" />
                    </a>
                  {:else}
                    <a 
                      href="/login"
                      class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-stone-800 border border-stone-700 py-2 text-center text-xs font-bold text-stone-200 shadow-md transition-all hover:bg-stone-700 cursor-pointer"
                    >
                      <span>Login to Workspace</span>
                      <ArrowUpRight class="size-3.5 text-amber-400" />
                    </a>
                  {/if}
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Awards Section (Decorated Trophies & Medallions) -->
    <section id="awards" class="scroll-mt-24 space-y-6">
      <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
        <Trophy class="size-6 text-amber-500" />
        <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
          Awards & Competition Records <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">荣誉奖项</span>
        </h2>
      </div>

      <!-- Awards Card Grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each awards as award (award.competition)}
          <div class="group flex flex-col justify-between rounded-xl border border-stone-850 bg-stone-950 overflow-hidden shadow-lg hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-amber-500/5 transition-all duration-300">
            <!-- Card Media (Image or gold medallion vector) -->
            <button
              type="button"
              class="w-full h-44 overflow-hidden bg-[#141211] relative flex items-center justify-center text-left focus:outline-none cursor-zoom-in"
              onclick={() => openLightbox(award.image || '', `${award.competition} - ${award.title}`)}
              disabled={!award.image}
            >
              {#if award.image}
                <img src={award.image} alt={award.competition} class="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
              {:else}
                <!-- Beautiful vector gold coin / medal outline with red ribbon in background -->
                <div class="size-full bg-gradient-to-br from-red-950/20 to-amber-950/30 flex flex-col items-center justify-center gap-3 p-4 text-center">
                  <!-- Ribbon vector -->
                  <div class="absolute top-0 w-8 h-20 bg-gradient-to-b from-red-700 to-red-900 border-x border-amber-500/20 rounded-b opacity-80 z-0"></div>
                  <!-- Golden Seal Medallion -->
                  <div class="size-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 border border-amber-600 flex items-center justify-center shadow-lg relative z-10 animate-pulse">
                    <Trophy class="size-8 text-amber-950" />
                  </div>
                  <span class="text-[9px] font-black text-amber-400 uppercase tracking-widest relative z-10 bg-black/40 px-2 py-0.5 rounded border border-amber-500/10">Fintech Distinction</span>
                </div>
              {/if}
              
              <!-- Floating Badges -->
              <div class="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none z-10">
                <span class="rounded bg-red-700 border border-amber-500/35 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                  {award.title}
                </span>
                <span class="rounded bg-stone-900 border border-stone-800 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-400 shadow-lg">
                  {award.scope}
                </span>
              </div>
            </button>

            <!-- Card Content -->
            <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-1.5">
                <h3 class="font-outfit text-sm font-bold text-stone-200 line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                  {award.competition}
                </h3>
                <p class="text-xs text-stone-500 font-semibold">
                  {award.organizer}
                </p>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-stone-850 text-xs text-stone-500">
                <span class="font-mono">{award.year}</span>
                {#if award.image}
                  <span class="text-amber-500 font-bold group-hover:underline flex items-center gap-1">
                    View Certificate
                    <ArrowUpRight class="size-3" />
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </section>

    <!-- Mahogany Digital Bookshelf -->
    <section id="bookshelf" class="scroll-mt-24 space-y-6">
      <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
        <BookOpen class="size-6 text-amber-500" />
        <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
          Edward's Digital Bookshelf <span class="font-chinese text-amber-500/80 font-normal text-lg ml-2">书架</span>
        </h2>
      </div>
      
      <p class="text-xs text-stone-400 max-w-xl">
        Curated product management and execution literature. Hover over covers to inspect key takeaways.
      </p>

      <!-- Mahogany Book Rack grid -->
      <div class="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-4 pt-6">
        {#each bookshelf as book (book.title)}
          <div class="group flex flex-col items-center text-center space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-900 hover:bg-stone-900/60 hover:shadow-2xl transition-all relative">
            
            <!-- 3D Book Cover Frame -->
            <div class="relative w-24 h-36 shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 [perspective:1000px]">
              <img 
                src="/covers/{book.cover}" 
                alt="{book.title} cover"
                class="w-full h-full object-cover rounded-sm border border-stone-800 shadow-md"
              />
              <!-- Bookmark Ribbons -->
              <div class="absolute top-0 right-3 w-1.5 h-10 bg-red-600 rounded-b shadow-xs"></div>
            </div>
            
            <div class="space-y-1 relative z-10">
              <h4 class="font-outfit text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{book.title}</h4>
              <p class="text-[9px] text-stone-500 font-semibold">{book.author}</p>
              <p class="text-[9px] text-stone-400 italic leading-snug line-clamp-3 pt-1.5 border-t border-stone-900 mt-1.5">"{book.takeaway}"</p>
            </div>
          </div>
        {/each}
      </div>
      <!-- Mahogany Shelf Line -->
      <div class="w-full h-3 bg-[#3A2218] border-b-2 border-amber-600/30 rounded shadow-md relative">
        <div class="absolute -top-1.5 left-1/4 w-4 h-1.5 bg-amber-500 rounded-full opacity-60"></div>
        <div class="absolute -top-1.5 right-1/4 w-4 h-1.5 bg-amber-500 rounded-full opacity-60"></div>
      </div>
    </section>

    <!-- Skills & Language Details -->
    <section class="grid grid-cols-1 gap-8 md:grid-cols-3">
      
      <!-- Skills -->
      <div class="md:col-span-2 space-y-6">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <Wrench class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Skills & Tooling</h2>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {#each skillCategories as cat (cat.title)}
            <div class="rounded-2xl border border-stone-850 bg-stone-950 p-5 space-y-4">
              <h3 class="font-outfit text-xs font-black uppercase tracking-wider text-amber-500">{cat.title}</h3>
              <div class="flex flex-wrap gap-1.5">
                {#each cat.skills as skill (skill)}
                  <span class="rounded bg-stone-900 border border-stone-850 px-2 py-1 text-xs text-stone-300 flex items-center gap-1.5">
                    {#if skillIconMap[skill]}
                      <img src={skillIconMap[skill]} alt={skill} class="size-3.5 object-contain" />
                    {/if}
                    {skill}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Languages with coin scores rating -->
      <div class="space-y-6">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <Languages class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Languages</h2>
        </div>

        <div class="rounded-2xl border border-stone-850 bg-stone-950 p-6 space-y-5">
          {#each languages as lang (lang.name)}
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-bold text-white flex items-center gap-2">
                  <span class="text-base select-none">{lang.flag}</span> {lang.name}
                </span>
                <span class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{lang.detail}</span>
              </div>
              <p class="text-[10px] text-stone-500">{lang.desc}</p>
              
              <!-- Gold Coin rating rating progress -->
              <div class="flex items-center gap-1 pt-1">
                {#each Array(5) as _, i (i)}
                  {#if i < lang.rating}
                    <!-- Active Gold Coin -->
                    <svg class="size-4 text-amber-400 drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="45" fill="#F59E0B" stroke="#B45309" stroke-width="2" />
                      <rect x="35" y="35" width="30" height="30" fill="#0C0A09" stroke="#B45309" stroke-width="1.5" />
                    </svg>
                  {:else}
                    <!-- Inactive Muted Coin -->
                    <svg class="size-4 text-stone-800" viewBox="0 0 100 100" fill="currentColor">
                      <circle cx="50" cy="50" r="45" fill="#1C1917" stroke="#292524" stroke-width="2" />
                      <rect x="35" y="35" width="30" height="30" fill="#0C0A09" stroke="#292524" stroke-width="1.5" />
                    </svg>
                  {/if}
                {/each}
              </div>
            </div>
            {#if lang.name !== 'Mandarin'}
              <div class="border-t border-stone-850/50"></div>
            {/if}
          {/each}
        </div>
      </div>

    </section>

  </main>

  <!-- Footer (Cleaned Layout) -->
  <footer class="border-t border-stone-900 bg-[#070605] py-8 text-center text-xs text-stone-500">
    <div class="mx-auto max-w-5xl px-6 space-y-2 select-none">
      <p>&copy; {new Date().getFullYear()} Edward Salim. Built with SvelteKit & SQLite.</p>
    </div>
  </footer>

</div>

{#if lightboxOpen}
  <!-- Lightbox Backdrop -->
  <div 
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 transition-all duration-300 backdrop-blur-md"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="button"
    tabindex="0"
  >
    <!-- Close Button -->
    <button 
      type="button"
      class="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors focus:outline-none cursor-pointer"
      onclick={closeLightbox}
    >
      <span class="sr-only">Close</span>
      <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Modal Content -->
    <div class="max-w-4xl max-h-[80vh] overflow-hidden rounded-xl border border-white/10 bg-stone-950 shadow-2xl transition-transform duration-300 scale-100">
      <img src={lightboxImage} alt={lightboxTitle} class="max-h-[75vh] w-auto max-w-full object-contain mx-auto" />
    </div>
    
    <div class="mt-4 text-center select-none">
      <p class="font-outfit text-sm font-semibold text-white">{lightboxTitle}</p>
      <p class="text-xs text-stone-400 mt-1">Click anywhere outside to close</p>
    </div>
  </div>
{/if}
