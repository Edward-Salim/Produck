<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { reveal } from '$lib/actions/reveal';
  import { getLastAppPagePath } from '$lib/client/last-app-page.js';
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
    BookOpen,
    Heart,
    Mic
  } from '@lucide/svelte';

  // Static assets & SVGs from SVGL CLI
  import edwardAvatar from '$lib/assets/edward.jpg?enhanced';
  import logoProduck from '$lib/assets/logo-produck.png?enhanced';
  import logoProduckIcon from '$lib/assets/logo-produck.png';
  import linkedinSvg from '$lib/assets/tech/linkedin.svg';
  import githubSvg from '$lib/assets/tech/github_light.svg';
  import pythonSvg from '$lib/assets/tech/python.svg';
  import typescriptSvg from '$lib/assets/tech/typescript.svg';
  import svelteSvg from '$lib/assets/tech/svelte.svg';
  import postgresqlSvg from '$lib/assets/tech/postgresql.svg';
  import dockerSvg from '$lib/assets/tech/docker.svg';
  import djangoSvg from '$lib/assets/tech/django.svg';
  import gitSvg from '$lib/assets/tech/git.svg';
  import springSvg from '$lib/assets/tech/spring.svg';
  import reactSvg from '$lib/assets/tech/react_dark.svg';
  import instagramSvg from '$lib/assets/tech/instagram.svg';
  import nextjsSvg from '$lib/assets/tech/nextjs_icon_dark.svg';
  import mysqlSvg from '$lib/assets/tech/mysql-icon-dark.svg';
  import sqliteSvg from '$lib/assets/tech/sqlite.svg';
  import posthogSvg from '$lib/assets/tech/posthog.svg';
  import playwrightSvg from '$lib/assets/tech/playwright.svg';
  import atlassianSvg from '$lib/assets/tech/atlassian.svg';
  import sheetsSvg from '$lib/assets/tech/google-sheets.svg';
  import claudeSvg from '$lib/assets/tech/claude-ai-icon.svg';
  import geminiSvg from '$lib/assets/tech/gemini.svg';
  import openaiSvg from '$lib/assets/tech/openai_dark.svg';

  // Professional Experience Logos
  import danaLogo from '$lib/assets/fintech_logos/indonesia/dana.png';
  import kitabisaLogo from '$lib/assets/fintech_logos/indonesia/kitabisa.jpeg';
  import indodanaLogo from '$lib/assets/fintech_logos/indonesia/indodana.png';
  import desaBinaanLogo from '$lib/assets/desa-binaan-logo.png';

  // Lomba/Award & Project Images
  import datathonImg from '$lib/assets/awards/award-datathon.png';
  import finditImg from '$lib/assets/awards/award-findit.png';
  import ideasCertificateImg from '$lib/assets/awards/award-ideas-certificate.png';
  import ideasImg from '$lib/assets/awards/award-ideas.png';
  import rasioImg from '$lib/assets/awards/award-rasio.png';
  import techfestImg from '$lib/assets/awards/award-techfest.png';
  import churnImg from '$lib/assets/projects/project-churn.png';
  import investikaIcon from '$lib/assets/projects/logo-investika.png';
  import kowlIcon from '$lib/assets/projects/logo-kowl.png';
  import kwinIcon from '$lib/assets/projects/logo-kwin.png';
  import wsmIcon from '$lib/assets/projects/logo-wsm.svg';
  import uiCampusImg from '$lib/assets/education/ui-campus.png?enhanced';
  import ddp0OpeningKeynoteAudienceImg from '$lib/assets/speaking/ddp0-opening-keynote-audience.jpeg';
  import ddp0SpeakerCertImg from '$lib/assets/speaking/ddp0-speaker-certificate.png';
  import ukmKmbuiSharingCertImg from '$lib/assets/speaking/ukm-kmbui-sharing-certificate.png';
  import ukmKmbuiProjectWorkshopImg from '$lib/assets/speaking/ukm-kmbui-project-management-workshop.jpeg';
  import ruangguruUtbkSpeakerCertImg from '$lib/assets/speaking/ruangguru-utbk-speaker-certificate.png';
  import ddp0MentorImg from '$lib/assets/speaking/ddp0-mentor-session.png';
  import pricaiLogo from '$lib/assets/organizations/pricai-logo.png';
  import aiesecUiLogo from '$lib/assets/organizations/aiesec-ui-logo.png';
  import ukmKmbuiLogo from '$lib/assets/organizations/ukm-kmbui-logo.png';
  import perakLogo from '$lib/assets/organizations/perak-logo.png';
  import pemiraFasilkomUiLogo from '$lib/assets/organizations/pemira-fasilkom-ui-logo.png';
  import gdscUiLogo from '$lib/assets/organizations/gdsc-ui-logo.png';
  import bemFasilkomUiLogo from '$lib/assets/organizations/bem-fasilkom-ui-logo.png';
  import ddp0Logo from '$lib/assets/organizations/ddp0-logo.png';

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

  function parsePeriodStart(period: string) {
    const monthMap: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11
    };

    const rangeStart = period.split('-')[0]?.trim() ?? period.trim();
    const parts = rangeStart.split(' ').filter(Boolean);

    if (parts.length === 2 && monthMap[parts[0]] !== undefined) {
      return new Date(Number(parts[1]), monthMap[parts[0]], 1).getTime();
    }

    if (parts.length === 1 && /^\d{4}$/.test(parts[0])) {
      return new Date(Number(parts[0]), 0, 1).getTime();
    }

    return Number.MAX_SAFE_INTEGER;
  }

  function getPeriodYear(period: string) {
    return period.match(/\d{4}/)?.[0] ?? period;
  }

  function getOrganizationInitials(name: string) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('');
  }

  const organizationLogoMap: Record<string, string> = {
    'The Pacific Rim International Conference on Artificial Intelligence': pricaiLogo,
    'AIESEC in UI': aiesecUiLogo,
    'UKM KMBUI': ukmKmbuiLogo,
    'Pesta Rakyat Komputer': perakLogo,
    'Pemira IKM Fasilkom UI': pemiraFasilkomUiLogo,
    'Google Developer Student Club in UI': gdscUiLogo,
    'BEM Fasilkom UI': bemFasilkomUiLogo,
    'Dasar-Dasar Pemrograman 0': ddp0Logo
  };

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      closeLightbox();
    }
  }

  // Headline rotating list
  const roles = [
    'Fintech Automation Engineer',
    'Data Science Champion',
    'Information Systems Graduate',
    'Product Discovery Builder'
  ];

  let currentRoleIndex = $state(0);
  let currentRoleText = $state('');
  let isDeleting = $state(false);

  // Rain overlay items state
  interface RainItem {
    id: number;
    type: 'gold' | 'cat';
    x: number;
    y: number;
    size: number;
    rotation: number;
    speedY: number;
    speedX: number;
    rotSpeed: number;
  }

  let rainItems = $state<RainItem[]>([]);
  let nextItemId = 0;
  let animationFrameId: number;
  let lastSpawnTime = 0;
  const SPAWN_INTERVAL = 250; // ms between spawns (lighter rain)
  const MAX_ITEMS = 40; // limit active count on screen

  function animateRain(timestamp: number) {
    if (!lastSpawnTime) lastSpawnTime = timestamp;
    const elapsed = timestamp - lastSpawnTime;

    if (elapsed > SPAWN_INTERVAL && rainItems.length < MAX_ITEMS) {
      const type = Math.random() > 0.45 ? 'gold' : 'cat'; // ~55% gold, 45% cats
      rainItems = [
        ...rainItems,
        {
          id: nextItemId++,
          type,
          x: Math.random() * 100,
          y: -15,
          size: type === 'gold' ? 16 + Math.random() * 24 : 28 + Math.random() * 22,
          rotation: Math.random() * 360,
          speedY: 0.3 + Math.random() * 0.5, // even slower fall speed
          speedX: -0.15 + Math.random() * 0.3, // very low drift
          rotSpeed: -0.5 + Math.random() * 1.0 // very slow rotation
        }
      ];
      lastSpawnTime = timestamp;
    }

    rainItems = rainItems
      .map((item) => ({
        ...item,
        y: item.y + item.speedY,
        x: item.x + item.speedX,
        rotation: item.rotation + item.rotSpeed
      }))
      .filter((item) => item.y < 115);

    animationFrameId = requestAnimationFrame(animateRain);
  }

  // Typing effect & lightbox keyboard shortcut on mount
  onMount(() => {
    if (data.currentUser && sessionStorage.getItem('produck_show_landing') !== '1') {
      goto(getLastAppPagePath() ?? '/dashboard', { replaceState: true });
      return;
    }

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
      } else if (isDeleting && currentRoleText === '') {
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

    // Start raining
    animationFrameId = requestAnimationFrame(animateRain);

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
    {
      value: '3.59',
      label: 'GPA at UI',
      detail: 'Information Systems Graduate',
      positive: 'Graduated',
      icon: GraduationCap
    },
    {
      value: '3x',
      label: 'Internships',
      detail: 'DANA, Indodana, Kitabisa',
      positive: 'Fintech Ops',
      icon: Briefcase
    },
    {
      value: '5x',
      label: 'Talks & Mentoring',
      detail: 'Campus, Community, National TV',
      positive: 'Community',
      icon: Mic
    },
    {
      value: '3x',
      label: 'Competition Wins',
      detail: 'Business Plan & Data Science',
      positive: '🏆 Top 1',
      icon: Trophy
    }
  ];

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
    Python: pythonSvg,
    TypeScript: typescriptSvg,
    React: reactSvg,
    SvelteKit: svelteSvg,
    Django: djangoSvg,
    PostgreSQL: postgresqlSvg,
    Docker: dockerSvg,
    SpringBoot: springSvg,
    'Spring Boot': springSvg,
    Git: gitSvg,
    SQL: sqliteSvg,
    MySQL: mysqlSvg,
    'Next.js': nextjsSvg,
    Playwright: playwrightSvg,
    Jira: atlassianSvg,
    'Excel/Sheets': sheetsSvg,
    PostHog: posthogSvg,
    'Claude/Claude Code': claudeSvg,
    Gemini: geminiSvg,
    ChatGPT: openaiSvg
  };

  type BulletPart = {
    text: string;
    strong?: boolean;
  };

  function bulletText(text: string): BulletPart {
    return { text };
  }

  function bulletStrong(text: string): BulletPart {
    return { text, strong: true };
  }

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
        [
          bulletText('Synthesized operational bottlenecks from '),
          bulletStrong('15+ cross-functional stakeholders'),
          bulletText(" across DANA's "),
          bulletStrong('largest backoffice system'),
          bulletText(', proposing prioritized product solutions.')
        ],
        [
          bulletText('Led '),
          bulletStrong('product discovery'),
          bulletText(
            ' for AI recruitment features (CV Scoring & HR Video bot), delivering cost and benchmarking models to project reduction in hiring cycle times from '
          ),
          bulletStrong('1 month to 3 weeks'),
          bulletText('.')
        ]
      ]
    },
    {
      company: 'Kitabisa',
      logo: kitabisaLogo,
      industry: "Indonesia's Largest Donation Platform",
      role: 'Test Engineer Intern',
      period: 'Feb 2025 - May 2025',
      cardTheme: 'from-[#0F9E98] via-[#0A6D69] to-[#05423F]',
      bullets: [
        [
          bulletText(
            'Led cost-benefit analysis and proof-of-concept for an in-house QA management system, identifying '
          ),
          bulletStrong('IDR 300M+ in cost optimization'),
          bulletText(' for engineering leadership.')
        ],
        [
          bulletText('Automated '),
          bulletStrong('50+ API test cases'),
          bulletText(
            ' using a schema validation approach, cutting boilerplate code and strengthening QA coverage across 5+ core repositories.'
          )
        ]
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
        [
          bulletText('Optimized campaign outcomes using '),
          bulletStrong('A/B testing'),
          bulletText(' and user segmentation, boosting active CRM engagement across a base of '),
          bulletStrong('300K+ users'),
          bulletText('.')
        ],
        [
          bulletText(
            "Managed cross-functional execution of Indodana's official rebrand announcement microsite and notifications sent to "
          ),
          bulletStrong('1M+ users'),
          bulletText('.')
        ]
      ]
    },
    {
      company: 'Desa Binaan UKM KMBUI',
      logo: desaBinaanLogo,
      industry: 'Community Development & Finance',
      role: 'Project Officer / Head of Finance',
      period: 'May 2024 - Dec 2024',
      cardTheme: 'from-[#B91C1C] via-[#851010] to-[#580505]',
      bullets: [
        [
          bulletText('Managed financial planning and fundraising of '),
          bulletStrong('IDR 70M+ (3x YoY increase)'),
          bulletText(
            ', established community koperasi model, and launched rural web hub seputarkrecek.com.'
          )
        ]
      ]
    }
  ];

  let activeExperienceIndex = $state(0); // Open first one by default

  // Projects lists
  const projects = [
    {
      title: 'Produck',
      tag: 'You are here',
      icon: 'PD',
      iconImage: logoProduckIcon,
      logoScale: 1,
      category: 'product',
      href: 'https://produck.fun/',
      description:
        'Personal website and daily life workspace spanning PM artifacts, OKRs, story maps, fintech research, job tracking, finance tracking, RSS trend summaries, and AI-assisted application workflows.',
      tech: ['SvelteKit', 'PostgreSQL', 'Drizzle ORM', 'Bun'],
      isSelf: true,
      image: null
    },
    {
      title: 'K-Owl',
      tag: 'Thesis Project',
      icon: 'KO',
      iconImage: kowlIcon,
      logoScale: 1.08,
      category: 'product',
      href: 'https://kowl-fe-147377990525.asia-southeast2.run.app/',
      description:
        'Undergraduate thesis project and AI-supported learning platform turning K-W-L reflections, pre-post tests, and progress signals into a structured classroom learning loop.',
      tech: ['Next.js', 'Django', 'PostgreSQL', 'FastAPI', 'LLM Agent APIs'],
      isSelf: false,
      image: null
    },
    {
      title: 'Investika',
      tag: 'Discovery Portal',
      icon: 'IV',
      iconImage: investikaIcon,
      logoScale: 1.35,
      category: 'product',
      href: 'https://investika-portal.netlify.app/',
      description:
        'Investment discovery portal for comparing Indonesian opportunities across regions, sectors, and languages with AI search, map-based exploration, authentication, and saved research flows.',
      tech: ['AI Search', 'Maps', 'Auth', 'Saved Flows'],
      isSelf: false,
      image: null
    },
    {
      title: 'K-Win',
      tag: 'Portfolio Platform',
      icon: 'KW',
      iconImage: kwinIcon,
      logoScale: 1.02,
      category: 'product',
      href: 'https://rekam-147377990525.asia-southeast2.run.app/',
      description:
        'Student competition portfolio platform for uploading, browsing, and sharing verified achievement records, with protected PDF access and direct creator contact flows.',
      tech: ['Portfolio', 'PDF Access', 'Auth', 'Contact Flow'],
      isSelf: false,
      image: null
    },
    {
      title: 'WSM',
      tag: 'Media Archive',
      icon: 'WS',
      iconImage: wsmIcon,
      logoScale: 0.82,
      category: 'product',
      href: 'https://wangsiumek.netlify.app/',
      description:
        'Media archive for browsing synced Google Photos content through tags, lazy image and video viewing, music playback, and local media management.',
      tech: ['Google Photos', 'Tags', 'Lazy Media', 'Music'],
      isSelf: false,
      image: null
    },
    {
      title: 'Customer Churn Analysis',
      tag: 'Data Project',
      icon: 'CH',
      iconImage: null,
      logoScale: 1,
      category: 'data',
      href: null,
      description:
        'Tableau dashboard identifying telecom churn patterns and retention opportunities from customer behavior, contract, and service usage data.',
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
      : projects.filter((p) => p.category === activeProjectFilter)
  );

  const awards = [
    {
      title: 'Champion (1st)',
      competition: 'IDEAS Batch 11 Business Plan Competition',
      organizer: 'Universitas Gadjah Mada',
      scope: 'National',
      year: '2025',
      image: ideasImg,
      certificateImage: ideasCertificateImg
    },
    {
      title: 'Champion (1st)',
      competition: 'RASIO 7.0 Data Science Competition',
      organizer: 'Universitas Padjadjaran',
      scope: 'International',
      year: '2023',
      image: rasioImg,
      certificateImage: rasioImg
    },
    {
      title: 'Champion (1st)',
      competition: 'TECHFEST Big Data Competition',
      organizer: 'BINUS University',
      scope: 'National',
      year: '2023',
      image: techfestImg,
      certificateImage: techfestImg
    },
    {
      title: 'Finalist (6th)',
      competition: 'RISTEK Datathon',
      organizer: 'Universitas Indonesia',
      scope: 'National',
      year: '2023',
      image: datathonImg,
      certificateImage: datathonImg
    },
    {
      title: 'Finalist (Top 10)',
      competition: 'FIND IT! Data Analytics Competition',
      organizer: 'Universitas Gadjah Mada',
      scope: 'National',
      year: '2023',
      image: finditImg,
      certificateImage: finditImg
    }
  ];

  // Bookshelf lists
  const bookshelfCollections = [
    {
      id: 'product',
      label: 'Product Shelf',
      books: [
        { title: 'Continuous Discovery Habits', cover: 'continuous_discovery_habits.jpg' },
        { title: 'Evidence-Guided', cover: 'evidence_guided.png' },
        { title: 'Inspired', cover: 'inspired.jpg' },
        { title: 'The Mom Test', cover: 'the_mom_test.jpg' },
        { title: 'Sprint', cover: 'sprint.jpg' },
        { title: 'User Story Mapping', cover: 'user_story_mapping.jpg' },
        { title: 'Outcomes Over Output', cover: 'outcomes_over_output.png' },
        { title: 'Problem Solving 101', cover: 'problem_solving_101.png' },
        { title: 'The PAYTECH Book', cover: 'the_paytech_book.jpg' },
        { title: 'The Visual MBA', cover: 'the_visual_mba.jpg' },
        { title: 'Lean Analytics', cover: 'lean_analytics.jpg' },
        { title: 'Case Interview Secrets', cover: 'case_interview_secrets.jpg' }
      ]
    },
    {
      id: 'other',
      label: 'Other Reads',
      books: [
        {
          title: 'Si Cacing dan Kotoran Kesayangannya',
          cover: 'si_cacing_dan_kotoran_kesayangannya.jpg'
        },
        { title: 'Animal Farm', cover: 'animal_farm.jpg' },
        { title: 'How to Not Die Alone', cover: 'how_to_not_die_alone.jpg' },
        { title: 'The Alchemist', cover: 'the_alchemist.jpg' },
        { title: 'The Little Prince', cover: 'the_little_prince.jpg' },
        {
          title: 'The Subtle Art of Not Giving a F*ck',
          cover: 'the_subtle_art_of_not_giving_a_fuck.jpg'
        },
        { title: 'Siddhartha', cover: 'siddhartha.jpg' },
        { title: 'The Metamorphosis', cover: 'the_metamorphosis.jpg' },
        { title: 'How to Live on 24 Hours a Day', cover: 'how_to_live_on_24_hours_a_day.jpg' },
        { title: 'Atomic Habits', cover: 'atomic_habits.jpg' },
        { title: 'Platonic', cover: 'platonic.jpg' },
        { title: 'The Richest Man in Babylon', cover: 'the_richest_man_in_babylon.jpg' },
        { title: 'Make It Stick', cover: 'make_it_stick.jpg' },
        { title: 'The Stranger', cover: 'the_stranger.jpg' },
        { title: "Man's Search for Meaning", cover: 'mans_search_for_meaning.jpg' },
        { title: 'The Psychology of Money', cover: 'the_psychology_of_money.jpg' },
        { title: 'The Giving Tree', cover: 'the_giving_tree.jpg' },
        { title: 'The Very Hungry Caterpillar', cover: 'the_very_hungry_caterpillar.jpg' }
      ]
    }
  ];

  function getBookshelfCoverClass(title: string) {
    const customWidths: Record<string, string> = {
      'The PAYTECH Book': 'w-32 sm:w-48',
      'The Very Hungry Caterpillar': 'w-32 sm:w-48'
    };

    return customWidths[title] ?? 'w-20 sm:w-24';
  }

  function chunkBookshelfBooks<T>(books: T[], size = 3) {
    return Array.from({ length: Math.ceil(books.length / size) }, (_, index) =>
      books.slice(index * size, index * size + size)
    );
  }

  let activeBookshelfCollection = $state('product');
  let activeBookshelfBooks = $derived(
    [
      ...(bookshelfCollections.find((collection) => collection.id === activeBookshelfCollection)
        ?.books ?? [])
    ].sort((a, b) => a.title.localeCompare(b.title))
  );
  let activeBookshelfGroups = $derived(chunkBookshelfBooks(activeBookshelfBooks, 3));

  // Volunteering & Leadership list
  const volunteering = [
    {
      role: 'Speaker',
      organization: 'Dasar-Dasar Pemrograman 0',
      period: 'Aug 2025',
      duration: '1 mo',
      category: 'Education',
      audience: '540+ participants',
      description:
        'Opening keynote on career path exploration, tech versus non-tech trajectories, and building a continuous learning system.',
      type: 'Speaking',
      coverImage: ddp0OpeningKeynoteAudienceImg,
      attachments: [{ name: 'Certificate', type: 'certificate', image: ddp0SpeakerCertImg }]
    },
    {
      role: 'Speaker',
      organization: 'UKM KMBUI',
      period: 'May 2026',
      duration: '1 mo',
      category: 'Social Services',
      audience: '40+ participants',
      description:
        'Project management workshop on structured execution, vision alignment, and metric-driven progress tracking.',
      type: 'Speaking',
      attachments: [{ name: 'Workshop Session', type: 'photo', image: ukmKmbuiProjectWorkshopImg }]
    },
    {
      role: 'Speaker',
      organization: 'UKM KMBUI',
      period: 'Aug 2025',
      duration: '1 mo',
      category: 'Education',
      audience: '60+ participants',
      description:
        'Sharing session on competition strategy, teamwork dynamics, learning by doing, and turning failures into growth.',
      type: 'Speaking',
      attachments: [{ name: 'Certificate', type: 'certificate', image: ukmKmbuiSharingCertImg }]
    },
    {
      role: 'Guest Speaker',
      organization: 'Ruangguru',
      period: '2022',
      duration: '1 episode',
      category: 'Education',
      audience: 'National TV',
      description:
        'Shared my personal UTBK journey, how Ruangguru supported my preparation, and the path that led me to Universitas Indonesia.',
      type: 'Speaking',
      attachments: [
        { name: 'Certificate', type: 'certificate', image: ruangguruUtbkSpeakerCertImg }
      ]
    },
    {
      role: 'Local Organizing Committee',
      organization: 'The Pacific Rim International Conference on Artificial Intelligence',
      period: 'Nov 2023',
      duration: '1 mo',
      category: 'Science and Technology',
      description:
        'Managed logistics and international delegate hospitality for the PRICAI AI conference in Jakarta.',
      type: 'Leadership',
      attachments: []
    },
    {
      role: 'Engagement with AIESEC',
      organization: 'AIESEC in UI',
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
      description:
        'Directly managed budgeting, bookkeeping, and resource allocations for the central organization.',
      type: 'Leadership',
      attachments: [{ name: 'Honorable Mention', type: 'certificate', image: null }]
    },
    {
      role: 'Deputy Head of Finance for Bakti Sosial 2024',
      organization: 'UKM KMBUI',
      period: 'Nov 2023 - May 2024',
      duration: '7 mos',
      category: 'Social Services',
      description:
        'Co-managed financial distribution, purchasing logs, and health program campaign budgets.',
      type: 'Leadership',
      attachments: [
        { name: 'Product Distribution', type: 'photo', image: null },
        { name: 'Blood Pressure Checks & GCU', type: 'photo', image: null }
      ]
    },
    {
      role: 'Project Officer of Desa Binaan 2024',
      organization: 'UKM KMBUI',
      period: 'May 2024 - Sep 2024',
      duration: '5 mos',
      category: 'Social Services',
      description:
        'Led Desa Binaan 2024 program execution, coordinating planning, team operations, and community delivery.',
      type: 'Leadership',
      attachments: []
    },
    {
      role: 'Head of Public Relations for Vesak 2024',
      organization: 'UKM KMBUI',
      period: 'Apr 2024 - Jun 2024',
      duration: '3 mos',
      category: 'Social Services',
      description:
        'Led marketing, ticket distributions, and stakeholder relations for the annual cultural event.',
      type: 'Leadership',
      attachments: [{ name: 'Event Day', type: 'photo', image: null }]
    },
    {
      role: 'Staff of Partnership for Desa Binaan 2023',
      organization: 'UKM KMBUI',
      period: 'Jun 2023 - Oct 2023',
      duration: '5 mos',
      category: 'Social Services',
      description:
        'Secured external sponsors and established community-driven agricultural partnerships.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Staff of Direct Marketing',
      organization: 'Pesta Rakyat Komputer',
      period: 'Mar 2023 - Sep 2023',
      duration: '7 mos',
      category: 'Arts and Culture',
      description: 'Managed sales strategies and campaign execution for event outreach.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Staff of Public Relations, Publication, Documentation, and Creative',
      organization: 'Pemira IKM Fasilkom UI',
      period: 'Jan 2023',
      duration: '1 mo',
      category: 'Politics',
      description:
        'Designed candidate brochures, media publications, and voter engagement platforms.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Super Member of Data Science',
      organization: 'Google Developer Student Club in UI',
      period: 'Jun 2023 - Jul 2023',
      duration: '2 mos',
      category: 'Science and Technology',
      description:
        'Collaborated on ML training sessions, Kaggle dataset sprints, and python study groups.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Intern Staff at Department of Business and Partnership',
      organization: 'BEM Fasilkom UI',
      period: 'Sep 2022 - Dec 2022',
      duration: '4 mos',
      category: 'Science and Technology',
      description:
        'Maintained corporate partnership outreach database and secured sponsorship pipelines.',
      type: 'Community',
      attachments: []
    },
    {
      role: 'Mentor',
      organization: 'Dasar-Dasar Pemrograman 0',
      period: 'Aug 2023 - Sep 2023',
      duration: '2 mos',
      category: 'Education',
      audience: '3 mentees',
      description:
        'Coached incoming freshmen on fundamental programming concepts, Git version control, and Linux terminal operations.',
      type: 'Speaking',
      badge: 'Mentorship',
      attachments: [{ name: 'Mentoring Session', type: 'photo', image: ddp0MentorImg }]
    }
  ];

  // Dynamic speaking & volunteering split
  const speakingList = volunteering
    .filter((v) => v.type === 'Speaking')
    .sort((a, b) => parsePeriodStart(a.period) - parsePeriodStart(b.period));
  const speakingBinderPages = [
    {
      label: 'Left page',
      items: speakingList.slice(0, 3).map((item, index) => ({ item, index }))
    },
    {
      label: 'Right page',
      items: speakingList.slice(3).map((item, index) => ({ item, index: index + 3 }))
    }
  ];
  const volunteeringList = volunteering.filter((v) => v.type !== 'Speaking');

  let groupedVolunteering = $derived.by(() => {
    const groups = new Map<
      string,
      {
        organization: string;
        items: typeof volunteeringList;
      }
    >();

    for (const entry of volunteeringList) {
      const existing = groups.get(entry.organization);

      if (existing) {
        existing.items.push(entry);
        continue;
      }

      groups.set(entry.organization, {
        organization: entry.organization,
        items: [entry]
      });
    }

    return Array.from(groups.values()).map((group) => ({
      ...group,
      commonCategory: group.items.every((item) => item.category === group.items[0]?.category)
        ? group.items[0]?.category
        : null,
      initials: getOrganizationInitials(group.organization),
      logo: organizationLogoMap[group.organization] ?? null,
      items: [...group.items].sort(
        (a, b) => parsePeriodStart(b.period) - parsePeriodStart(a.period)
      )
    }));
  });

  let multiRoleVolunteeringGroups = $derived(
    groupedVolunteering.filter((group) => group.items.length > 1)
  );
  let singleRoleVolunteeringGroups = $derived(
    groupedVolunteering.filter((group) => group.items.length === 1)
  );

  // Skill categories list
  const skillCategories = [
    {
      title: 'Technical Stack',
      skills: [
        'Python',
        'SQL',
        'TypeScript',
        'React',
        'Next.js',
        'SvelteKit',
        'Django',
        'SpringBoot',
        'Git',
        'Docker',
        'CI/CD',
        'PostgreSQL',
        'MySQL'
      ]
    },
    {
      title: 'Data & Fintech Tools',
      skills: [
        'Tableau',
        'MoEngage',
        'PostHog',
        'A/B Testing',
        'FinOps',
        'Playwright',
        'Jira',
        'Excel/Sheets',
        'WhatsApp API'
      ]
    },
    {
      title: 'AI Tools',
      skills: [
        'Claude/Claude Code',
        'Gemini',
        'ChatGPT',
        'Cline/RooCode',
        'Google Stitch',
        'NotebookLM'
      ]
    }
  ];

  // Languages with rating (gold coins!)
  const languages = [
    {
      name: 'English',
      flag: '🇬🇧',
      rating: 5,
      desc: 'Professional fluency with Duolingo 140/160, equivalent to IELTS 7.5.'
    },
    {
      name: 'Indonesian',
      flag: '🇮🇩',
      rating: 5,
      desc: 'Native mother tongue used in formal instruction.'
    },
    {
      name: 'Hokkien',
      flag: '🇨🇳',
      rating: 5,
      desc: 'Native spoken ancestral dialect used daily.'
    },
    {
      name: 'Mandarin',
      flag: '🇨🇳',
      rating: 2,
      desc: 'Elementary HSK 2 with basic writing and conversation.'
    }
  ];
</script>

<svelte:head>
  <title>Edward Salim | Portfolio & Fintech Workspace</title>
  <meta
    name="description"
    content="Personal portfolio and fintech workspace of Edward Salim. Information Systems at Universitas Indonesia, Automation Product Developer, and Data Science Champion."
  />
  <meta name="robots" content="index, follow" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Edward Salim | Portfolio & Fintech Workspace" />
  <meta
    property="og:description"
    content="Personal portfolio and fintech workspace of Edward Salim. Information Systems at Universitas Indonesia, Automation Product Developer, and Data Science Champion."
  />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<!-- Global Layout Container (Luxury Fintech Theme: Charcoal & Gold/Crimson) -->
<div
  class="relative flex min-h-screen flex-col overflow-x-hidden bg-[#0C0A09] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-stone-900 via-[#0A0908] to-[#120909] font-sans text-stone-200 antialiased selection:bg-amber-500/30 selection:text-amber-200"
>
  <!-- Subtle Chinese Clouds Overlay Pattern -->
  <div
    class="pointer-events-none absolute inset-0 bg-repeat opacity-[0.03] mix-blend-overlay"
    style="background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22><path d=%22M30 15c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm-15 20c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5zm30 0c-3 0-5.5 2.5-5.5 5.5s2.5 5.5 5.5 5.5 5.5-2.5 5.5-5.5-2.5-5.5-5.5-5.5z%22 fill=%22%23F59E0B%22 fill-opacity=%220.6%22 fill-rule=%22evenodd%22/></svg>');"
  ></div>

  <!-- Raining Gold & Cats Overlay (Single composite layer to prevent overlapping items from stacking opacity) -->
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-15 select-none">
    {#each rainItems as item (item.id)}
      <div
        class="absolute"
        style="left: {item.x}vw; top: {item.y}vh; width: {item.size}px; height: {item.size}px; transform: rotate({item.rotation}deg); transition: transform 0.05s linear;"
      >
        {#if item.type === 'gold'}
          <svg viewBox="0 0 100 100" class="h-full w-full drop-shadow-2xl">
            <defs>
              <radialGradient id="gold-grad-{item.id}" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#FFE082" />
                <stop offset="35%" stop-color="#FFD54F" />
                <stop offset="75%" stop-color="#FFB300" />
                <stop offset="100%" stop-color="#FF6F00" />
              </radialGradient>
            </defs>
            <path
              d="M 50,5 A 45,45 0 1,0 50,95 A 45,45 0 1,0 50,5 Z M 35,35 H 65 V 65 H 35 Z"
              fill="url(#gold-grad-{item.id})"
              fill-rule="evenodd"
              stroke="#D97706"
              stroke-width="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="37"
              fill="none"
              stroke="#FFF59D"
              stroke-width="0.8"
              stroke-dasharray="3,3"
            />
            <path d="M 35,35 H 65 V 65 H 35 Z" fill="none" stroke="#B45309" stroke-width="1" />

            <!-- Chinese Characters (Traditional Wealth Characters) -->
            <text
              x="50"
              y="24"
              font-family="'ZCOOL Xiaowei', serif"
              font-size="10.5"
              font-weight="bold"
              fill="#5D4037"
              text-anchor="middle">招</text
            >
            <text
              x="76"
              y="54.5"
              font-family="'ZCOOL Xiaowei', serif"
              font-size="10.5"
              font-weight="bold"
              fill="#5D4037"
              text-anchor="middle">財</text
            >
            <text
              x="50"
              y="84"
              font-family="'ZCOOL Xiaowei', serif"
              font-size="10.5"
              font-weight="bold"
              fill="#5D4037"
              text-anchor="middle">進</text
            >
            <text
              x="24"
              y="54.5"
              font-family="'ZCOOL Xiaowei', serif"
              font-size="10.5"
              font-weight="bold"
              fill="#5D4037"
              text-anchor="middle">寶</text
            >
          </svg>
        {:else}
          <!-- Falling Lucky Cat (Maneki-neko) -->
          <svg viewBox="0 0 100 110" class="h-full w-full drop-shadow-2xl">
            <!-- Ears -->
            <path
              d="M 24,35 L 14,8 L 40,24 Z"
              fill="#FFFFFF"
              stroke="#78716C"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <path d="M 23,31 L 17,12 L 35,23 Z" fill="#E11D48" />

            <path
              d="M 76,35 L 86,8 L 60,24 Z"
              fill="#FFFFFF"
              stroke="#78716C"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <path d="M 77,31 L 83,12 L 65,23 Z" fill="#E11D48" />

            <!-- Raised Right Arm (Waving) -->
            <path
              d="M 25,50 C 12,50 8,36 10,24 C 11,14 20,14 22,24 C 23,32 25,42 25,50"
              fill="#FFFFFF"
              stroke="#78716C"
              stroke-width="1.5"
            />
            <ellipse cx="16" cy="20" rx="3" ry="4" fill="#FCA5A5" opacity="0.8" />

            <!-- Left Arm resting -->
            <path
              d="M 75,55 C 85,55 92,68 85,80 C 80,88 68,85 64,78"
              fill="#FFFFFF"
              stroke="#78716C"
              stroke-width="1.5"
            />

            <!-- Body -->
            <path
              d="M 22,54 C 18,70 20,95 32,98 C 42,100 58,100 68,98 C 80,95 82,70 78,54 Z"
              fill="#FFFFFF"
              stroke="#78716C"
              stroke-width="1.5"
            />

            <!-- Head -->
            <ellipse
              cx="50"
              cy="42"
              rx="30"
              ry="25"
              fill="#FFFFFF"
              stroke="#78716C"
              stroke-width="1.5"
            />

            <!-- Green Bib -->
            <path
              d="M 32,58 C 32,70 68,70 68,58 Z"
              fill="#16A34A"
              stroke="#78716C"
              stroke-width="1"
            />

            <!-- Red Collar -->
            <path
              d="M 24,53 Q 50,60 76,53"
              fill="none"
              stroke="#DC2626"
              stroke-width="4"
              stroke-linecap="round"
            />

            <!-- Bell -->
            <circle cx="50" cy="60" r="6" fill="#FBBF24" stroke="#B45309" stroke-width="1" />
            <circle cx="50" cy="61" r="1.5" fill="#78716C" />
            <line x1="44" y1="58" x2="56" y2="58" stroke="#B45309" stroke-width="0.8" />

            <!-- Eyes -->
            <circle cx="37" cy="35" r="5" fill="#FBBF24" stroke="#78716C" stroke-width="0.5" />
            <circle cx="37" cy="35" r="2.5" fill="#000000" />
            <circle cx="63" cy="35" r="5" fill="#FBBF24" stroke="#78716C" stroke-width="0.5" />
            <circle cx="63" cy="35" r="2.5" fill="#000000" />

            <!-- Nose -->
            <polygon
              points="48,41 52,41 50,43"
              fill="#FCA5A5"
              stroke="#78716C"
              stroke-width="0.5"
            />

            <!-- Mouth -->
            <path
              d="M 50,43 L 50,46 Q 47,48 45,47 M 50,46 Q 53,48 55,47"
              fill="none"
              stroke="#DC2626"
              stroke-width="1.5"
              stroke-linecap="round"
            />

            <!-- Whiskers -->
            <line x1="24" y1="38" x2="14" y2="36" stroke="#78716C" stroke-width="1" />
            <line x1="23" y1="41" x2="12" y2="41" stroke="#78716C" stroke-width="1" />
            <line x1="24" y1="44" x2="14" y2="46" stroke="#78716C" stroke-width="1" />

            <line x1="76" y1="38" x2="86" y2="36" stroke="#78716C" stroke-width="1" />
            <line x1="77" y1="41" x2="88" y2="41" stroke="#78716C" stroke-width="1" />
            <line x1="76" y1="44" x2="86" y2="46" stroke="#78716C" stroke-width="1" />

            <!-- Whisker dots -->
            <circle cx="28" cy="40" r="0.6" fill="#78716C" />
            <circle cx="30" cy="42" r="0.6" fill="#78716C" />
            <circle cx="32" cy="40" r="0.6" fill="#78716C" />
            <circle cx="72" cy="40" r="0.6" fill="#78716C" />
            <circle cx="70" cy="42" r="0.6" fill="#78716C" />
            <circle cx="68" cy="40" r="0.6" fill="#78716C" />

            <!-- Feet -->
            <circle cx="34" cy="98" r="6" fill="#FFFFFF" stroke="#78716C" stroke-width="1.2" />
            <line x1="31" y1="94" x2="31" y2="102" stroke="#78716C" stroke-width="0.8" />
            <line x1="35" y1="94" x2="35" y2="102" stroke="#78716C" stroke-width="0.8" />

            <circle cx="66" cy="98" r="6" fill="#FFFFFF" stroke="#78716C" stroke-width="1.2" />
            <line x1="63" y1="94" x2="63" y2="102" stroke="#78716C" stroke-width="0.8" />
            <line x1="67" y1="94" x2="67" y2="102" stroke="#78716C" stroke-width="0.8" />

            <!-- Koban Gold Coin (千万両) -->
            <g transform="rotate(-8 52 82)">
              <rect
                x="36"
                y="62"
                width="28"
                height="40"
                rx="14"
                fill="#FBBF24"
                stroke="#D97706"
                stroke-width="1.5"
              />
              <rect
                x="39"
                y="65"
                width="22"
                height="34"
                rx="11"
                fill="none"
                stroke="#F59E0B"
                stroke-width="0.8"
                stroke-dasharray="2,2"
              />
              <text
                x="50"
                y="74"
                font-family="'ZCOOL Xiaowei', serif"
                font-weight="900"
                font-size="8"
                fill="#1C1917"
                text-anchor="middle">千</text
              >
              <text
                x="50"
                y="83"
                font-family="'ZCOOL Xiaowei', serif"
                font-weight="900"
                font-size="8"
                fill="#1C1917"
                text-anchor="middle">万</text
              >
              <text
                x="50"
                y="92"
                font-family="'ZCOOL Xiaowei', serif"
                font-weight="900"
                font-size="8"
                fill="#1C1917"
                text-anchor="middle">両</text
              >
            </g>

            <!-- Left Paw overlapping coin -->
            <circle cx="62" cy="80" r="5" fill="#FFFFFF" stroke="#78716C" stroke-width="1.2" />
          </svg>
        {/if}
      </div>
    {/each}
  </div>

  <!-- Main Page Content Wrapper (guarantees background rendering of rain items) -->
  <div class="relative z-10">
    <!-- Header / Top Navigation -->
    <header class="sticky top-0 z-40 border-b border-stone-800/80 bg-[#0C0A09]/80 backdrop-blur-md">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-3">
          <a href="/dashboard" class="group flex items-center gap-2">
            <enhanced:img
              src={logoProduck}
              alt="Produck Logo"
              class="size-6 object-contain transition-transform group-hover:scale-105"
            />
            <span class="font-display text-2xl leading-none text-amber-500">Produck</span>
          </a>
        </div>

        <!-- Auth Action -->
        <div class="flex items-center gap-4">
          {#if data.currentUser}
            <button
              onclick={() => goto('/dashboard')}
              class="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-500 px-4 py-1.5 text-xs font-semibold text-stone-950 shadow-md transition-all hover:scale-105 hover:bg-amber-400"
            >
              <LayoutDashboard class="size-3.5" />
              <span>Workspace App</span>
            </button>
          {:else}
            <button
              onclick={() => goto('/login')}
              class="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-red-700 to-red-600 px-4 py-1.5 text-xs font-bold text-white shadow-md transition-all hover:scale-105 hover:from-red-600 hover:to-red-500"
            >
              <LogIn class="size-3.5 text-amber-300" />
              <span>Workspace Sign In</span>
            </button>
          {/if}
        </div>
      </div>
    </header>
    <!-- Hero Section -->
    <section
      use:reveal={{ distance: 18 }}
      class="reveal-on-scroll relative overflow-hidden px-5 pt-8 pb-8 sm:px-6 md:pt-16 md:pb-12"
    >
      <!-- Red & Gold Ambient glow circles -->
      <div
        class="absolute top-10 right-10 -z-10 size-96 rounded-full bg-amber-500/5 blur-[120px]"
      ></div>
      <div
        class="absolute bottom-10 left-10 -z-10 size-96 rounded-full bg-red-600/5 blur-[120px]"
      ></div>

      <div class="mx-auto max-w-5xl">
        <div class="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-12 md:items-start">
          <!-- Intro text (Bio & Contacts) -->
          <div
            class="order-2 space-y-5 text-center md:order-1 md:col-span-7 md:row-span-2 md:space-y-6 md:text-left"
          >
            <div class="space-y-2.5 md:space-y-3">
              <h1
                class="font-outfit flex flex-col items-center gap-1 text-4xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl md:block md:text-6xl"
              >
                Edward Salim <span
                  class="font-chinese text-3xl leading-none font-medium tracking-normal whitespace-nowrap text-amber-500 md:ml-3 md:text-4xl"
                  >林明星</span
                >
              </h1>

              <!-- Headline rotater / typing effect in Gold -->
              <div
                class="font-outfit min-h-7 pb-1 text-base leading-snug font-bold tracking-wide text-amber-400 sm:text-xl md:min-h-10 md:text-3xl md:whitespace-nowrap"
              >
                <span>{currentRoleText}</span>
                <span class="ml-0.5 inline-block h-6 w-0.5 animate-pulse bg-amber-400 align-middle"
                ></span>
              </div>
            </div>

            <p class="font-outfit text-sm leading-relaxed text-stone-400 sm:text-base md:max-w-lg">
              Hi, I’m Edward. I’m into product, fintech, and building useful things from messy
              ideas. Future Minister of Communication and Digital Affairs, maybe.
            </p>

            <!-- Red Envelope (Hongbao) Contact Links -->
            <div class="pt-2">
              <span
                class="mb-3 block text-center text-xs font-black tracking-widest text-red-500 uppercase md:text-left"
                >CONTACT</span
              >
              <div class="grid w-full max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
                <!-- Resume Red Envelope -->
                <a
                  href="/assets/Edward_Salim_CV.pdf"
                  target="_blank"
                  download="Edward_Salim_CV.pdf"
                  class="group relative block h-36 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-red-600 to-red-800 shadow-md transition-all duration-300 [perspective:1000px] hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <!-- Flap -->
                  <div
                    class="absolute top-0 left-0 z-20 flex h-11 w-full origin-top items-center justify-center rounded-b-[40%] border-b border-amber-500/40 bg-red-700 shadow-xs transition-all duration-300 group-hover:[transform:rotateX(180deg)]"
                  >
                    <div
                      class="flex size-5 items-center justify-center rounded-full border border-amber-600 bg-gradient-to-tr from-amber-500 to-amber-300 text-xs font-black text-amber-950"
                    >
                      福
                    </div>
                  </div>
                  <!-- Sliding Card -->
                  <div
                    class="absolute inset-x-2 top-6 bottom-2 z-10 flex translate-y-6 flex-col items-center justify-center rounded-lg border border-amber-400/40 bg-gradient-to-b from-amber-50 to-amber-100 p-2 text-center transition-all duration-300 group-hover:translate-y-0"
                  >
                    <FileText class="size-4.5 text-amber-950" />
                    <span class="mt-1 text-xs font-black tracking-wider text-amber-950 uppercase"
                      >Resume</span
                    >
                    <span class="w-full truncate text-xs font-medium text-amber-800"
                      >Download CV</span
                    >
                  </div>
                </a>

                <!-- LinkedIn Red Envelope -->
                <a
                  href="http://linkedin.com/in/edward-salim"
                  target="_blank"
                  class="group relative block h-36 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-red-600 to-red-800 shadow-md transition-all duration-300 [perspective:1000px] hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <!-- Flap -->
                  <div
                    class="absolute top-0 left-0 z-20 flex h-11 w-full origin-top items-center justify-center rounded-b-[40%] border-b border-amber-500/40 bg-red-700 shadow-xs transition-all duration-300 group-hover:[transform:rotateX(180deg)]"
                  >
                    <div
                      class="flex size-5 items-center justify-center rounded-full border border-amber-600 bg-gradient-to-tr from-amber-500 to-amber-300 text-xs font-black text-amber-950"
                    >
                      禄
                    </div>
                  </div>
                  <!-- Sliding Card -->
                  <div
                    class="absolute inset-x-2 top-6 bottom-2 z-10 flex translate-y-6 flex-col items-center justify-center rounded-lg border border-amber-400/40 bg-gradient-to-b from-amber-50 to-amber-100 p-2 text-center transition-all duration-300 group-hover:translate-y-0"
                  >
                    <img src={linkedinSvg} alt="LinkedIn" class="size-4.5 object-contain" />
                    <span class="mt-1 text-xs font-black tracking-wider text-amber-950 uppercase"
                      >LinkedIn</span
                    >
                    <span class="w-full truncate text-xs font-medium text-amber-800"
                      >edward-salim</span
                    >
                  </div>
                </a>

                <!-- GitHub Red Envelope -->
                <a
                  href="https://github.com/Edward-Salim"
                  target="_blank"
                  class="group relative block h-36 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-red-600 to-red-800 shadow-md transition-all duration-300 [perspective:1000px] hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <!-- Flap -->
                  <div
                    class="absolute top-0 left-0 z-20 flex h-11 w-full origin-top items-center justify-center rounded-b-[40%] border-b border-amber-500/40 bg-red-700 shadow-xs transition-all duration-300 group-hover:[transform:rotateX(180deg)]"
                  >
                    <div
                      class="flex size-5 items-center justify-center rounded-full border border-amber-600 bg-gradient-to-tr from-amber-500 to-amber-300 text-xs font-black text-amber-950"
                    >
                      寿
                    </div>
                  </div>
                  <!-- Sliding Card -->
                  <div
                    class="absolute inset-x-2 top-6 bottom-2 z-10 flex translate-y-6 flex-col items-center justify-center rounded-lg border border-amber-400/40 bg-gradient-to-b from-amber-50 to-amber-100 p-2 text-center transition-all duration-300 group-hover:translate-y-0"
                  >
                    <img src={githubSvg} alt="GitHub" class="size-4.5 object-contain" />
                    <span class="mt-1 text-xs font-black tracking-wider text-amber-950 uppercase"
                      >GitHub</span
                    >
                    <span class="w-full truncate text-xs font-medium text-amber-800"
                      >Edward-Salim</span
                    >
                  </div>
                </a>

                <!-- Instagram Red Envelope -->
                <a
                  href="https://www.instagram.com/edwardsalimm/"
                  target="_blank"
                  class="group relative block h-36 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-red-600 to-red-800 shadow-md transition-all duration-300 [perspective:1000px] hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <!-- Flap -->
                  <div
                    class="absolute top-0 left-0 z-20 flex h-11 w-full origin-top items-center justify-center rounded-b-[40%] border-b border-amber-500/40 bg-red-700 shadow-xs transition-all duration-300 group-hover:[transform:rotateX(180deg)]"
                  >
                    <div
                      class="flex size-5 items-center justify-center rounded-full border border-amber-600 bg-gradient-to-tr from-amber-500 to-amber-300 text-xs font-black text-amber-950"
                    >
                      喜
                    </div>
                  </div>
                  <!-- Sliding Card -->
                  <div
                    class="absolute inset-x-2 top-6 bottom-2 z-10 flex translate-y-6 flex-col items-center justify-center rounded-lg border border-amber-400/40 bg-gradient-to-b from-amber-50 to-amber-100 p-2 text-center transition-all duration-300 group-hover:translate-y-0"
                  >
                    <img src={instagramSvg} alt="Instagram" class="size-4.5 object-contain" />
                    <span class="mt-1 text-xs font-black tracking-wider text-amber-950 uppercase"
                      >Instagram</span
                    >
                    <span class="w-full truncate text-xs font-medium text-amber-800"
                      >@edwardsalimm</span
                    >
                  </div>
                </a>
              </div>
            </div>
          </div>

          <!-- Photo Avatar with Gold Border Frame -->
          <div
            class="order-1 flex justify-center md:order-2 md:col-span-5 md:col-start-8 md:row-start-1 md:justify-end"
          >
            <div class="relative w-fit shrink-0 select-none">
              <div
                class="absolute -inset-3 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-200 to-amber-500 opacity-30 blur-xl"
              ></div>
              <div
                class="relative rounded-2xl bg-gradient-to-tr from-amber-50 via-amber-200 to-amber-600 p-1.5 shadow-xl shadow-amber-500/10"
              >
                <enhanced:img
                  src={edwardAvatar}
                  alt="Edward Salim"
                  fetchpriority="high"
                  class="size-40 rounded-xl border border-stone-900 object-cover sm:size-52 md:size-60"
                />

                <!-- Traditional Ornaments on Photo Corners -->
                <div
                  class="absolute top-3 left-3 size-3.5 border-t border-l border-amber-300"
                ></div>
                <div
                  class="absolute top-3 right-3 size-3.5 border-t border-r border-amber-300"
                ></div>
                <div
                  class="absolute bottom-3 left-3 size-3.5 border-b border-l border-amber-300"
                ></div>
                <div
                  class="absolute right-3 bottom-3 size-3.5 border-r border-b border-amber-300"
                ></div>

                <!-- Decorative ancient coins overlapping photo -->
                <div
                  class="absolute -top-3 -left-3 flex size-7 items-center justify-center rounded-full border border-amber-600 bg-amber-500 text-xs font-black text-amber-950 shadow-lg"
                >
                  福
                </div>
                <div
                  class="absolute -right-3 -bottom-3 flex size-7 items-center justify-center rounded-full border border-amber-600 bg-amber-500 text-xs font-black text-amber-950 shadow-lg"
                >
                  禄
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Dashboard (Styled as Gold Bullion Boxes) -->
        <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 md:mt-12 md:gap-4">
          {#each stats as stat, idx (stat.label)}
            {@const StatIcon = stat.icon}
            <div
              use:reveal={{ delay: 80 + idx * 90, distance: 24 }}
              class="reveal-on-scroll group relative overflow-hidden rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-700/5 p-5 shadow-lg backdrop-blur-md transition-all hover:scale-[1.02] hover:border-amber-400/50 hover:shadow-amber-500/5"
            >
              <!-- Shimmer effect -->
              <div
                class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
              ></div>

              <div class="flex items-start justify-between gap-3">
                <span
                  class="font-outfit text-2xl font-black tracking-tight text-amber-400 sm:text-3xl"
                  >{stat.value}</span
                >
                <StatIcon class="size-8 shrink-0 text-amber-400/25" />
              </div>

              <p class="mt-2 text-xs font-black tracking-widest text-stone-400 uppercase">
                {stat.label}
              </p>
              <p class="mt-0.5 text-xs leading-snug text-stone-500">{stat.detail}</p>

              <!-- Mini graph background SVG -->
              <div class="pointer-events-none absolute right-0 bottom-0 h-8 w-24 opacity-10">
                <svg viewBox="0 0 100 30" fill="none" class="h-full w-full text-amber-400">
                  <path
                    d="M0,25 Q15,20 30,22 T60,10 T90,5 L100,5 L100,30 L0,30 Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <!-- Infinite Skill Marquee Ticker -->
    <section
      use:reveal={{ distance: 20 }}
      class="reveal-on-scroll border-stone-850 w-full overflow-hidden border-y bg-stone-900/40 py-4 backdrop-blur-xs"
    >
      <div class="animate-marquee items-center gap-8">
        <!-- Normal list -->
        {#each marqueeSkills as skill (skill.name)}
          <span
            class="font-outfit flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 uppercase transition-colors hover:text-amber-400"
          >
            <img
              src={skill.icon}
              alt={skill.name}
              class="size-4.5 object-contain opacity-75 group-hover:opacity-100"
            />
            {skill.name}
          </span>
        {/each}
        <!-- Duplicate list for looping -->
        {#each marqueeSkills as skill (`dup-${skill.name}`)}
          <span
            class="font-outfit flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 uppercase transition-colors hover:text-amber-400"
          >
            <img
              src={skill.icon}
              alt={skill.name}
              class="size-4.5 object-contain opacity-75 group-hover:opacity-100"
            />
            {skill.name}
          </span>
        {/each}
      </div>
    </section>

    <!-- Main Content Grid -->
    <main class="mx-auto w-full max-w-5xl flex-1 space-y-16 px-6 py-12">
      <!-- Education Section (Styled as Scholarship Decree) -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="education">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <GraduationCap class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
            Academic Background
          </h2>
        </div>

        <!-- Scholarly Decree Box -->
        <div
          class="relative overflow-hidden rounded-2xl border-2 border-amber-600/40 bg-gradient-to-br from-[#181514] to-[#120F0E] p-6 shadow-xl md:p-8"
        >
          <div class="absolute inset-0">
            <enhanced:img
              src={uiCampusImg}
              alt="Universitas Indonesia campus"
              loading="lazy"
              class="h-full w-full object-cover object-center opacity-38"
            />
            <div
              class="absolute inset-0 bg-gradient-to-r from-[#120F0E]/88 via-[#120F0E]/70 to-[#120F0E]/52"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-[#120F0E]/78 via-transparent to-[#120F0E]/42"
            ></div>
          </div>
          <!-- Golden Corner Brackets -->
          <div class="absolute top-2 left-2 size-5 border-t-2 border-l-2 border-amber-500/70"></div>
          <div
            class="absolute top-2 right-2 size-5 border-t-2 border-r-2 border-amber-500/70"
          ></div>
          <div
            class="absolute bottom-2 left-2 size-5 border-b-2 border-l-2 border-amber-500/70"
          ></div>
          <div
            class="absolute right-2 bottom-2 size-5 border-r-2 border-b-2 border-amber-500/70"
          ></div>

          <div class="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div class="min-w-0 flex-1 space-y-3">
              <h3 class="font-outfit text-xl font-bold text-white sm:text-2xl">
                Universitas Indonesia
              </h3>
              <p class="text-sm font-semibold text-amber-400">B.Comp.Sc. in Information Systems</p>
              <p class="text-sm text-stone-400">
                GPA: <span class="font-bold text-stone-200">3.59 / 4.00</span> &middot; Graduated
              </p>

              <ul class="mt-4 list-disc space-y-2.5 pl-5 text-xs text-stone-400 md:max-w-none">
                <li>
                  <strong>2nd Place</strong> - Most Outstanding Student of Faculty of Computer Science
                  (Pilmapres Fasilkom UI, 2025).
                </li>
                <li>
                  <strong>Full Tuition Scholarship</strong> recipient, awarded by the Indonesian Ministry
                  of Education and Culture.
                </li>
              </ul>
            </div>

            <div class="shrink-0 text-left md:text-right">
              <span
                class="inline-block rounded-full border border-stone-800 bg-stone-900 px-3 py-1 text-xs font-bold text-stone-400"
              >
                Jul 2022 - Jul 2026
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience Section (Bill and Cards) -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="experience">
        <div class="flex items-center justify-between border-b border-stone-800 pb-3">
          <div class="flex items-center gap-3">
            <Briefcase class="size-6 text-amber-500" />
            <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Work History</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <!-- Experience Bullets Container (Bill statement) -->
          {#if activeExperienceIndex >= 0 && activeExperienceIndex < experiences.length}
            {@const selectedExp = experiences[activeExperienceIndex]}
            <article
              class="bill-paper animate-fade-in relative min-h-[560px] overflow-hidden rounded-sm p-5 text-stone-950 duration-300 sm:p-6 md:p-8"
            >
              <div class="relative z-10 space-y-6">
                <div
                  class="flex flex-col gap-5 border-b border-stone-950 pb-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div class="space-y-2">
                    <span class="text-xs font-black tracking-[0.22em] text-stone-950 uppercase"
                      >Experience Bill</span
                    >
                    <div>
                      <h4 class="font-outfit text-2xl leading-tight font-black text-stone-950">
                        {selectedExp.company}
                      </h4>
                      <p class="mt-1 max-w-xl text-sm font-bold text-stone-700">
                        {selectedExp.role}
                      </p>
                    </div>
                  </div>

                  <div
                    class="min-w-34 border border-stone-950 bg-white px-3 py-2 text-right text-stone-950"
                  >
                    <p class="font-mono text-xs font-black tracking-widest uppercase opacity-70">
                      Bill No.
                    </p>
                    <p class="font-mono text-lg font-black">
                      WH-{String(activeExperienceIndex + 1).padStart(3, '0')}
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                  <div class="border border-stone-950/30 bg-white p-3">
                    <p
                      class="font-mono text-xs font-black tracking-widest text-stone-500 uppercase"
                    >
                      Billed To
                    </p>
                    <p class="mt-1 font-bold text-stone-950">{selectedExp.company}</p>
                  </div>
                  <div class="border border-stone-950/30 bg-white p-3">
                    <p
                      class="font-mono text-xs font-black tracking-widest text-stone-500 uppercase"
                    >
                      Period
                    </p>
                    <p class="mt-1 font-bold text-stone-950">{selectedExp.period}</p>
                  </div>
                  <div class="border border-stone-950/30 bg-white p-3">
                    <p
                      class="font-mono text-xs font-black tracking-widest text-stone-500 uppercase"
                    >
                      Category
                    </p>
                    <p class="mt-1 font-bold text-stone-950">{selectedExp.industry}</p>
                  </div>
                </div>

                <div class="overflow-hidden border-y-2 border-dashed border-stone-950/55">
                  <div
                    class="hidden grid-cols-[72px_minmax(0,1fr)_82px] border-b border-stone-950/40 bg-stone-950 px-3 py-2 font-mono text-xs font-black tracking-widest text-white uppercase sm:grid"
                  >
                    <span>Item</span>
                    <span>Description</span>
                    <span class="text-right">Amount</span>
                  </div>

                  {#each selectedExp.bullets as bullet, idx (idx)}
                    <div
                      class="grid grid-cols-1 gap-2 border-b border-stone-950/20 px-3 py-4 text-sm last:border-b-0 sm:grid-cols-[72px_minmax(0,1fr)_82px] sm:gap-4"
                    >
                      <div
                        class="font-mono text-xs font-black tracking-widest text-stone-500 uppercase"
                      >
                        Line {idx + 1}
                      </div>
                      <p class="bill-line-copy leading-relaxed text-stone-800">
                        {#each bullet as part, partIdx (partIdx)}
                          {#if part.strong}
                            <strong>{part.text}</strong>
                          {:else}
                            {part.text}
                          {/if}
                        {/each}
                      </p>
                      <div class="font-mono text-xs font-black text-stone-950 sm:text-right">
                        Impact
                      </div>
                    </div>
                  {/each}
                </div>

                <div class="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_240px]">
                  <div class="space-y-2 text-xs leading-relaxed text-stone-600">
                    <p
                      class="font-mono text-xs font-black tracking-widest text-stone-500 uppercase"
                    >
                      Notes
                    </p>
                    <p>
                      Statement generated from selected saved work card. Line items summarize the
                      delivered scope and measurable outcomes.
                    </p>
                  </div>

                  <div class="border border-stone-950 bg-white p-4">
                    <div
                      class="flex items-center justify-between border-b border-stone-950/25 pb-2 text-xs"
                    >
                      <span class="font-mono font-black tracking-widest text-stone-500 uppercase"
                        >Subtotal</span
                      >
                      <span class="font-bold">{selectedExp.bullets.length} line items</span>
                    </div>
                    <div class="mt-3 flex items-end justify-between gap-3">
                      <span
                        class="font-mono text-xs font-black tracking-widest text-stone-500 uppercase"
                        >Balance Due</span
                      >
                      <span class="font-outfit text-2xl font-black text-stone-950">Delivered</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          {/if}

          <div class="relative overflow-visible px-1 pt-3 pb-8 lg:sticky lg:top-24">
            <div class="relative">
              {#each experiences as exp, idx (exp.company)}
                {@const isActive = activeExperienceIndex === idx}
                <div
                  class="experience-card-sleeve relative transition duration-300"
                  style="margin-top: {idx === 0 ? '0' : '-1.45rem'}; z-index: {isActive
                    ? experiences.length + 4
                    : experiences.length - idx}; transform: translateX({isActive
                    ? '0.7rem'
                    : idx % 2 === 0
                      ? '-0.2rem'
                      : '0.15rem'}) rotate({isActive
                    ? '0deg'
                    : idx % 2 === 0
                      ? '-1.2deg'
                      : '1deg'});"
                >
                  <button
                    type="button"
                    class="group relative flex min-h-34 w-[calc(100%-0.7rem)] cursor-pointer flex-col justify-between overflow-hidden rounded-xl border border-white/15 bg-gradient-to-tr {exp.cardTheme} p-4 text-left shadow-[0_18px_32px_rgba(0,0,0,0.38)] transition duration-300 hover:-translate-y-1 hover:border-amber-300/70 focus:ring-2 focus:ring-amber-300 focus:outline-none {isActive
                      ? 'ring-2 ring-amber-300'
                      : 'opacity-90'}"
                    aria-pressed={isActive}
                    onclick={() => (activeExperienceIndex = idx)}
                  >
                    <div
                      class="absolute inset-0 -translate-x-full bg-linear-to-tr from-white/0 via-white/10 to-white/0 transition-transform duration-1000 group-hover:translate-x-full"
                    ></div>
                    <div
                      class="absolute top-4 left-4 grid h-7 w-9 grid-cols-2 gap-px rounded-md border border-yellow-200/35 bg-yellow-300/80 p-1 shadow-inner"
                      aria-hidden="true"
                    >
                      <span class="rounded-[2px] bg-yellow-700/35"></span>
                      <span class="rounded-[2px] bg-yellow-700/25"></span>
                      <span class="rounded-[2px] bg-yellow-700/25"></span>
                      <span class="rounded-[2px] bg-yellow-700/35"></span>
                    </div>
                    <div
                      class="absolute -right-10 -bottom-12 size-32 rounded-full border border-white/15"
                      aria-hidden="true"
                    ></div>

                    <div class="relative z-10 flex items-start justify-between gap-3 pl-12">
                      <div class="min-w-0">
                        <p
                          class="font-mono text-xs font-black tracking-[0.2em] text-white/65 uppercase"
                        >
                          Work Card {String(idx + 1).padStart(2, '0')}
                        </p>
                        <h3
                          class="font-outfit mt-1 truncate text-base leading-tight font-black text-white"
                        >
                          {exp.company}
                        </h3>
                      </div>

                      {#if exp.logo}
                        <img
                          src={exp.logo}
                          alt={exp.company}
                          loading="lazy"
                          decoding="async"
                          class="size-9 shrink-0 object-contain drop-shadow-[0_2px_5px_rgba(0,0,0,0.35)]"
                        />
                      {:else}
                        <div
                          class="font-outfit flex size-8 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/15 text-sm font-black text-white"
                        >
                          {exp.company.charAt(0)}
                        </div>
                      {/if}
                    </div>

                    <div class="relative z-10 mt-6 space-y-3">
                      <p
                        class="text-xs leading-snug font-black tracking-widest text-amber-200 uppercase"
                      >
                        {exp.industry}
                      </p>
                      <div class="flex items-end justify-between gap-3">
                        <div class="min-w-0">
                          <p
                            class="truncate text-xs font-black tracking-wider text-white/85 uppercase"
                          >
                            {exp.role}
                          </p>
                          <p class="mt-1 font-mono text-xs tracking-tight text-white/60">
                            {exp.period}
                          </p>
                        </div>
                        <span
                          class="shrink-0 rounded border border-white/10 bg-black/25 px-2 py-1 text-xs font-black text-amber-200 uppercase"
                          >{isActive ? 'In bill' : 'View'}</span
                        >
                      </div>
                    </div>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </section>

      <!-- Speaking Section (Card Binder) -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="speaking">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <Mic class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Public Talks</h2>
        </div>

        <div class="relative overflow-hidden bg-[#080706] p-2 shadow-2xl shadow-black/40 lg:p-4">
          <div
            class="pointer-events-none absolute inset-y-4 left-1/2 z-0 hidden w-10 -translate-x-1/2 border-x border-amber-500/15 bg-gradient-to-r from-black via-[#17110a] to-black shadow-[inset_12px_0_18px_rgba(0,0,0,0.75),inset_-12px_0_18px_rgba(0,0,0,0.75)] lg:block"
            aria-hidden="true"
          ></div>
          <div
            class="pointer-events-none absolute inset-y-7 left-1/2 z-0 hidden w-px bg-amber-400/35 lg:block"
            aria-hidden="true"
          ></div>

          <div class="relative z-10 grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-10">
            {#each speakingBinderPages as page (page.label)}
              <div class="relative bg-[#0b0a09] p-3 sm:p-4 lg:p-5">
                <div class="relative mb-3 flex items-center justify-between">
                  <p class="text-xs font-black tracking-[0.2em] text-stone-500 uppercase">
                    {page.label}
                  </p>
                  <div class="flex gap-1.5">
                    {#each Array(3) as _, ring}
                      <span
                        class="size-2 rounded-full border border-amber-500/25 bg-black"
                        aria-hidden="true"
                      ></span>
                    {/each}
                  </div>
                </div>

                <div class="relative grid grid-cols-1 items-start gap-2 sm:grid-cols-2">
                  {#each page.items as { item, index } (item.role + item.organization + item.period)}
                    {@const proof = item.attachments?.find((att) => att.image)}
                    {@const coverImage = item.coverImage ?? proof?.image}
                    <article
                      class="group relative overflow-hidden bg-white/[0.035] p-1 shadow-inner shadow-white/5 transition duration-300 hover:bg-white/[0.055]"
                    >
                      <button
                        type="button"
                        class="relative block w-full cursor-pointer overflow-hidden bg-stone-950 text-left ring-1 ring-white/10 transition group-hover:ring-amber-400/40"
                        onclick={() => {
                          if (proof?.image) {
                            openLightbox(proof.image, `${item.role} @ ${item.organization}`);
                          }
                        }}
                        aria-label={`Open proof for ${item.role} at ${item.organization}`}
                      >
                        <div class="relative aspect-[4/3] overflow-hidden">
                          {#if coverImage}
                            <img
                              src={coverImage}
                              alt={`${item.organization} ${proof?.name ?? 'cover image'}`}
                              loading="lazy"
                              decoding="async"
                              class="size-full object-cover object-center opacity-90 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                            />
                          {:else}
                            <div
                              class="flex size-full items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.16),transparent_32%),linear-gradient(135deg,#181818,#070707)]"
                            >
                              <Mic class="size-9 text-amber-400/70" />
                            </div>
                          {/if}
                          <div
                            class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-2.5 pt-8 pb-2"
                          >
                            <p class="font-outfit truncate text-sm font-black text-amber-300">
                              {item.audience ?? item.duration}
                            </p>
                          </div>
                        </div>

                        <div class="space-y-1.5 border-t border-stone-800 bg-black px-2.5 py-2">
                          <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0">
                              <p class="font-outfit truncate text-xs font-black text-white">
                                {item.role}
                              </p>
                              <p
                                class="mt-0.5 truncate text-xs font-bold tracking-[0.12em] text-stone-400 uppercase"
                              >
                                {item.organization}
                              </p>
                            </div>
                            <p class="shrink-0 font-mono text-xs text-stone-500">
                              {getPeriodYear(item.period)}
                            </p>
                          </div>
                        </div>
                      </button>
                    </article>
                  {/each}

                  {#each Array(Math.max(0, 4 - page.items.length)) as _, emptyIndex}
                    <div
                      class="hidden overflow-hidden bg-white/[0.025] p-1 shadow-inner shadow-white/5 sm:block"
                      aria-hidden="true"
                    >
                      <div class="overflow-hidden bg-stone-950/70 ring-1 ring-white/8">
                        <div
                          class="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_45%,rgba(245,158,11,0.06),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.025),rgba(0,0,0,0.12))]"
                        >
                          <div class="h-14 w-10 border border-dashed border-stone-800/70"></div>
                          <p class="text-xs font-black tracking-[0.18em] text-stone-600 uppercase">
                            Open for talks
                          </p>
                        </div>
                        <div class="space-y-1.5 border-t border-stone-800 bg-black px-2.5 py-2">
                          <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0 flex-1 space-y-1.5">
                              <div class="h-3 w-16 bg-white/[0.035]"></div>
                              <div class="h-2 w-24 bg-white/[0.025]"></div>
                            </div>
                            <div class="h-2 w-7 bg-white/[0.025]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>
      </section>

      <!-- Volunteering Section (Red Lacquer Card Grid) -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="volunteering">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <div class="flex items-center gap-3">
            <Heart class="size-6 animate-pulse text-red-500" />
            <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Community Work</h2>
          </div>
        </div>

        {#if multiRoleVolunteeringGroups.length > 0}
          <div class="grid grid-cols-1 gap-6">
            {#each multiRoleVolunteeringGroups as group (group.organization)}
              <!-- Crimson Lacquer styled card -->
              <div
                class="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-red-900/70 bg-gradient-to-br from-[#170808] via-[#120707] to-[#090505] p-4 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/45 hover:shadow-[0_16px_40px_rgba(120,24,24,0.28)]"
              >
                <div class="space-y-3">
                  <div class="flex items-start gap-2.5">
                    <div
                      class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-500/30 bg-gradient-to-br from-red-900 via-red-950 to-stone-950"
                    >
                      {#if group.logo}
                        <img
                          src={group.logo}
                          alt={`${group.organization} logo`}
                          loading="lazy"
                          decoding="async"
                          class="h-full w-full object-cover object-center"
                        />
                      {:else}
                        <span class="font-outfit text-xs font-black tracking-widest text-amber-400">
                          {group.initials}
                        </span>
                      {/if}
                    </div>
                    <div class="min-w-0 space-y-1">
                      <h3
                        class="font-outfit text-sm leading-snug font-bold text-white transition-colors group-hover:text-amber-400"
                      >
                        {group.organization}
                      </h3>
                      {#if group.commonCategory}
                        <p
                          class="text-xs font-semibold tracking-[0.18em] text-red-300/95 uppercase"
                        >
                          {group.commonCategory}
                        </p>
                      {/if}
                    </div>
                  </div>

                  <div class="space-y-2.5">
                    {#each group.items as item (item.role + item.period)}
                      <div
                        class="flex h-full flex-col rounded-lg border border-red-950/40 bg-[#1a1111]/88 p-2.5"
                      >
                        <div class="flex items-start justify-between gap-2">
                          {#if !group.commonCategory}
                            <span
                              class="rounded border border-red-700/45 bg-red-950/80 px-2 py-0.5 text-xs font-black tracking-widest text-red-300 uppercase"
                            >
                              {item.category}
                            </span>
                          {:else}
                            <span></span>
                          {/if}
                        </div>

                        <div class="mt-1.5 space-y-1">
                          <div
                            class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1"
                          >
                            <h4 class="font-outfit text-sm leading-snug font-bold text-white">
                              {item.role}
                            </h4>
                            <span class="font-mono text-xs font-medium text-stone-500">
                              {item.period}
                            </span>
                          </div>

                          {#if item.description}
                            <p class="text-xs leading-relaxed text-stone-500">
                              {@html item.description}
                            </p>
                          {/if}
                        </div>

                        {#if item.attachments && item.attachments.length > 0}
                          <div
                            class="border-stone-850 mt-2.5 flex flex-wrap gap-1.5 border-t pt-2.5"
                          >
                            {#each item.attachments as att, idx (idx)}
                              {#if att.image}
                                <button
                                  type="button"
                                  class="inline-flex cursor-zoom-in items-center gap-1 rounded border border-stone-800 bg-stone-900 px-2 py-0.5 text-xs font-bold text-amber-500 transition-colors hover:text-amber-400"
                                  onclick={() =>
                                    openLightbox(
                                      att.image || '',
                                      `${item.role} @ ${item.organization} - ${att.name}`
                                    )}
                                >
                                  <span>📎</span>
                                  <span>{att.name}</span>
                                </button>
                              {:else}
                                <span
                                  class="border-stone-850 inline-flex items-center gap-1 rounded border bg-stone-900 px-2 py-0.5 text-xs font-medium text-stone-600 select-none"
                                >
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
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if singleRoleVolunteeringGroups.length > 0}
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {#each singleRoleVolunteeringGroups as group (group.organization)}
              {@const item = group.items[0]}
              <div
                class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-red-900/70 bg-gradient-to-br from-[#170808] via-[#120707] to-[#090505] p-3 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/45 hover:shadow-[0_16px_40px_rgba(120,24,24,0.28)]"
              >
                <div class="flex h-full flex-col gap-2.5">
                  <div class="flex min-h-14 items-start gap-2">
                    <div
                      class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-amber-500/30 bg-gradient-to-br from-red-900 via-red-950 to-stone-950"
                    >
                      {#if group.logo}
                        <img
                          src={group.logo}
                          alt={`${group.organization} logo`}
                          loading="lazy"
                          decoding="async"
                          class="h-full w-full object-cover object-center"
                        />
                      {:else}
                        <span class="font-outfit text-xs font-black tracking-widest text-amber-400">
                          {group.initials}
                        </span>
                      {/if}
                    </div>
                    <div class="min-w-0 flex-1 space-y-1">
                      <h3
                        class="font-outfit text-sm leading-snug font-bold text-white transition-colors group-hover:text-amber-400"
                      >
                        {group.organization}
                      </h3>
                      {#if group.commonCategory}
                        <p
                          class="text-xs font-semibold tracking-[0.18em] text-red-300/95 uppercase"
                        >
                          {group.commonCategory}
                        </p>
                      {/if}
                    </div>
                  </div>

                  <div
                    class="flex min-h-24 flex-1 flex-col rounded-lg border border-red-950/40 bg-[#1a1111]/88 p-2"
                  >
                    <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <h4 class="font-outfit text-sm leading-snug font-bold text-white">
                        {item.role}
                      </h4>
                      <span class="font-mono text-xs font-medium text-stone-500">
                        {item.period}
                      </span>
                    </div>

                    {#if item.description}
                      <p class="mt-1 flex-1 text-xs leading-relaxed text-stone-500">
                        {@html item.description}
                      </p>
                    {/if}

                    {#if item.attachments && item.attachments.length > 0}
                      <div class="border-stone-850 mt-2 flex flex-wrap gap-1.5 border-t pt-2">
                        {#each item.attachments as att, idx (idx)}
                          {#if att.image}
                            <button
                              type="button"
                              class="inline-flex cursor-zoom-in items-center gap-1 rounded border border-stone-800 bg-stone-900 px-2 py-0.5 text-xs font-bold text-amber-500 transition-colors hover:text-amber-400"
                              onclick={() =>
                                openLightbox(
                                  att.image || '',
                                  `${item.role} @ ${item.organization} - ${att.name}`
                                )}
                            >
                              <span>📎</span>
                              <span>{att.name}</span>
                            </button>
                          {:else}
                            <span
                              class="border-stone-850 inline-flex items-center gap-1 rounded border bg-stone-900 px-2 py-0.5 text-xs font-medium text-stone-600 select-none"
                            >
                              <span>📎</span>
                              <span>{att.name}</span>
                            </span>
                          {/if}
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </section>

      <!-- Projects Section (Interactive Filters) -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="projects">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <div class="flex items-center gap-3">
            <Code class="size-6 text-amber-500" />
            <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Key Projects</h2>
          </div>
        </div>

        <!-- Filtered Project List -->
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {#each filteredProjects as project (project.title)}
            <a
              href={project.href ?? project.image ?? '#projects'}
              target="_blank"
              rel="noreferrer"
              class="group grid w-full grid-cols-[4.5rem_minmax(0,1fr)] gap-4 rounded-xl bg-stone-950/80 p-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045),0_10px_28px_rgba(0,0,0,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-stone-900/70 hover:shadow-[inset_0_0_0_1px_rgba(245,158,11,0.12),0_14px_32px_rgba(0,0,0,0.24)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:items-center sm:p-4"
            >
              <div
                class="font-outfit flex size-18 items-center justify-center text-lg font-black tracking-wide text-amber-400 sm:size-22 sm:text-xl"
                aria-hidden="true"
              >
                {#if project.iconImage}
                  <img
                    src={project.iconImage}
                    alt=""
                    class="project-logo size-14 object-contain sm:size-18"
                    style={`--project-logo-scale: ${project.logoScale};`}
                  />
                {:else}
                  {project.icon}
                {/if}
              </div>

              <div class="min-w-0 space-y-2">
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 class="font-outfit text-base leading-tight font-bold text-white">
                    {project.title}
                  </h3>
                </div>
                <p class="max-w-3xl text-xs leading-relaxed text-stone-400">
                  {project.description}
                </p>
              </div>
            </a>
          {/each}
        </div>
      </section>

      <!-- Awards Section (Decorated Trophies & Medallions) -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="awards">
        <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
          <Trophy class="size-6 text-amber-500" />
          <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Competition Wins</h2>
        </div>

        <!-- Awards Card Grid -->
        <div class="flex flex-wrap justify-center gap-6">
          {#each awards as award (award.competition)}
            <button
              type="button"
              class="group flex w-full cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-stone-950 text-left shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-stone-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(245,158,11,0.12)] hover:ring-amber-500/15 focus:outline-none md:max-w-[calc(50%-0.75rem)] lg:max-w-[calc(33.333%-1rem)]"
              onclick={() =>
                openLightbox(
                  award.certificateImage || award.image || '',
                  `${award.competition} - ${award.title}`
                )}
              disabled={!award.certificateImage && !award.image}
            >
              <!-- Card Media (Image or gold medallion vector) -->
              <div
                class="relative flex h-44 w-full items-center justify-center overflow-hidden bg-[#141211]"
              >
                {#if award.image}
                  <img
                    src={award.image}
                    alt={award.competition}
                    loading="lazy"
                    decoding="async"
                    class="size-full object-cover"
                  />
                  <div
                    class="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20"
                  ></div>
                {:else}
                  <!-- Beautiful vector gold coin / medal outline with red ribbon in background -->
                  <div
                    class="flex size-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-red-950/20 to-amber-950/30 p-4 text-center"
                  >
                    <!-- Ribbon vector -->
                    <div
                      class="absolute top-0 z-0 h-20 w-8 rounded-b border-x border-amber-500/20 bg-gradient-to-b from-red-700 to-red-900 opacity-80"
                    ></div>
                    <!-- Golden Seal Medallion -->
                    <div
                      class="relative z-10 flex size-16 animate-pulse items-center justify-center rounded-full border border-amber-600 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-lg"
                    >
                      <Trophy class="size-8 text-amber-950" />
                    </div>
                  </div>
                {/if}
              </div>

              <!-- Card Content -->
              <div class="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div class="space-y-3">
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      class="rounded bg-stone-900/80 px-2 py-0.5 text-xs font-semibold tracking-widest text-stone-400 uppercase"
                    >
                      {award.title}
                    </span>
                    <span
                      class="rounded bg-stone-900/80 px-2 py-0.5 text-xs font-semibold tracking-widest text-stone-500 uppercase"
                    >
                      {award.scope}
                    </span>
                  </div>
                  <h3
                    class="font-outfit line-clamp-2 text-sm leading-snug font-bold text-stone-200 transition-colors group-hover:text-amber-400"
                  >
                    {award.competition}
                  </h3>
                  <p class="text-xs font-semibold text-stone-500">
                    {award.organizer}
                  </p>
                </div>

                <div
                  class="border-stone-850 flex items-center justify-between border-t pt-2 text-xs text-stone-500"
                >
                  <span class="font-mono">{award.year}</span>
                  {#if award.certificateImage || award.image}
                    <span
                      class="flex items-center gap-1 font-bold text-amber-500 group-hover:underline"
                    >
                      View Certificate
                      <ArrowUpRight class="size-3" />
                    </span>
                  {/if}
                </div>
              </div>
            </button>
          {/each}
        </div>
      </section>

      <!-- Mahogany Digital Bookshelf -->
      <section use:reveal={{}} class="reveal-on-scroll scroll-mt-24 space-y-6" id="bookshelf">
        <div
          class="flex flex-col gap-4 border-b border-stone-800 pb-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-center gap-3">
            <BookOpen class="size-6 text-amber-500" />
            <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Reading Shelf</h2>
          </div>

          <div class="flex flex-wrap gap-1.5">
            {#each bookshelfCollections as collection (collection.id)}
              <button
                type="button"
                class="cursor-pointer rounded-full border px-3 py-1 text-xs font-black tracking-wider uppercase transition-all {activeBookshelfCollection ===
                collection.id
                  ? 'border-amber-500 bg-amber-500 text-stone-950 shadow-md'
                  : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700 hover:text-stone-200'}"
                onclick={() => (activeBookshelfCollection = collection.id)}
              >
                {collection.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Mahogany Book Rack grid -->
        <div class="flex flex-wrap justify-center gap-x-6 gap-y-8 pt-2">
          {#each activeBookshelfGroups as bookGroup, groupIndex (groupIndex)}
            <div class="bookshelf-platform-group">
              <div class="flex min-h-40 items-end justify-center gap-3 px-3">
                {#each bookGroup as book (book.title)}
                  <div class="group flex items-end justify-center">
                    <div
                      class={`bookshelf-book relative ${getBookshelfCoverClass(book.title)} shadow-xl transition-all duration-300 [perspective:1000px] group-hover:-translate-y-2`}
                    >
                      <img
                        src="/covers/{book.cover}"
                        alt="{book.title} cover"
                        loading="lazy"
                        decoding="async"
                        class="block w-full rounded-sm border border-stone-800 shadow-md"
                      />
                    </div>
                  </div>
                {/each}
              </div>

              <div class="bookshelf-platform" aria-hidden="true"></div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Skills & Language Details -->
      <section
        use:reveal={{ distance: 22 }}
        class="reveal-on-scroll grid grid-cols-1 gap-8 md:grid-cols-3"
      >
        <!-- Skills -->
        <div class="space-y-6 md:col-span-2">
          <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
            <Wrench class="size-6 text-amber-500" />
            <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">Core Skills</h2>
          </div>

          <div class="border-stone-850 space-y-5 rounded-2xl border bg-stone-950 p-5">
            {#each skillCategories as cat, idx (cat.title)}
              <div class="space-y-4">
                <h3 class="font-outfit text-xs font-black tracking-wider text-amber-500 uppercase">
                  {cat.title}
                </h3>
                <div class="flex flex-wrap gap-1.5">
                  {#each cat.skills as skill (skill)}
                    <span
                      class="skill-chip flex items-center gap-1.5 rounded px-2 py-1 text-xs text-stone-300"
                    >
                      {#if skillIconMap[skill]}
                        <img src={skillIconMap[skill]} alt="" class="size-3.5 object-contain" />
                      {/if}
                      {skill}
                    </span>
                  {/each}
                </div>
              </div>
              {#if idx < skillCategories.length - 1}
                <div class="border-stone-850/60 border-t"></div>
              {/if}
            {/each}
          </div>
        </div>

        <!-- Languages with coin scores rating -->
        <div class="space-y-6">
          <div class="flex items-center gap-3 border-b border-stone-800 pb-3">
            <Languages class="size-6 text-amber-500" />
            <h2 class="font-outfit text-2xl font-bold tracking-tight text-white">
              Language Skills
            </h2>
          </div>

          <div class="border-stone-850 space-y-5 rounded-2xl border bg-stone-950 p-6">
            {#each languages as lang (lang.name)}
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="flex items-center gap-2 font-bold text-white">
                    <span class="text-base select-none">{lang.flag}</span>
                    {lang.name}
                  </span>
                </div>
                <p class="text-xs text-stone-500">{lang.desc}</p>

                <!-- Gold Coin rating rating progress -->
                <div class="flex items-center gap-1 pt-1">
                  {#each Array(5) as _, i (i)}
                    {#if i < lang.rating}
                      <!-- Active Gold Coin -->
                      <svg
                        class="size-4 text-amber-400 drop-shadow-md"
                        viewBox="0 0 100 100"
                        fill="currentColor"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="#F59E0B"
                          stroke="#B45309"
                          stroke-width="2"
                        />
                        <rect
                          x="35"
                          y="35"
                          width="30"
                          height="30"
                          fill="#0C0A09"
                          stroke="#B45309"
                          stroke-width="1.5"
                        />
                      </svg>
                    {:else}
                      <!-- Inactive Muted Coin -->
                      <svg class="size-4 text-stone-800" viewBox="0 0 100 100" fill="currentColor">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="#1C1917"
                          stroke="#292524"
                          stroke-width="2"
                        />
                        <rect
                          x="35"
                          y="35"
                          width="30"
                          height="30"
                          fill="#0C0A09"
                          stroke="#292524"
                          stroke-width="1.5"
                        />
                      </svg>
                    {/if}
                  {/each}
                </div>
              </div>
              {#if lang.name !== 'Mandarin'}
                <div class="border-stone-850/50 border-t"></div>
              {/if}
            {/each}
          </div>
        </div>
      </section>
    </main>

    <footer class="border-t border-amber-500/10 bg-[#070605] py-8">
      <div
        class="mx-auto flex max-w-5xl flex-col gap-4 px-6 text-xs text-stone-500 md:flex-row md:items-center md:justify-between"
      >
        <div class="space-y-1">
          <p class="font-outfit text-sm font-bold text-stone-200">Edward Salim</p>
          <p>Open to collaborating on product, automation, analytics, and AI-driven systems.</p>
        </div>

        <p class="text-stone-600 select-none">&copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  </div>
</div>

{#if lightboxOpen}
  <!-- Lightbox Backdrop -->
  <div
    class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-all duration-300"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && closeLightbox()}
    role="button"
    tabindex="0"
  >
    <!-- Close Button -->
    <button
      type="button"
      class="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none"
      onclick={closeLightbox}
    >
      <span class="sr-only">Close</span>
      <svg class="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Modal Content -->
    <div
      class="max-h-[80vh] max-w-4xl scale-100 overflow-hidden rounded-xl border border-white/10 bg-stone-950 shadow-2xl transition-transform duration-300"
    >
      <img
        src={lightboxImage}
        alt={lightboxTitle}
        decoding="async"
        class="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
      />
    </div>

    <div class="mt-4 text-center select-none">
      <p class="font-outfit text-sm font-semibold text-white">{lightboxTitle}</p>
    </div>
  </div>
{/if}

<style>
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
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
    0%,
    100% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(-22deg);
    }
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

  .bill-paper {
    isolation: isolate;
    background: #fff;
    box-shadow:
      0 24px 60px rgba(0, 0, 0, 0.24),
      inset 0 0 0 1px #0c0a09;
  }

  .bill-paper::before,
  .bill-paper::after {
    position: absolute;
    right: 1rem;
    left: 1rem;
    z-index: 2;
    height: 12px;
    content: '';
    background-image: radial-gradient(circle, #070605 0 4px, transparent 4.5px);
    background-repeat: repeat-x;
    background-size: 18px 12px;
    opacity: 1;
  }

  .bill-paper::before {
    top: -1px;
    transform: translateY(-50%);
  }

  .bill-paper::after {
    bottom: -1px;
    transform: translateY(50%);
  }

  .bill-line-copy strong {
    color: #1c1917;
    font-weight: 900;
  }

  .experience-card-sleeve {
    transform-origin: center bottom;
  }

  .bookshelf-platform-group {
    display: flex;
    max-width: 100%;
    flex-direction: column;
    align-items: stretch;
    filter: drop-shadow(0 0.7rem 0.8rem rgba(0, 0, 0, 0.24));
  }

  .bookshelf-book::after {
    position: absolute;
    right: 8%;
    bottom: -0.55rem;
    left: 8%;
    height: 0.38rem;
    content: '';
    background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.42), transparent 72%);
    filter: blur(2px);
    opacity: 0.72;
    transition:
      opacity 300ms ease,
      transform 300ms ease;
  }

  .group:hover .bookshelf-book::after {
    opacity: 0.5;
    transform: translateY(0.45rem) scaleX(0.78);
  }

  .bookshelf-platform {
    position: relative;
    z-index: 1;
    height: 0.78rem;
    min-width: min(100%, 15rem);
    margin-top: 0;
    border-radius: 0.16rem;
    border: 1px solid rgba(251, 191, 36, 0.1);
    border-bottom-color: rgba(0, 0, 0, 0.42);
    background:
      linear-gradient(180deg, rgba(251, 191, 36, 0.34), transparent 34%),
      linear-gradient(90deg, #2a1208 0%, #6a3215 45%, #3a190b 100%);
    box-shadow:
      inset 0 1px 0 rgba(251, 191, 36, 0.42),
      inset 0 -0.22rem 0 rgba(31, 12, 4, 0.38),
      0 0.38rem 0.85rem rgba(0, 0, 0, 0.32);
  }

  .bookshelf-platform::before {
    position: absolute;
    top: -0.24rem;
    right: 0.45rem;
    left: 0.45rem;
    height: 0.24rem;
    content: '';
    border: 1px solid rgba(251, 191, 36, 0.08);
    border-bottom: 0;
    border-radius: 0.12rem 0.12rem 0 0;
    background: linear-gradient(90deg, #1f0d05, #4d2210 48%, #261006);
    box-shadow: inset 0 1px 0 rgba(251, 191, 36, 0.2);
  }

  .bookshelf-platform::after {
    position: absolute;
    right: 0.35rem;
    bottom: -0.28rem;
    left: 0.35rem;
    height: 0.28rem;
    content: '';
    border-radius: 0 0 0.12rem 0.12rem;
    background: linear-gradient(90deg, #120703, #2c1107 48%, #160803);
  }

  .skill-chip {
    position: relative;
    overflow: hidden;
    border: 0;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.055), transparent 72%), rgba(41, 37, 36, 0.78);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.045),
      0 0.28rem 0.65rem rgba(0, 0, 0, 0.14);
    transition:
      background 180ms ease,
      box-shadow 180ms ease,
      transform 180ms ease;
  }

  .skill-chip:hover {
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.075), transparent 72%), rgba(57, 53, 50, 0.86);
    box-shadow:
      inset 0 0 0 1px rgba(245, 158, 11, 0.12),
      0 0.32rem 0.8rem rgba(0, 0, 0, 0.18);
    transform: translateY(-1px);
  }

  .project-logo {
    transform: scale(var(--project-logo-scale, 1));
    transition: transform 180ms ease;
  }

  :global(.reveal-on-scroll) {
    opacity: 0;
    transform: translate3d(0, var(--reveal-distance, 26px), 0) scale(0.985);
    filter: blur(10px);
    transition:
      opacity 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
      transform 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
      filter 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms);
    will-change: opacity, transform, filter;
  }

  :global([data-reveal='idle']) {
    opacity: 0;
    transform: translate3d(0, var(--reveal-distance, 26px), 0) scale(0.985);
    filter: blur(10px);
    transition:
      opacity 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
      transform 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms),
      filter 720ms cubic-bezier(0.22, 1, 0.36, 1) var(--reveal-delay, 0ms);
    will-change: opacity, transform, filter;
  }

  :global([data-reveal='visible']) {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
    filter: blur(0);
  }

  @media (prefers-reduced-motion: reduce) {
    :global([data-reveal]) {
      opacity: 1;
      transform: none;
      filter: none;
      transition: none;
    }
  }
</style>
