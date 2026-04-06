// ── Logo imports ──────────────────────────────────────
import ajaib from '$lib/assets/fintech_logos/indonesia/ajaib.png';
import akseleran from '$lib/assets/fintech_logos/indonesia/akseleran.png';
import akulaku from '$lib/assets/fintech_logos/indonesia/akulaku.png';
import alami from '$lib/assets/fintech_logos/indonesia/alami.png';
import allo_bank from '$lib/assets/fintech_logos/indonesia/allo_bank.png';
import amartha from '$lib/assets/fintech_logos/indonesia/amartha.png';
import asliri from '$lib/assets/fintech_logos/indonesia/asliri.png';
import astrapay from '$lib/assets/fintech_logos/indonesia/astrapay.png';
import atome from '$lib/assets/fintech_logos/indonesia/atome.png';
import awantunai from '$lib/assets/fintech_logos/indonesia/awantunai.png';
import ayoconnect from '$lib/assets/fintech_logos/indonesia/ayoconnect.png';
import bank_aladin from '$lib/assets/fintech_logos/indonesia/bank_aladin.png';
import bank_jago from '$lib/assets/fintech_logos/indonesia/bank_jago.png';
import bareksa from '$lib/assets/fintech_logos/indonesia/bareksa.png';
import batumbu from '$lib/assets/fintech_logos/indonesia/batumbu.png';
import bibit from '$lib/assets/fintech_logos/indonesia/bibit.png';
import bittime from '$lib/assets/fintech_logos/indonesia/bittime.png';
import blu_bca from '$lib/assets/fintech_logos/indonesia/blu_bca.png';
import bnc from '$lib/assets/fintech_logos/indonesia/bnc.png';
import bukuwarung from '$lib/assets/fintech_logos/indonesia/bukuwarung.png';
import cashup from '$lib/assets/fintech_logos/indonesia/cashup.png';
import cekaja from '$lib/assets/fintech_logos/indonesia/cekaja.png';
import dana from '$lib/assets/fintech_logos/indonesia/dana.png';
import dbs_digibank from '$lib/assets/fintech_logos/indonesia/dbs_digibank.png';
import fazz from '$lib/assets/fintech_logos/indonesia/fazz.png';
import finfra from '$lib/assets/fintech_logos/indonesia/finfra.png';
import flip from '$lib/assets/fintech_logos/indonesia/flip.png';
import gopay from '$lib/assets/fintech_logos/indonesia/gopay.png';
import indodana from '$lib/assets/fintech_logos/indonesia/indodana.png';
import indodax from '$lib/assets/fintech_logos/indonesia/indodax.png';
import jenius from '$lib/assets/fintech_logos/indonesia/jenius.png';
import kitabisa from '$lib/assets/fintech_logos/indonesia/kitabisa.png';
import koinworks from '$lib/assets/fintech_logos/indonesia/koinworks.png';
import kreditpintar from '$lib/assets/fintech_logos/indonesia/kreditpintar.png';
import kredivo from '$lib/assets/fintech_logos/indonesia/kredivo.png';
import lifepal from '$lib/assets/fintech_logos/indonesia/lifepal.png';
import line_bank from '$lib/assets/fintech_logos/indonesia/line_bank.png';
import linkaja from '$lib/assets/fintech_logos/indonesia/linkaja.png';
import mekari from '$lib/assets/fintech_logos/indonesia/mekari.png';
import modalku from '$lib/assets/fintech_logos/indonesia/modalku.png';
import nobi from '$lib/assets/fintech_logos/indonesia/nobi.png';
import ovo from '$lib/assets/fintech_logos/indonesia/ovo.png';
import pajak from '$lib/assets/fintech_logos/indonesia/pajak.png';
import paper_id from '$lib/assets/fintech_logos/indonesia/paper_id.png';
import pasarpolis from '$lib/assets/fintech_logos/indonesia/pasarpolis.png';
import pinhome from '$lib/assets/fintech_logos/indonesia/pinhome.png';
import pintu from '$lib/assets/fintech_logos/indonesia/pintu.png';
import pluang from '$lib/assets/fintech_logos/indonesia/pluang.png';
import privy from '$lib/assets/fintech_logos/indonesia/privy.png';
import qoala from '$lib/assets/fintech_logos/indonesia/qoala.png';
import reku from '$lib/assets/fintech_logos/indonesia/reku.png';
import rey from '$lib/assets/fintech_logos/indonesia/rey.png';
import ringkas from '$lib/assets/fintech_logos/indonesia/ringkas.png';
import seabank from '$lib/assets/fintech_logos/indonesia/seabank.png';
import shopeepay from '$lib/assets/fintech_logos/indonesia/shopeepay.png';
import skorlife from '$lib/assets/fintech_logos/indonesia/skorlife.png';
import stockbit from '$lib/assets/fintech_logos/indonesia/stockbit.png';
import tokocrypto from '$lib/assets/fintech_logos/indonesia/tokocrypto.png';
import uob_tmrw from '$lib/assets/fintech_logos/indonesia/uob_tmrw.png';
import upbit from '$lib/assets/fintech_logos/indonesia/upbit.png';
import wagely from '$lib/assets/fintech_logos/indonesia/wagely.png';
import xendit from '$lib/assets/fintech_logos/indonesia/xendit.png';
import yup from '$lib/assets/fintech_logos/indonesia/yup.png';

// ── Types ─────────────────────────────────────────────

export type FintechCategory =
  | 'Digital Banks'
  | 'Lending'
  | 'Payments'
  | 'Personal Finance'
  | 'Mortgage'
  | 'Infrastructure'
  | 'Blockchain'
  | 'Insurtech'
  | 'Regtech'
  | 'Business Finance'
  | 'Wealthtech'
  | 'Other';

export type Region = 'Indonesia' | 'US';

export const ALL_REGIONS: Region[] = ['Indonesia', 'US'];

export interface Company {
  id: string;
  name: string;
  category: FintechCategory;
  region: Region;
  focus: string;
  founded: number;
  revenueModel: string;
  backedBy: string;
  license: string;
  description: string;
  logo: string;
  // Strategic fields for comparison
  targetAudience: string;
  marketShare: string;
  growth: string;
  priceStructure: string;
  marketingStrategies: string;
  customerSatisfaction: number;
  strengths: string;
  weaknesses: string;
  keyAdvantage: string;
}

export const ALL_FINTECH_CATEGORIES: FintechCategory[] = [
  'Digital Banks',
  'Lending',
  'Payments',
  'Personal Finance',
  'Mortgage',
  'Infrastructure',
  'Blockchain',
  'Insurtech',
  'Regtech',
  'Business Finance',
  'Wealthtech',
  'Other'
];

// ── Dummy "My Project" ────────────────────────────────

export const MY_PROJECT: Company = {
  id: '_my_project',
  name: 'My Project',
  category: 'Payments',
  focus: 'Digital payments',
  founded: 2024,
  revenueModel: 'Transaction fees',
  backedBy: 'Self-funded',
  license: 'Pending',
  description: 'Our fintech project — edit to match your actual product',
  region: 'Indonesia',
  logo: '',
  targetAudience: 'Indonesian millennials',
  marketShare: 'New entrant',
  growth: 'Pre-launch',
  priceStructure: 'Freemium',
  marketingStrategies: 'Community, social media',
  customerSatisfaction: 0,
  strengths: 'Lean team, fast iteration',
  weaknesses: 'New entrant, limited brand',
  keyAdvantage: 'Niche focus + local insight'
};

// ── Strategic defaults by category ────────────────────
type StrategicDefaults = Omit<
  Company,
  | 'id'
  | 'name'
  | 'category'
  | 'focus'
  | 'founded'
  | 'revenueModel'
  | 'backedBy'
  | 'license'
  | 'description'
  | 'logo'
  | 'region'
>;

const CATEGORY_DEFAULTS: Record<FintechCategory, StrategicDefaults> = {
  'Digital Banks': {
    targetAudience: 'Tech-savvy millennials & Gen Z',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Free accounts, premium tiers',
    marketingStrategies: 'Digital ads, app store',
    customerSatisfaction: 3,
    strengths: 'Low cost, mobile-first UX',
    weaknesses: 'Limited branch network',
    keyAdvantage: 'Convenience + digital integration'
  },
  Lending: {
    targetAudience: 'MSMEs & underbanked individuals',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Interest + origination fees',
    marketingStrategies: 'Agent network, partnerships',
    customerSatisfaction: 3,
    strengths: 'Fast disbursement, AI scoring',
    weaknesses: 'High default risk',
    keyAdvantage: 'Financial inclusion'
  },
  Payments: {
    targetAudience: 'Mass market consumers & merchants',
    marketShare: '-',
    growth: '-',
    priceStructure: 'MDR fees, float income',
    marketingStrategies: 'Cashback, partnerships',
    customerSatisfaction: 4,
    strengths: 'Network effects, ecosystem',
    weaknesses: 'Thin margins, subsidy wars',
    keyAdvantage: 'Ubiquity + merchant network'
  },
  'Personal Finance': {
    targetAudience: 'Young professionals',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Freemium, subscription',
    marketingStrategies: 'Content marketing, referrals',
    customerSatisfaction: 4,
    strengths: 'Low entry barrier',
    weaknesses: 'Low ARPU',
    keyAdvantage: 'Simplifying finance'
  },
  Mortgage: {
    targetAudience: 'Home buyers',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Interest margin, referral fees',
    marketingStrategies: 'Property portals, agents',
    customerSatisfaction: 3,
    strengths: 'Large ticket size',
    weaknesses: 'Long sales cycle',
    keyAdvantage: 'Digitizing slow processes'
  },
  Infrastructure: {
    targetAudience: 'Banks, fintechs, enterprises',
    marketShare: '-',
    growth: '-',
    priceStructure: 'SaaS, API call fees',
    marketingStrategies: 'Developer outreach, B2B sales',
    customerSatisfaction: 4,
    strengths: 'B2B stickiness',
    weaknesses: 'Long sales cycles',
    keyAdvantage: 'Enabling the ecosystem'
  },
  Blockchain: {
    targetAudience: 'Crypto traders & enthusiasts',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Trading fees, spread',
    marketingStrategies: 'Community, social media',
    customerSatisfaction: 3,
    strengths: 'High engagement',
    weaknesses: 'Regulatory uncertainty',
    keyAdvantage: 'Global crypto access'
  },
  Insurtech: {
    targetAudience: 'Insurance buyers, SMEs',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Premium commissions, SaaS',
    marketingStrategies: 'Embedded insurance, partners',
    customerSatisfaction: 3,
    strengths: 'Simplified onboarding',
    weaknesses: 'Trust gap',
    keyAdvantage: 'Making insurance accessible'
  },
  Regtech: {
    targetAudience: 'Financial institutions',
    marketShare: '-',
    growth: '-',
    priceStructure: 'SaaS licensing',
    marketingStrategies: 'Industry events, direct sales',
    customerSatisfaction: 4,
    strengths: 'Compliance automation',
    weaknesses: 'Niche market',
    keyAdvantage: 'Regulatory expertise'
  },
  'Business Finance': {
    targetAudience: 'SMEs & micro-merchants',
    marketShare: '-',
    growth: '-',
    priceStructure: 'SaaS, transaction fees',
    marketingStrategies: 'SME communities, referrals',
    customerSatisfaction: 3,
    strengths: 'Bundled solutions',
    weaknesses: 'SME churn',
    keyAdvantage: 'All-in-one business tools'
  },
  Wealthtech: {
    targetAudience: 'Retail investors',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Management fees, commissions',
    marketingStrategies: 'Social trading, content',
    customerSatisfaction: 4,
    strengths: 'Automated investing',
    weaknesses: 'Market-dependent revenue',
    keyAdvantage: 'Democratizing wealth management'
  },
  Other: {
    targetAudience: 'Various',
    marketShare: '-',
    growth: '-',
    priceStructure: 'Mixed',
    marketingStrategies: 'Various',
    customerSatisfaction: 3,
    strengths: 'Innovation',
    weaknesses: 'Market fit',
    keyAdvantage: 'Niche expertise'
  }
};

// Known strategic data for major companies
const COMPANY_OVERRIDES: Record<string, Partial<Company>> = {
  gopay: {
    targetAudience: 'Gojek ecosystem users, merchants',
    marketShare: '~35%',
    growth: '15% YoY',
    priceStructure: 'MDR 0.7%, GoPay Coins cashback',
    marketingStrategies: 'Cashback, Gojek integration, merchant promos',
    customerSatisfaction: 4,
    strengths: 'Gojek super-app integration, massive merchant base',
    weaknesses: 'Dependent on Gojek ecosystem',
    keyAdvantage: 'Largest O2O payment network in ID'
  },
  dana: {
    targetAudience: 'Mass market, online shoppers',
    marketShare: '~20%',
    growth: '20% YoY',
    priceStructure: 'Free P2P, MDR for merchants',
    marketingStrategies: 'Social media, cashback promos, partnerships',
    customerSatisfaction: 4,
    strengths: 'Ant Group tech, strong UI/UX',
    weaknesses: 'Less merchant penetration vs GoPay/OVO',
    keyAdvantage: 'Ant Group backing + open platform'
  },
  ovo: {
    targetAudience: 'Grab users, mall shoppers',
    marketShare: '~25%',
    growth: '10% YoY',
    priceStructure: 'MDR fees, loyalty points',
    marketingStrategies: 'Grab ecosystem, mall partnerships, loyalty',
    customerSatisfaction: 4,
    strengths: 'Grab + Tokopedia ecosystem',
    weaknesses: 'Profitability concerns',
    keyAdvantage: 'Dual ecosystem (ride-hail + e-commerce)'
  },
  linkaja: {
    targetAudience: 'SOE ecosystem, public transit users',
    marketShare: '~8%',
    growth: '5% YoY',
    priceStructure: 'MDR, government partnerships',
    marketingStrategies: 'Government channels, SOE partnerships',
    customerSatisfaction: 3,
    strengths: 'Government & SOE backing',
    weaknesses: 'Slower product innovation',
    keyAdvantage: 'Government & public service integration'
  },
  flip: {
    targetAudience: 'Individuals, SMEs doing bank transfers',
    marketShare: '~5% (transfers)',
    growth: '25% YoY',
    priceStructure: 'Free for individuals, fees for business',
    marketingStrategies: 'Word of mouth, SEO, content marketing',
    customerSatisfaction: 5,
    strengths: 'Zero-fee transfers, trusted brand',
    weaknesses: 'Narrow product scope',
    keyAdvantage: 'Free interbank transfers'
  },
  kredivo: {
    targetAudience: 'Online shoppers, young professionals',
    marketShare: '~30% (BNPL)',
    growth: '20% YoY',
    priceStructure: 'Interest on credit, merchant fees',
    marketingStrategies: 'E-commerce integration, digital ads',
    customerSatisfaction: 4,
    strengths: 'Instant credit decisioning, e-commerce integration',
    weaknesses: 'Credit risk, regulatory changes',
    keyAdvantage: 'Largest digital credit platform in ID'
  },
  bibit: {
    targetAudience: 'First-time mutual fund investors',
    marketShare: '~25% (robo)',
    growth: '30% YoY',
    priceStructure: 'Management fees (shared with funds)',
    marketingStrategies: 'Content education, social media, Stockbit synergy',
    customerSatisfaction: 5,
    strengths: 'Robo-advisor simplicity, Stockbit synergy',
    weaknesses: 'Low margins per user',
    keyAdvantage: 'Easiest mutual fund onboarding'
  },
  ajaib: {
    targetAudience: 'Young retail stock traders',
    marketShare: '~15% (retail)',
    growth: '20% YoY',
    priceStructure: 'Brokerage commissions',
    marketingStrategies: 'Influencer marketing, digital ads, referrals',
    customerSatisfaction: 4,
    strengths: 'Modern UI, low minimums',
    weaknesses: 'Competition from legacy brokers',
    keyAdvantage: 'Millennial-first stock trading'
  },
  bank_jago: {
    targetAudience: 'Digital-native Indonesians',
    marketShare: '~5% (digital bank)',
    growth: '40% YoY',
    priceStructure: 'Free accounts, ecosystem revenue',
    marketingStrategies: 'GoPay integration, digital-first branding',
    customerSatisfaction: 4,
    strengths: 'GoPay/Gojek integration, solid tech',
    weaknesses: 'Limited product range',
    keyAdvantage: 'Best-in-class digital bank UX'
  },
  jenius: {
    targetAudience: 'Urban professionals',
    marketShare: '~10% (digital bank)',
    growth: '8% YoY',
    priceStructure: 'Free basic, premium features',
    marketingStrategies: 'Lifestyle branding, community events',
    customerSatisfaction: 4,
    strengths: 'Pioneer neobank, feature-rich',
    weaknesses: 'BTPN legacy costs',
    keyAdvantage: 'First mover in ID digital banking'
  },
  amartha: {
    targetAudience: 'Rural women micro-entrepreneurs',
    marketShare: '~10% (P2P)',
    growth: '15% YoY',
    priceStructure: 'Interest spread on microloans',
    marketingStrategies: 'Field agents, community groups, impact investors',
    customerSatisfaction: 4,
    strengths: 'Deep rural penetration, social impact',
    weaknesses: 'High operational cost per loan',
    keyAdvantage: 'Rural microfinance at scale'
  },
  mekari: {
    targetAudience: 'Indonesian SMEs & enterprises',
    marketShare: '~20% (biz SaaS)',
    growth: '25% YoY',
    priceStructure: 'SaaS subscription',
    marketingStrategies: 'B2B sales, webinars, partnerships',
    customerSatisfaction: 4,
    strengths: 'Full-stack business tools (HR, accounting, tax)',
    weaknesses: 'Enterprise sales complexity',
    keyAdvantage: 'All-in-one business platform for ID'
  },
  xendit: {
    targetAudience: 'Businesses needing payment infra',
    marketShare: '~15% (payment infra)',
    growth: '30% YoY',
    priceStructure: 'Per-transaction API fees',
    marketingStrategies: 'Developer docs, hackathons, B2B sales',
    customerSatisfaction: 5,
    strengths: 'Developer-friendly, reliable infra',
    weaknesses: 'B2B only, no consumer brand',
    keyAdvantage: 'Stripe of Southeast Asia'
  },
  kitabisa: {
    targetAudience: 'Donors & social causes',
    marketShare: '~60% (crowdfunding)',
    growth: '10% YoY',
    priceStructure: 'Platform fee on donations',
    marketingStrategies: 'Social media, viral campaigns, partnerships',
    customerSatisfaction: 5,
    strengths: 'Trust, social impact brand',
    weaknesses: 'Seasonal donation patterns',
    keyAdvantage: 'Largest crowdfunding platform in ID'
  }
};

function withDefaults(
  base: Omit<
    Company,
    | 'region'
    | 'targetAudience'
    | 'marketShare'
    | 'growth'
    | 'priceStructure'
    | 'marketingStrategies'
    | 'customerSatisfaction'
    | 'strengths'
    | 'weaknesses'
    | 'keyAdvantage'
  > & { region?: Region }
): Company {
  const defaults = CATEGORY_DEFAULTS[base.category] ?? CATEGORY_DEFAULTS['Other'];
  const overrides = COMPANY_OVERRIDES[base.id] ?? {};
  return { region: 'Indonesia', ...defaults, ...base, ...overrides } as Company;
}

// ── Companies ─────────────────────────────────────────

export const COMPANIES: Company[] = [
  // Digital Banks and Neobanks
  withDefaults({
    id: 'bank_aladin',
    name: 'Bank Aladin',
    category: 'Digital Banks',
    focus: 'Islamic digital bank',
    founded: 2021,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'Aladin Group',
    license: 'OJK (bank)',
    description: 'Sharia-compliant neobank',
    logo: bank_aladin
  }),
  withDefaults({
    id: 'allo_bank',
    name: 'Allo Bank',
    category: 'Digital Banks',
    focus: 'Super-app banking',
    founded: 2021,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'CT Corp, Bukalapak, Grab',
    license: 'OJK (bank)',
    description: 'Digital bank integrated with Bukalapak ecosystem',
    logo: allo_bank
  }),
  withDefaults({
    id: 'blu_bca',
    name: 'blu by BCA',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2021,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'BCA (BCA Digital)',
    license: 'OJK (bank)',
    description: "BCA Digital's mobile-first banking product",
    logo: blu_bca
  }),
  withDefaults({
    id: 'bnc',
    name: 'Bank Neo Commerce',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2021,
    revenueModel: 'Net interest margin, BNPL',
    backedBy: 'Akulaku Group',
    license: 'OJK (bank)',
    description: 'Digital bank, previously Bank Yudha Bhakti',
    logo: bnc
  }),
  withDefaults({
    id: 'dbs_digibank',
    name: 'DBS digibank',
    category: 'Digital Banks',
    focus: 'Digital banking',
    founded: 2017,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'DBS Group (Singapore)',
    license: 'OJK (bank)',
    description: "DBS Bank's digital-only banking platform",
    logo: dbs_digibank
  }),
  withDefaults({
    id: 'bank_jago',
    name: 'Bank Jago',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2019,
    revenueModel: 'Net interest margin, API fees',
    backedBy: 'GoTo, GIC',
    license: 'OJK (bank)',
    description: 'API-first digital bank with GoTo integration',
    logo: bank_jago
  }),
  withDefaults({
    id: 'jenius',
    name: 'Jenius',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2016,
    revenueModel: 'Net interest margin, premium tier',
    backedBy: 'BTPN (SMBC Group)',
    license: 'OJK (bank)',
    description: "One of Indonesia's first neobanks",
    logo: jenius
  }),
  withDefaults({
    id: 'line_bank',
    name: 'LINE Bank',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2021,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'KEB Hana Bank, LINE Corp',
    license: 'OJK (bank)',
    description: 'Digital banking joint venture',
    logo: line_bank
  }),
  withDefaults({
    id: 'seabank',
    name: 'SeaBank',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2021,
    revenueModel: 'Net interest margin, ecosystem fees',
    backedBy: 'Sea Group (Shopee)',
    license: 'OJK (bank)',
    description: 'High-yield savings, Shopee ecosystem integration',
    logo: seabank
  }),
  withDefaults({
    id: 'uob_tmrw',
    name: 'UOB TMRW',
    category: 'Digital Banks',
    focus: 'Digital banking',
    founded: 2019,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'UOB (Singapore)',
    license: 'OJK (bank)',
    description: 'Digital-only banking for ASEAN millennials',
    logo: uob_tmrw
  }),
  withDefaults({
    id: 'yup',
    name: 'Yup',
    category: 'Digital Banks',
    focus: 'Neobank',
    founded: 2022,
    revenueModel: 'Net interest margin, fees',
    backedBy: 'Finture Group',
    license: 'OJK (bank)',
    description: 'Youth-focused digital banking app',
    logo: yup
  }),

  // Alternative Lending and Financing
  withDefaults({
    id: 'akseleran',
    name: 'Akseleran',
    category: 'Lending',
    focus: 'P2P lending',
    founded: 2017,
    revenueModel: 'Origination fees, spread',
    backedBy: 'Access Ventures',
    license: 'OJK (P2P)',
    description: 'SME-focused peer-to-peer lending',
    logo: akseleran
  }),
  withDefaults({
    id: 'akulaku',
    name: 'Akulaku',
    category: 'Lending',
    focus: 'BNPL',
    founded: 2016,
    revenueModel: 'Interest, merchant fees',
    backedBy: 'Ant Group, Siam Commercial Bank',
    license: 'OJK (P2P, bank)',
    description: 'Digital lending and BNPL, owns Bank Neo Commerce',
    logo: akulaku
  }),
  withDefaults({
    id: 'alami',
    name: 'ALAMI',
    category: 'Lending',
    focus: 'Islamic P2P',
    founded: 2018,
    revenueModel: 'Profit-sharing margin',
    backedBy: 'PBMT, AC Ventures',
    license: 'OJK (P2P)',
    description: 'Sharia-compliant P2P lending for SMEs',
    logo: alami
  }),
  withDefaults({
    id: 'atome',
    name: 'Atome',
    category: 'Lending',
    focus: 'BNPL',
    founded: 2019,
    revenueModel: 'Merchant fees',
    backedBy: 'Advance Intelligence Group',
    license: 'OJK (P2P)',
    description: 'Buy now pay later, Singapore-origin',
    logo: atome
  }),
  withDefaults({
    id: 'awantunai',
    name: 'AwanTunai',
    category: 'Lending',
    focus: 'Supply chain financing',
    founded: 2017,
    revenueModel: 'Interest, transaction fees',
    backedBy: 'MUIP, Insignia Ventures',
    license: 'OJK (P2P)',
    description: 'Embedded lending for FMCG supply chains',
    logo: awantunai
  }),
  withDefaults({
    id: 'batumbu',
    name: 'BATUMBU',
    category: 'Lending',
    focus: 'P2P lending',
    founded: 2018,
    revenueModel: 'Origination fees, spread',
    backedBy: 'Triputra Group, Validus',
    license: 'OJK (P2P)',
    description: 'Productive loan platform for MSMEs',
    logo: batumbu
  }),
  withDefaults({
    id: 'amartha',
    name: 'Amartha',
    category: 'Lending',
    focus: 'Microfinance',
    founded: 2010,
    revenueModel: 'Interest margin',
    backedBy: 'Mandiri Capital, UOB Venture',
    license: 'OJK (P2P)',
    description: 'Micro-lending connecting rural women entrepreneurs with funders',
    logo: amartha
  }),
  withDefaults({
    id: 'indodana',
    name: 'Indodana Finance',
    category: 'Lending',
    focus: 'Multi-finance',
    founded: 2017,
    revenueModel: 'Interest, fees',
    backedBy: '-',
    license: 'OJK (multi-finance)',
    description: 'Digital multi-finance and BNPL',
    logo: indodana
  }),
  withDefaults({
    id: 'kitabisa',
    name: 'Kitabisa',
    category: 'Lending',
    focus: 'Crowdfunding',
    founded: 2013,
    revenueModel: 'Platform fee (5%)',
    backedBy: 'East Ventures, Alterra',
    license: '-',
    description: "Indonesia's largest donation and crowdfunding platform",
    logo: kitabisa
  }),
  withDefaults({
    id: 'modalku',
    name: 'Modalku',
    category: 'Lending',
    focus: 'P2P lending',
    founded: 2015,
    revenueModel: 'Origination fees, spread',
    backedBy: 'Softbank Vision Fund, Sequoia',
    license: 'OJK (P2P)',
    description: "SME lending, Funding Societies' Indonesia arm",
    logo: modalku
  }),
  withDefaults({
    id: 'kredivo',
    name: 'Kredivo Group',
    category: 'Lending',
    focus: 'BNPL / credit',
    founded: 2016,
    revenueModel: 'Interest, merchant fees',
    backedBy: 'Mizuho, Victory Park Capital',
    license: 'OJK (P2P, multi-finance)',
    description: 'Instant credit line for e-commerce',
    logo: kredivo
  }),
  withDefaults({
    id: 'kreditpintar',
    name: 'KreditPintar',
    category: 'Lending',
    focus: 'Personal loans',
    founded: 2017,
    revenueModel: 'Interest, origination fees',
    backedBy: 'Atome Financial (Xiaomi-linked)',
    license: 'OJK (P2P)',
    description: 'AI-driven digital personal loan platform',
    logo: kreditpintar
  }),
  withDefaults({
    id: 'koinworks',
    name: 'KoinWorks',
    category: 'Lending',
    focus: 'P2P lending',
    founded: 2016,
    revenueModel: 'Interest spread, SaaS fees',
    backedBy: 'MDI Ventures, Quona Capital',
    license: 'OJK (P2P)',
    description: 'Super financial app: lending, investment, neobank for SMEs',
    logo: koinworks
  }),

  // Payments and Transfers
  withDefaults({
    id: 'astrapay',
    name: 'AstraPay',
    category: 'Payments',
    focus: 'E-wallet',
    founded: 2020,
    revenueModel: 'Transaction fees, merchant fees',
    backedBy: 'Astra International',
    license: 'BI (e-money)',
    description: "Astra Group's digital wallet",
    logo: astrapay
  }),
  withDefaults({
    id: 'cashup',
    name: 'CashUP',
    category: 'Payments',
    focus: 'Payments',
    founded: 2020,
    revenueModel: 'Transaction fees',
    backedBy: 'Cashlez Worldwide',
    license: 'BI',
    description: 'Digital payment solution',
    logo: cashup
  }),
  withDefaults({
    id: 'dana',
    name: 'DANA',
    category: 'Payments',
    focus: 'E-wallet',
    founded: 2018,
    revenueModel: 'Transaction fees, merchant MDR',
    backedBy: 'Ant Group, Sinar Mas',
    license: 'BI (e-money)',
    description: 'Major e-wallet, widely used for P2P and bills',
    logo: dana
  }),
  withDefaults({
    id: 'flip',
    name: 'Flip',
    category: 'Payments',
    focus: 'Transfers',
    founded: 2015,
    revenueModel: 'Freemium, business API fees',
    backedBy: 'Sequoia, Insight Partners',
    license: 'BI (transfer)',
    description: 'Fee-free interbank transfer and international remittance',
    logo: flip
  }),
  withDefaults({
    id: 'gopay',
    name: 'GoPay',
    category: 'Payments',
    focus: 'E-wallet',
    founded: 2016,
    revenueModel: 'Transaction fees, merchant MDR',
    backedBy: 'GoTo Group',
    license: 'BI (e-money)',
    description: 'Digital wallet integrated with Gojek super-app',
    logo: gopay
  }),
  withDefaults({
    id: 'linkaja',
    name: 'LinkAja',
    category: 'Payments',
    focus: 'E-wallet',
    founded: 2019,
    revenueModel: 'Transaction fees, merchant MDR',
    backedBy: 'SOE consortium (Telkomsel, BRI, BNI, Mandiri)',
    license: 'BI (e-money)',
    description: 'State-owned enterprise consortium e-wallet',
    logo: linkaja
  }),
  withDefaults({
    id: 'ovo',
    name: 'OVO',
    category: 'Payments',
    focus: 'E-wallet',
    founded: 2017,
    revenueModel: 'Transaction fees, merchant MDR, lending',
    backedBy: 'Grab, Tokopedia, Nomura',
    license: 'BI (e-money)',
    description: 'Major e-wallet in Grab-Tokopedia ecosystem',
    logo: ovo
  }),
  withDefaults({
    id: 'shopeepay',
    name: 'ShopeePay',
    category: 'Payments',
    focus: 'E-wallet',
    founded: 2018,
    revenueModel: 'Transaction fees, merchant MDR',
    backedBy: 'Sea Group',
    license: 'BI (e-money)',
    description: 'E-wallet integrated with Shopee marketplace',
    logo: shopeepay
  }),
  withDefaults({
    id: 'xendit',
    name: 'Xendit',
    category: 'Payments',
    focus: 'Payment gateway',
    founded: 2015,
    revenueModel: 'API transaction fees',
    backedBy: 'Tiger Global, Accel, Insight',
    license: 'BI (payment gateway)',
    description: 'B2B payment infrastructure: accept and disburse payments',
    logo: xendit
  }),

  // Personal Finance Management
  withDefaults({
    id: 'skorlife',
    name: 'SKORLIFE',
    category: 'Personal Finance',
    focus: 'Credit score',
    founded: 2020,
    revenueModel: 'Freemium, lead gen, data insights',
    backedBy: '-',
    license: '-',
    description: 'Free credit score monitoring and financial health tracking',
    logo: skorlife
  }),
  withDefaults({
    id: 'cekaja',
    name: 'Cekaja',
    category: 'Personal Finance',
    focus: 'Comparison',
    founded: 2015,
    revenueModel: 'Lead generation, referral fees',
    backedBy: 'Experian, Telkom Indonesia',
    license: '-',
    description: 'Financial product comparison and application platform',
    logo: cekaja
  }),

  // Mortgage Tech and Real Estate
  withDefaults({
    id: 'pinhome',
    name: 'Pinhome',
    category: 'Mortgage',
    focus: 'Proptech',
    founded: 2020,
    revenueModel: 'Brokerage commission, mortgage referral',
    backedBy: 'Alpha JWC, Ribbit Capital',
    license: '-',
    description: 'End-to-end property transaction with mortgage facilitation',
    logo: pinhome
  }),
  withDefaults({
    id: 'ringkas',
    name: 'Ringkas',
    category: 'Mortgage',
    focus: 'Mortgage',
    founded: 2020,
    revenueModel: 'Mortgage origination fees',
    backedBy: 'East Ventures, Y Combinator',
    license: '-',
    description: 'Digital mortgage origination and processing',
    logo: ringkas
  }),

  // Financial Infrastructure and APIs
  withDefaults({
    id: 'finfra',
    name: 'Finfra',
    category: 'Infrastructure',
    focus: 'Embedded finance',
    founded: 2021,
    revenueModel: 'API usage fees, rev-share',
    backedBy: 'East Ventures, AC Ventures',
    license: '-',
    description: 'Lending-as-a-service API for embedded lending',
    logo: finfra
  }),
  withDefaults({
    id: 'ayoconnect',
    name: 'Ayoconnect',
    category: 'Infrastructure',
    focus: 'Open finance',
    founded: 2016,
    revenueModel: 'API transaction fees',
    backedBy: 'Tiger Global, AC Ventures',
    license: 'BI',
    description: 'Open finance API: bill payments, account aggregation',
    logo: ayoconnect
  }),

  // Blockchain and Digital Assets
  withDefaults({
    id: 'bittime',
    name: 'Bittime',
    category: 'Blockchain',
    focus: 'Crypto exchange',
    founded: 2022,
    revenueModel: 'Trading fees',
    backedBy: '-',
    license: 'Bappebti',
    description: 'Indonesian crypto asset exchange',
    logo: bittime
  }),
  withDefaults({
    id: 'upbit',
    name: 'Upbit',
    category: 'Blockchain',
    focus: 'Crypto exchange',
    founded: 2018,
    revenueModel: 'Trading fees',
    backedBy: 'Dunamu (Korea)',
    license: 'Bappebti',
    description: 'Korean-origin crypto exchange in Indonesia',
    logo: upbit
  }),
  withDefaults({
    id: 'indodax',
    name: 'INDODAX',
    category: 'Blockchain',
    focus: 'Crypto exchange',
    founded: 2014,
    revenueModel: 'Trading fees',
    backedBy: '-',
    license: 'Bappebti',
    description: "Indonesia's oldest and largest crypto exchange",
    logo: indodax
  }),
  withDefaults({
    id: 'nobi',
    name: 'Nobi',
    category: 'Blockchain',
    focus: 'Crypto yield',
    founded: 2018,
    revenueModel: 'Management fees, performance fees',
    backedBy: 'Skystar Capital',
    license: 'Bappebti',
    description: 'Crypto asset management and DeFi yield platform',
    logo: nobi
  }),
  withDefaults({
    id: 'pintu',
    name: 'PINTU',
    category: 'Blockchain',
    focus: 'Crypto exchange',
    founded: 2019,
    revenueModel: 'Trading spread',
    backedBy: 'Pantera Capital, Intudo Ventures',
    license: 'Bappebti',
    description: 'Mobile-first crypto trading app for retail investors',
    logo: pintu
  }),
  withDefaults({
    id: 'tokocrypto',
    name: 'Tokocrypto',
    category: 'Blockchain',
    focus: 'Crypto exchange',
    founded: 2018,
    revenueModel: 'Trading fees',
    backedBy: 'Binance',
    license: 'Bappebti',
    description: 'Binance-backed Indonesian crypto exchange',
    logo: tokocrypto
  }),

  // Insurtech
  withDefaults({
    id: 'rey',
    name: 'Rey',
    category: 'Insurtech',
    focus: 'Health insurance',
    founded: 2020,
    revenueModel: 'Premiums, subscription',
    backedBy: 'TPTF, Genesia Ventures',
    license: 'OJK (insurance)',
    description: 'Digital-first health insurance with telemedicine',
    logo: rey
  }),
  withDefaults({
    id: 'pasarpolis',
    name: 'PasarPolis',
    category: 'Insurtech',
    focus: 'Insurance marketplace',
    founded: 2015,
    revenueModel: 'Commission, embedded insurance fees',
    backedBy: 'SBI, LeapFrog, Tokopedia',
    license: 'OJK (insurance broker)',
    description: 'Insurance distribution with embedded and micro-insurance',
    logo: pasarpolis
  }),
  withDefaults({
    id: 'lifepal',
    name: 'Lifepal',
    category: 'Insurtech',
    focus: 'Insurance comparison',
    founded: 2019,
    revenueModel: 'Lead generation, commission',
    backedBy: 'ProSehat, Cathay Innovation',
    license: 'OJK (insurance broker)',
    description: 'Insurance comparison and advisory marketplace',
    logo: lifepal
  }),
  withDefaults({
    id: 'qoala',
    name: 'Qoala',
    category: 'Insurtech',
    focus: 'Insurance platform',
    founded: 2018,
    revenueModel: 'Commission, SaaS fees, claims processing',
    backedBy: 'Eurazeo, MassMutual Ventures',
    license: 'OJK (insurance broker)',
    description: 'Full-stack insurtech: embedded insurance, claims automation',
    logo: qoala
  }),

  // Regtech
  withDefaults({
    id: 'asliri',
    name: 'ASLI RI',
    category: 'Regtech',
    focus: 'Identity verification',
    founded: 2016,
    revenueModel: 'API usage fees, subscription',
    backedBy: 'MDI Ventures',
    license: '-',
    description: 'eKYC, facial recognition, digital identity solutions',
    logo: asliri
  }),
  withDefaults({
    id: 'pajak',
    name: 'Pajak',
    category: 'Regtech',
    focus: 'Tax compliance',
    founded: 2015,
    revenueModel: 'SaaS subscription',
    backedBy: '-',
    license: '-',
    description: 'Digital tax filing and compliance for businesses',
    logo: pajak
  }),
  withDefaults({
    id: 'privy',
    name: 'Privy',
    category: 'Regtech',
    focus: 'Digital signature',
    founded: 2016,
    revenueModel: 'Per-signature fees, subscription',
    backedBy: 'MDI Ventures, GGV Capital',
    license: 'Kominfo (PSrE)',
    description: 'Legally-binding digital signatures and identity verification',
    logo: privy
  }),

  // Business Financial Management
  withDefaults({
    id: 'bukuwarung',
    name: 'BukuWarung',
    category: 'Business Finance',
    focus: 'MSME bookkeeping',
    founded: 2019,
    revenueModel: 'Freemium, payment processing',
    backedBy: 'Valar Ventures, Y Combinator',
    license: '-',
    description: 'Digital bookkeeping for micro and small merchants',
    logo: bukuwarung
  }),
  withDefaults({
    id: 'fazz',
    name: 'FAZZ',
    category: 'Business Finance',
    focus: 'B2B fintech',
    founded: 2016,
    revenueModel: 'Transaction fees, SaaS',
    backedBy: 'Tiger Global, DST Global',
    license: 'BI, MAS (Singapore)',
    description: 'Business payments, payroll, expense management',
    logo: fazz
  }),
  withDefaults({
    id: 'mekari',
    name: 'Mekari',
    category: 'Business Finance',
    focus: 'SaaS',
    founded: 2015,
    revenueModel: 'SaaS subscription',
    backedBy: 'Money Forward, Mandiri Capital',
    license: '-',
    description: 'Business suite: accounting (Jurnal), HR (Talenta), tax (Klikpajak)',
    logo: mekari
  }),

  // Wealthtech
  withDefaults({
    id: 'ajaib',
    name: 'Ajaib',
    category: 'Wealthtech',
    focus: 'Stock trading',
    founded: 2019,
    revenueModel: 'Brokerage commission',
    backedBy: 'DST Global, Ribbit Capital, SoftBank',
    license: 'OJK (securities)',
    description: 'Commission-free stock and mutual fund trading',
    logo: ajaib
  }),
  withDefaults({
    id: 'bareksa',
    name: 'Bareksa',
    category: 'Wealthtech',
    focus: 'Mutual funds',
    founded: 2013,
    revenueModel: 'Distribution fees, subscription',
    backedBy: 'Tokopedia, Trafigura',
    license: 'OJK (APERD)',
    description: "Indonesia's first online mutual fund marketplace",
    logo: bareksa
  }),
  withDefaults({
    id: 'bibit',
    name: 'Bibit',
    category: 'Wealthtech',
    focus: 'Robo-advisor',
    founded: 2019,
    revenueModel: 'Distribution fees',
    backedBy: 'Stockbit Group, Sequoia, Tencent',
    license: 'OJK (APERD)',
    description: 'AI-driven mutual fund investment app',
    logo: bibit
  }),
  withDefaults({
    id: 'pluang',
    name: 'Pluang',
    category: 'Wealthtech',
    focus: 'Multi-asset',
    founded: 2019,
    revenueModel: 'Spread, transaction fees',
    backedBy: 'Square Peg, Accel',
    license: 'OJK, Bappebti',
    description: 'Micro-investing: gold, crypto, US stocks, mutual funds',
    logo: pluang
  }),
  withDefaults({
    id: 'reku',
    name: 'Reku',
    category: 'Wealthtech',
    focus: 'Crypto + stocks',
    founded: 2018,
    revenueModel: 'Trading fees',
    backedBy: 'AC Ventures',
    license: 'OJK, Bappebti',
    description: 'Crypto and stock trading platform',
    logo: reku
  }),
  withDefaults({
    id: 'stockbit',
    name: 'Stockbit',
    category: 'Wealthtech',
    focus: 'Stock trading',
    founded: 2017,
    revenueModel: 'Brokerage commission, premium tier',
    backedBy: 'Sequoia, Tencent, Prosus',
    license: 'OJK (securities)',
    description: 'Social investing and stock trading with community features',
    logo: stockbit
  }),

  // Other
  withDefaults({
    id: 'paper_id',
    name: 'Paper.id',
    category: 'Other',
    focus: 'B2B invoicing',
    founded: 2017,
    revenueModel: 'SaaS subscription, transaction fees',
    backedBy: 'Golden Gate Ventures',
    license: '-',
    description: 'Digital invoicing, payment, and supply chain financing for SMEs',
    logo: paper_id
  }),
  withDefaults({
    id: 'wagely',
    name: 'Wagely',
    category: 'Other',
    focus: 'Earned wage access',
    founded: 2020,
    revenueModel: 'Per-transaction fee to employers',
    backedBy: 'East Ventures, Trihill Capital',
    license: '-',
    description: 'On-demand salary access (EWA) for employees',
    logo: wagely
  })
];
