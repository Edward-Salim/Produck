import {
  ClipboardList,
  Columns3,
  FlaskConical,
  Lightbulb,
  Landmark,
  MapPinned,
  Network,
  NotebookPen,
  Puzzle,
  Route,
  Target,
  TrendingUp,
  Workflow
} from '@lucide/svelte';
import type { Component } from 'svelte';
import assumptionTestCover from '$lib/assets/framework-cards/assumption-test.png';
import epicsCover from '$lib/assets/framework-cards/epics.png';
import experienceMapCover from '$lib/assets/framework-cards/experience-map.png';
import ideaBankCover from '$lib/assets/framework-cards/idea-bank.png';
import interviewSnapshotCover from '$lib/assets/framework-cards/interview-snapshot.png';
import kanbanCover from '$lib/assets/framework-cards/kanban.png';
import outcomesCover from '$lib/assets/framework-cards/outcomes-v2.png';
import storyMapCover from '$lib/assets/framework-cards/story-map.png';
import fintechLandscapeCover from '$lib/assets/framework-cards/fintech-landscape.png';
import valuePropositionCanvasCover from '$lib/assets/framework-cards/value-proposition-canvas.png';
import leanCanvasCover from '$lib/assets/framework-cards/lean-canvas.png';
import businessModelCanvasCover from '$lib/assets/framework-cards/business-model-canvas.png';
import marketSizingCover from '$lib/assets/framework-cards/market-sizing.png';
import organogramCover from '$lib/assets/framework-cards/organogram.png';
import sitemapCover from '$lib/assets/framework-cards/sitemap.png';

export type FrameworkField = {
  id: string;
  label: string;
  prompt: string;
  placeholder: string;
};

export type FrameworkTemplate = {
  id: string;
  name: string;
  category: 'Discovery' | 'Strategy' | 'Validation' | 'Delivery';
  description: string;
  icon: Component<{ class?: string }>;
  fields: FrameworkField[];
  instructions: string;
  terminology: { term: string; definition: string }[];
  coverGradient: string;
  coverImage?: string;
};

export const FRAMEWORK_TEMPLATES: FrameworkTemplate[] = [
  {
    id: 'sitemap',
    name: 'Sitemap',
    category: 'Strategy',
    description: 'Visualize a product’s page or screen hierarchy from database-backed route data.',
    icon: Workflow,
    fields: [],
    instructions:
      'This read-only diagram is maintained by developers. Populate it from verified application routes through seed or database updates; use aliases for user-facing names and paths for the underlying route identifiers.',
    terminology: [
      { term: 'Root', definition: 'the product entry point at the top of the hierarchy.' },
      { term: 'Destination', definition: 'an implemented page, screen, or application state.' },
      { term: 'Section', definition: 'a database-defined grouping of related destinations.' },
      { term: 'Alias', definition: 'the user-facing name stored for a destination.' },
      { term: 'Path', definition: 'the URL, route, or state identifier used by the product.' }
    ],
    coverGradient: 'linear-gradient(135deg, #edf5ef 0%, #dbe7dc 50%, #cad8ca 100%)',
    coverImage: sitemapCover
  },
  {
    id: 'fintech-landscape',
    name: 'Fintech Map',
    category: 'Strategy',
    description:
      'Map fintech companies by category and region, then compare selected competitors against your project.',
    icon: Landmark,
    fields: [],
    instructions:
      'Filter companies by region and category. Select competitors from the map, then switch to compare view to review product focus, market share, growth, target audience, pricing, marketing, satisfaction, strengths, weaknesses, and key advantage against your project.',
    terminology: [
      { term: 'Landscape', definition: 'market map grouped by fintech category.' },
      { term: 'Compare View', definition: 'side-by-side competitor comparison table.' },
      { term: 'Selected Company', definition: 'company included in the comparison set.' },
      { term: 'Key Advantage', definition: 'the clearest strategic edge of a company.' }
    ],
    coverGradient: 'linear-gradient(135deg, #edf7f4 0%, #d8e8df 50%, #c7d7ce 100%)',
    coverImage: fintechLandscapeCover
  },
  {
    id: 'value-proposition-canvas',
    name: 'Value Proposition Canvas',
    category: 'Discovery',
    description:
      'PPD canvas connecting customer jobs, pains, and gains with products, pain relievers, and gain creators.',
    icon: Puzzle,
    fields: [],
    instructions:
      'Start with the Customer Profile: jobs, pains, and gains. Then fill the Value Map: products and services, pain relievers, and gain creators. Compare both sides to find product-customer fit.',
    terminology: [
      { term: 'Customer Job', definition: 'task, need, or progress the customer wants.' },
      { term: 'Pain', definition: 'risk, frustration, obstacle, or bad outcome.' },
      { term: 'Gain', definition: 'desired benefit, outcome, or improvement.' },
      { term: 'Pain Reliever', definition: 'how the offer reduces a customer pain.' },
      { term: 'Gain Creator', definition: 'how the offer creates customer value.' },
      { term: 'Fit', definition: 'alignment between the customer profile and value map.' }
    ],
    coverGradient: 'linear-gradient(135deg, #f4f8ea 0%, #e2ead2 50%, #cfddc2 100%)',
    coverImage: valuePropositionCanvasCover
  },
  {
    id: 'lean-canvas',
    name: 'Lean Canvas',
    category: 'Strategy',
    description:
      'A one-page startup hypothesis map for testing problems, early adopters, solutions, metrics, costs, and revenue.',
    icon: Columns3,
    fields: [],
    instructions:
      'Use the Lean Canvas as a living startup hypothesis. List up to three Problems and the Existing Alternatives used today. Narrow Customer Segments to the Early Adopters most likely to try an unproven product. Define a small, replaceable MVP in Solution and choose a few actionable Key Metrics. State a benefit-led Unique Value Proposition and a one-line “X for Y” High-Level Concept. Add focused Channels and an honest Unfair Advantage. Record fixed and variable Costs and realistic Revenue Streams. Validate with interviews and experiments, then update the canvas when evidence changes.',
    terminology: [
      { term: 'Problem', definition: 'top customer problems worth solving.' },
      {
        term: 'Existing Alternative',
        definition: 'tool, competitor, or workaround customers use today.'
      },
      { term: 'Customer Segment', definition: 'specific group that has the problem.' },
      {
        term: 'Early Adopter',
        definition: 'narrow customer subset most willing to try and shape an unproven solution.'
      },
      { term: 'UVP', definition: 'Unique Value Proposition: why customers should choose this.' },
      {
        term: 'High-Level Concept',
        definition: 'one-line “X for Y” analogy that makes the idea immediately familiar.'
      },
      {
        term: 'Solution',
        definition: 'small, replaceable MVP that tests how to address the problem.'
      },
      { term: 'Key Metric', definition: 'actionable signal that shows the model is working.' },
      { term: 'Channel', definition: 'route to reach, acquire, or deliver value to customers.' },
      {
        term: 'Unfair Advantage',
        definition: 'edge competitors cannot easily copy, buy, or reproduce.'
      },
      { term: 'Cost Structure', definition: 'fixed and variable costs required to operate.' },
      { term: 'Revenue Stream', definition: 'how the startup earns money and at what price.' }
    ],
    coverGradient: 'linear-gradient(135deg, #f7f1df 0%, #e5dcc8 50%, #d3c8b4 100%)',
    coverImage: leanCanvasCover
  },
  {
    id: 'business-model-canvas',
    name: 'Business Model Canvas',
    category: 'Strategy',
    description:
      'Map the full business model across partners, activities, resources, value, customers, channels, costs, and revenue.',
    icon: Columns3,
    fields: [],
    instructions:
      'Use the Business Model Canvas to describe how the organization creates, delivers, and captures value. Start with Customer Segments and Value Propositions, then connect Channels and Customer Relationships. Add Key Activities, Key Resources, Key Partners, Cost Structure, and Revenue Streams to complete the operating model.',
    terminology: [
      { term: 'Value Proposition', definition: 'benefit or outcome customers choose you for.' },
      { term: 'Customer Segment', definition: 'group of people or organizations served.' },
      { term: 'Channel', definition: 'path used to reach, sell to, or serve customers.' },
      { term: 'Customer Relationship', definition: 'how customers are acquired and retained.' },
      { term: 'Key Resource', definition: 'asset required to make the model work.' },
      { term: 'Key Activity', definition: 'critical work the business must perform.' },
      { term: 'Key Partner', definition: 'external party needed to operate or scale.' },
      { term: 'Cost Structure', definition: 'main costs incurred by the business model.' },
      { term: 'Revenue Stream', definition: 'how the business captures money or value.' }
    ],
    coverGradient: 'linear-gradient(135deg, #f2f5e8 0%, #dde6d2 50%, #cbd8bf 100%)',
    coverImage: businessModelCanvasCover
  },
  {
    id: 'market-sizing',
    name: 'Market Sizing',
    category: 'Strategy',
    description:
      'Estimate TAM, SAM, and SOM to separate the full market from the reachable and realistic initial opportunity.',
    icon: Target,
    fields: [],
    instructions:
      'Define one market and timeframe. Calculate TAM as total customers multiplied by annual revenue per customer. Narrow TAM to the customers the current product can reasonably target to find SAM. Estimate SOM from the customers the business can realistically acquire and convert. Use broad market data for context, then validate with customer counts, pricing, conversion, and acquisition data. Keep assumptions visible, use recent sources, and use SOM for revenue planning.',
    terminology: [
      {
        term: 'TAM',
        definition: 'maximum potential demand for the product category.'
      },
      {
        term: 'SAM',
        definition: 'part of TAM the current product can reasonably target.'
      },
      {
        term: 'SOM',
        definition: 'part of SAM the business can realistically convert.'
      },
      {
        term: 'Top-Down Estimate',
        definition: 'broad market data narrowed by relevant constraints.'
      },
      {
        term: 'Bottom-Up Estimate',
        definition: 'customer count multiplied by annual revenue per customer.'
      },
      {
        term: 'Assumption',
        definition: 'unverified input that materially changes the result.'
      }
    ],
    coverGradient: 'linear-gradient(135deg, #edf5e9 0%, #dce8d4 50%, #cad9c2 100%)',
    coverImage: marketSizingCover
  },
  {
    id: 'organogram',
    name: 'Organogram',
    category: 'Strategy',
    description:
      'Visualize the product organization, reporting structure, responsibilities, and team ownership.',
    icon: Network,
    fields: [],
    instructions:
      'Use the Organogram to clarify who owns which parts of the product organization. Map the lead role at the top, then group teams or functions underneath. Each role should show the owner and responsibility so decision paths are easy to scan.',
    terminology: [
      { term: 'Organogram', definition: 'visual map of roles, teams, and reporting lines.' },
      { term: 'Role', definition: 'position or function with a defined responsibility.' },
      { term: 'Owner', definition: 'person or role accountable for a node.' },
      { term: 'Reporting Line', definition: 'relationship showing accountability or escalation.' },
      { term: 'Function', definition: 'team area such as Discovery, Delivery, or Go To Market.' }
    ],
    coverGradient: 'linear-gradient(135deg, #edf5ef 0%, #dbe7dc 50%, #cad8ca 100%)',
    coverImage: organogramCover
  },
  {
    id: 'outcomes',
    name: 'Outcomes',
    category: 'Strategy',
    description:
      'Track business outcomes, product objectives, and key results by year and quarter.',
    icon: TrendingUp,
    fields: [],
    instructions:
      'Define Business Outcomes (company-level goals), Product Objectives (quarterly targets), and Key Results (measurable metrics with target vs current value). Link KRs to objectives and track progress by year and quarter.',
    terminology: [
      { term: 'Business Outcome', definition: 'top-level company goal tied to strategy.' },
      { term: 'Objective', definition: 'product goal for a specific quarter.' },
      {
        term: 'Key Result',
        definition: 'measurable metric with a target value and current progress.'
      },
      { term: 'OKR', definition: 'Objective + Key Results framework.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf4d8 0%, #f0e0b8 50%, #e8d4a8 100%)',
    coverImage: outcomesCover
  },
  {
    id: 'experience-map',
    name: 'Experience Map',
    category: 'Discovery',
    description:
      'Map the customer journey across phases, actors, touchpoints, pains, gains, and KPIs.',
    icon: Route,
    fields: [],
    instructions:
      'Define Phases (high-level journey stages like Discover → Onboard → Use → Advocate). Add Steps within each phase, then Touchpoints within steps. Each touchpoint captures actor, action, outcome, pains, gains, and KPI.',
    terminology: [
      { term: 'Phase', definition: 'high-level stage of the journey.' },
      { term: 'Step', definition: 'specific action within a phase.' },
      { term: 'Touchpoint', definition: 'detailed interaction (who, what, why).' },
      { term: 'Pain', definition: 'friction or frustration.' },
      { term: 'Gain', definition: 'positive outcome or delight.' },
      { term: 'KPI', definition: 'key performance indicator.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf3e0 0%, #f2e0c8 50%, #e8d4b8 100%)',
    coverImage: experienceMapCover
  },
  {
    id: 'interview-snapshot',
    name: 'Interview Snapshot',
    category: 'Discovery',
    description:
      'A one-page synthesis of an interview: context, quote, facts, insights, and opportunities.',
    icon: NotebookPen,
    instructions:
      "Create one snapshot per interview. Fill in the person's name and role, add context about their situation, capture a verbatim quote that reveals a key need, list quick facts, then distill insights and opportunities.",
    terminology: [
      {
        term: 'Quote',
        definition: 'verbatim sentence that reveals a need, behavior, or motivation.'
      },
      { term: 'Quick Fact', definition: 'objective detail about the person or situation.' },
      { term: 'Insight', definition: 'pattern, surprise, or learning from the interview.' },
      { term: 'Opportunity', definition: 'unmet need or product gap to address.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fef8ec 0%, #f4e8d4 50%, #e8dcc8 100%)',
    coverImage: interviewSnapshotCover,
    fields: [
      {
        id: 'person',
        label: 'Person',
        prompt: 'Who did we interview?',
        placeholder: 'Name, segment, role, or relationship to the product'
      },
      {
        id: 'context',
        label: 'Context',
        prompt: 'What situation, role, or background matters for this interview?',
        placeholder: 'Job, workflow, environment, recent behavior, constraints'
      },
      {
        id: 'quote',
        label: 'Quote',
        prompt: 'What quote best captures the interview?',
        placeholder: 'A sentence that reveals a need, behavior, frustration, or motivation'
      },
      {
        id: 'quickFacts',
        label: 'Quick Facts',
        prompt: 'What facts help others understand this person quickly?',
        placeholder: 'One fact per line'
      },
      {
        id: 'insights',
        label: 'Insights',
        prompt: 'What patterns, surprises, or learnings came out of the interview?',
        placeholder: 'One insight per line'
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        prompt: 'What unmet needs or product opportunities did this interview reveal?',
        placeholder: 'One opportunity per line'
      },
      {
        id: 'transcript',
        label: 'Transcript Notes',
        prompt: 'What raw notes or transcript excerpts should be preserved?',
        placeholder: 'Paste transcript notes or key excerpts'
      }
    ]
  },
  {
    id: 'idea-bank',
    name: 'Idea Bank',
    category: 'Discovery',
    description:
      'Collect and triage product ideas through a kanban board from discovery to release.',
    icon: Lightbulb,
    fields: [],
    instructions:
      'Collect product ideas and move them through stages: Raw → Triaged → Validated → Backlog → Doing → Done → Released. Assign a proposer to each idea and optionally link to an OKR code for traceability.',
    terminology: [
      { term: 'OKR', definition: 'Objective and Key Result code for alignment.' },
      { term: 'Triage', definition: "initial assessment of an idea's merit and fit." },
      { term: 'Proposer', definition: 'person who submitted the idea.' },
      { term: 'Stages', definition: 'workflow columns from raw collection to release.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf2d0 0%, #f5e0b0 50%, #e8d4a8 100%)',
    coverImage: ideaBankCover
  },
  {
    id: 'story-map',
    name: 'User Story Map',
    category: 'Discovery',
    description:
      'Map user workflows with actors, activities, tasks, and stories organized by priority.',
    icon: MapPinned,
    fields: [],
    instructions:
      'Start by naming your product and listing the Actors, the people or roles who use it. Then map out Activities as the big goals they\'re trying to accomplish, arranged left-to-right in the order a user would actually experience them. Under each activity, break things down into Tasks (the steps that make up that workflow), and below those, write atomic Stories: small, sprint-sized features that follow the "As a… I want to… So that…" format. Each story lands in one of three Kano rows: Must-Have for essentials, Performance for nice-to-haves, or Delighter for surprises. Keep stories in plain language. Describe the user outcome, not the implementation. The map reads top-down for detail and left-to-right as a narrative, like walking through your product from first touch to lasting engagement. This map documents what already exists in the product today, not a wishlist of future ideas.',
    terminology: [
      { term: 'Actor', definition: 'persona or user role (e.g. Student, Viewer, Team).' },
      { term: 'Activity', definition: 'high-level user goal, ordered left-to-right as a journey.' },
      { term: 'Task', definition: 'step or workflow within an activity.' },
      {
        term: 'Story',
        definition: 'atomic, sprint-sized feature. Write as a user outcome, not a technical spec.'
      },
      { term: 'Kano', definition: 'Must-Have, Performance, or Delighter priority class.' },
      { term: 'PIC', definition: 'Person In Charge. Assign an owner to each story.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf1d8 0%, #efd8b8 50%, #ddc6a8 100%)',
    coverImage: storyMapCover
  },
  {
    id: 'backlog',
    name: 'Epics',
    category: 'Delivery',
    description: 'Epics with stories, acceptance criteria, priority, and PIC assignment.',
    icon: ClipboardList,
    fields: [],
    instructions:
      'Organize work into Epics (large themes). Add Stories under each epic with acceptance criteria. Assign a PIC (Person In Charge) and mark stories as done when complete. Stories are sorted within each epic.',
    terminology: [
      { term: 'Epic', definition: 'large body of work broken into stories.' },
      { term: 'Story', definition: 'specific user-facing feature.' },
      { term: 'PIC', definition: 'Person In Charge / owner.' },
      {
        term: 'Acceptance Criteria',
        definition: 'conditions that must be met for the story to be considered done.'
      },
      { term: 'Kano', definition: 'priority classification for the story.' }
    ],
    coverGradient: 'linear-gradient(135deg, #f8ecd8 0%, #e7d4b8 50%, #d8c2a4 100%)',
    coverImage: epicsCover
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    category: 'Delivery',
    description:
      'A flexible kanban board with custom columns, WIP limits, priority flags, and drag‑and‑drop.',
    icon: Columns3,
    fields: [],
    instructions:
      'Drag cards between columns to reflect status: To Do → In Progress → Review → Blocked → Done. Click a card to expand its description. Click the assignee badge to change who owns a card. Filter cards by type using the chips at the top, or sort by Priority, Type, SP, or Assignee via the Sort dropdown. If a card is stuck, drag it to Blocked.',
    terminology: [
      { term: 'WIP', definition: 'Work In Progress limit on active cards per column.' },
      { term: 'Blocked', definition: 'cannot proceed due to a dependency or issue.' },
      {
        term: 'Priority',
        definition:
          '🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low · ⚪ None. Shown as the left border color on each card.'
      },
      {
        term: 'Type',
        definition:
          '🐛 Bug · ✨ Feature · 🔧 Improvement · 📋 Chore. Shown as an icon on each card.'
      },
      {
        term: 'Chore',
        definition:
          'non-feature work: migrations, testing, config, documentation, and other maintenance tasks.'
      },
      {
        term: 'SP',
        definition:
          'Story Points. Effort estimate shown as plain text on the card. Higher = more complex.'
      },
      {
        term: 'Assignee',
        definition: 'person responsible for the card. Click the badge to assign or reassign.'
      }
    ],
    coverGradient: 'linear-gradient(135deg, #f4ead8 0%, #dfcfb8 50%, #cdbca4 100%)',
    coverImage: kanbanCover
  },
  {
    id: 'assumption-test',
    name: 'Assumption Test',
    category: 'Validation',
    description: 'Track and test assumptions on a priority quadrant (importance vs evidence).',
    icon: FlaskConical,
    fields: [],
    instructions:
      'Log each assumption with a type (Desirability, Feasibility, Usability, Viability). Define a test method and success criteria. Update status as you test: Untested → Testing → Validated → Invalidated. Plot by importance and evidence strength.',
    terminology: [
      { term: 'Desirability', definition: 'do users want it?' },
      { term: 'Feasibility', definition: 'can we build it?' },
      { term: 'Usability', definition: 'can users use it easily?' },
      { term: 'Viability', definition: 'is it good for the business?' },
      { term: 'Importance', definition: 'how critical the assumption is.' },
      { term: 'Evidence', definition: 'how much data supports or refutes it.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fff4dc 0%, #ecd9bd 50%, #d9c5ac 100%)',
    coverImage: assumptionTestCover
  }
];
