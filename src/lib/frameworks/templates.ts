import {
  ClipboardList,
  Columns3,
  FlaskConical,
  Lightbulb,
  MapPinned,
  NotebookPen,
  Route,
  TrendingUp
} from '@lucide/svelte';
import type { Component } from 'svelte';

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
};

export const FRAMEWORK_TEMPLATES: FrameworkTemplate[] = [
  {
    id: 'outcomes',
    name: 'Outcomes',
    category: 'Strategy',
    description: 'Track business outcomes, product objectives, and key results by year and quarter.',
    icon: TrendingUp,
    fields: [],
    instructions: 'Define Business Outcomes (company-level goals), Product Objectives (quarterly targets), and Key Results (measurable metrics with target vs current value). Link KRs to objectives and track progress by year and quarter.',
    terminology: [
      { term: 'Business Outcome', definition: 'top-level company goal tied to strategy.' },
      { term: 'Objective', definition: 'product goal for a specific quarter.' },
      { term: 'Key Result', definition: 'measurable metric with a target value and current progress.' },
      { term: 'OKR', definition: 'Objective + Key Results framework.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf4d8 0%, #f0e0b8 50%, #e8d4a8 100%)'
  },
  {
    id: 'experience-map',
    name: 'Experience Map',
    category: 'Discovery',
    description: 'Map the customer journey across phases, actors, touchpoints, pains, gains, and KPIs.',
    icon: Route,
    fields: [],
    instructions: 'Define Phases (high-level journey stages like Discover → Onboard → Use → Advocate). Add Steps within each phase, then Touchpoints within steps. Each touchpoint captures actor, action, outcome, pains, gains, and KPI.',
    terminology: [
      { term: 'Phase', definition: 'high-level stage of the journey.' },
      { term: 'Step', definition: 'specific action within a phase.' },
      { term: 'Touchpoint', definition: 'detailed interaction (who, what, why).' },
      { term: 'Pain', definition: 'friction or frustration.' },
      { term: 'Gain', definition: 'positive outcome or delight.' },
      { term: 'KPI', definition: 'key performance indicator.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf3e0 0%, #f2e0c8 50%, #e8d4b8 100%)'
  },
  {
    id: 'interview-snapshot',
    name: 'Interview Snapshot',
    category: 'Discovery',
    description: 'A one-page synthesis of an interview: context, quote, facts, insights, and opportunities.',
    icon: NotebookPen,
    instructions: 'Create one snapshot per interview. Fill in the person\'s name and role, add context about their situation, capture a verbatim quote that reveals a key need, list quick facts, then distill insights and opportunities.',
    terminology: [
      { term: 'Quote', definition: 'verbatim sentence that reveals a need, behavior, or motivation.' },
      { term: 'Quick Fact', definition: 'objective detail about the person or situation.' },
      { term: 'Insight', definition: 'pattern, surprise, or learning from the interview.' },
      { term: 'Opportunity', definition: 'unmet need or product gap to address.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fef8ec 0%, #f4e8d4 50%, #e8dcc8 100%)',
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
    description: 'Collect and triage product ideas through a kanban board from discovery to release.',
    icon: Lightbulb,
    fields: [],
    instructions: 'Collect product ideas and move them through stages: Raw → Triaged → Validated → Backlog → Doing → Done → Released. Assign a proposer to each idea and optionally link to an OKR code for traceability.',
    terminology: [
      { term: 'OKR', definition: 'Objective and Key Result code for alignment.' },
      { term: 'Triage', definition: 'initial assessment of an idea\'s merit and fit.' },
      { term: 'Proposer', definition: 'person who submitted the idea.' },
      { term: 'Stages', definition: 'workflow columns from raw collection to release.' }
    ],
    coverGradient: 'linear-gradient(135deg, #fdf2d0 0%, #f5e0b0 50%, #e8d4a8 100%)'
  },
  {
    id: 'story-map',
    name: 'User Story Map',
    category: 'Discovery',
    description: 'Map user workflows with actors, activities, tasks, and stories organized by priority.',
    icon: MapPinned,
    fields: [],
    instructions: 'Start by naming your product and listing the Actors, the people or roles who use it. Then map out Activities as the big goals they\'re trying to accomplish, arranged left-to-right in the order a user would actually experience them. Under each activity, break things down into Tasks (the steps that make up that workflow), and below those, write atomic Stories: small, sprint-sized features that follow the "As a… I want to… So that…" format. Each story lands in one of three Kano rows: Must-Have for essentials, Performance for nice-to-haves, or Delighter for surprises. Keep stories in plain language. Describe the user outcome, not the implementation. The map reads top-down for detail and left-to-right as a narrative, like walking through your product from first touch to lasting engagement. This map documents what already exists in the product today, not a wishlist of future ideas.',
    terminology: [
      { term: 'Actor', definition: 'persona or user role (e.g. Student, Viewer, Team).' },
      { term: 'Activity', definition: 'high-level user goal, ordered left-to-right as a journey.' },
      { term: 'Task', definition: 'step or workflow within an activity.' },
      { term: 'Story', definition: 'atomic, sprint-sized feature. Write as a user outcome, not a technical spec.' },
      { term: 'Kano', definition: 'Must-Have, Performance, or Delighter priority class.' },
      { term: 'PIC', definition: 'Person In Charge. Assign an owner to each story.' }
    ]
  },
  {
    id: 'backlog',
    name: 'Epics',
    category: 'Delivery',
    description: 'Epics with stories, acceptance criteria, priority, and PIC assignment.',
    icon: ClipboardList,
    fields: [],
    instructions: 'Organize work into Epics (large themes). Add Stories under each epic with acceptance criteria. Assign a PIC (Person In Charge) and mark stories as done when complete. Stories are sorted within each epic.',
    terminology: [
      { term: 'Epic', definition: 'large body of work broken into stories.' },
      { term: 'Story', definition: 'specific user-facing feature.' },
      { term: 'PIC', definition: 'Person In Charge / owner.' },
      { term: 'Acceptance Criteria', definition: 'conditions that must be met for the story to be considered done.' },
      { term: 'Kano', definition: 'priority classification for the story.' }
    ]
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    category: 'Delivery',
    description: 'A flexible kanban board with custom columns, WIP limits, priority flags, and drag‑and‑drop.',
    icon: Columns3,
    fields: [],
    instructions: 'Drag cards between columns to reflect status: To Do → In Progress → Review → Blocked → Done. Cards auto-sort by priority within each column. Assign an owner and optionally a type: Bug (🐛), Feature (✨), Improvement (🔧), or Task (no icon). If a card is stuck, drag it to Blocked.',
    terminology: [
      { term: 'WIP', definition: 'Work In Progress limit on active cards per column.' },
      { term: 'Blocked', definition: 'cannot proceed due to a dependency or issue.' },
      { term: 'Priority', definition: 'Critical (red), High (orange), Medium (amber), Low (blue), None (grey).' },
      { term: 'Type', definition: 'Bug, Feature, Improvement, or Task, shown as an icon left of the card ID.' }
    ]
  },
  {
    id: 'assumption-test',
    name: 'Assumption Test',
    category: 'Validation',
    description: 'Track and test assumptions on a priority quadrant (importance vs evidence).',
    icon: FlaskConical,
    fields: [],
    instructions: 'Log each assumption with a type (Desirability, Feasibility, Usability, Viability). Define a test method and success criteria. Update status as you test: Untested → Testing → Validated → Invalidated. Plot by importance and evidence strength.',
    terminology: [
      { term: 'Desirability', definition: 'do users want it?' },
      { term: 'Feasibility', definition: 'can we build it?' },
      { term: 'Usability', definition: 'can users use it easily?' },
      { term: 'Viability', definition: 'is it good for the business?' },
      { term: 'Importance', definition: 'how critical the assumption is.' },
      { term: 'Evidence', definition: 'how much data supports or refutes it.' }
    ]
  }
];
