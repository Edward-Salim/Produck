import coverCDH from '$lib/assets/covers/continuous_discovery_habits.jpg';
import coverInspired from '$lib/assets/covers/inspired.jpg';
import coverOutcomes from '$lib/assets/covers/outcomes_over_output.png';
import coverSprint from '$lib/assets/covers/sprint.jpg';
import coverMomTest from '$lib/assets/covers/the_mom_test.jpg';
import coverUSM from '$lib/assets/covers/user_story_mapping.jpg';
import coverPS101 from '$lib/assets/covers/problem_solving_101.png';
import coverEG from '$lib/assets/covers/evidence_guided.png';

export type Category =
  | 'Strategy'
  | 'Discovery'
  | 'Validation'
  | 'Delivery'
  | 'Measurement'
  | 'Process'
  | 'Analysis';

export interface Artifact {
  name: string;
  category: Category;
  description: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  year: number;
  cover: string;
  artifacts: Artifact[];
}

import { ARTIFACT_CATEGORY_COLORS } from '$lib/constants/colors.js';

export const CATEGORY_META = ARTIFACT_CATEGORY_COLORS as Record<
  Category,
  { color: string; bg: string }
>;

export const ALL_CATEGORIES: Category[] = [
  'Strategy',
  'Discovery',
  'Validation',
  'Delivery',
  'Measurement',
  'Process',
  'Analysis'
];

export const BOOKS: Book[] = [
  {
    id: 'cdh',
    title: 'Continuous Discovery Habits',
    subtitle: 'Discover Products that Create Customer Value and Business Value',
    author: 'Teresa Torres',
    year: 2021,
    cover: coverCDH,
    artifacts: [
      {
        name: 'Experience Map',
        category: 'Discovery',
        description: 'End-to-end customer journey used to surface pain points'
      },
      {
        name: 'Story-Based Interview',
        category: 'Discovery',
        description: 'Elicit specific past stories using temporal prompts, not direct questions'
      },
      {
        name: 'Interview Snapshot',
        category: 'Discovery',
        description: 'One-page synthesis: quote, insight, opportunity per interview'
      },
      {
        name: 'Opportunity Solution Tree (OST)',
        category: 'Discovery',
        description: 'Visual tree linking outcome to opportunities to solutions to experiments'
      },
      {
        name: 'Opportunity Assessment',
        category: 'Strategy',
        description: 'Evaluate siblings by four lenses: sizing, market, company, customer factors'
      },
      {
        name: 'Story Map (Solution-Level)',
        category: 'Validation',
        description:
          'Steps a user takes to get value from a solution, surfacing assumptions at each step'
      },
      {
        name: 'Pre-Mortem',
        category: 'Validation',
        description: 'Team imagines the product failed 6 months out and lists reasons why'
      },
      {
        name: 'Assumption Map',
        category: 'Validation',
        description: '2x2 matrix plotting assumptions by importance vs. evidence'
      },
      {
        name: 'Assumption Test',
        category: 'Validation',
        description: 'Simulate a moment, evaluate behavior, define success criteria before running'
      },
      {
        name: 'Continuous Interviewing Cadence',
        category: 'Process',
        description: 'Weekly interview habit with automated recruiting for the Product Trio'
      }
    ]
  },
  {
    id: 'inspired',
    title: 'INSPIRED',
    subtitle: 'How to Create Tech Products Customers Love',
    author: 'Marty Cagan',
    year: 2018,
    cover: coverInspired,
    artifacts: [
      {
        name: 'Business Context',
        category: 'Strategy',
        description: 'Vision + strategy + objectives replacing traditional roadmaps'
      },
      {
        name: 'High-Integrity Commitment',
        category: 'Strategy',
        description: 'Structured promise to stakeholders with evidence backing'
      },
      {
        name: 'Product Vision',
        category: 'Strategy',
        description: '3-5 year north star for the product'
      },
      {
        name: 'Product Strategy',
        category: 'Strategy',
        description: 'How to achieve the vision: focus areas, sequence, leverage'
      },
      {
        name: 'Product Principles',
        category: 'Strategy',
        description: 'Decision-making guardrails for the team'
      },
      {
        name: 'OKR Technique',
        category: 'Measurement',
        description: 'Objectives + measurable Key Results per quarter'
      },
      {
        name: 'Opportunity Assessment',
        category: 'Discovery',
        description: '4 questions: objective, key results, customer problem, target market'
      },
      {
        name: 'Customer Letter',
        category: 'Discovery',
        description: 'Amazon-style letter from a happy customer to the CEO'
      },
      {
        name: 'Startup Canvas',
        category: 'Discovery',
        description: 'Lightweight alternative to business plans for new product lines'
      },
      {
        name: 'Story Map',
        category: 'Discovery',
        description: '2D map: horizontal user activities, vertical detailed tasks'
      },
      {
        name: 'Reference Customers',
        category: 'Discovery',
        description: 'Six real users paying real money and willing to vouch for the product'
      },
      {
        name: 'Prototypes',
        category: 'Validation',
        description: 'Feasibility, user, live-data, and hybrid (Wizard of Oz) prototypes'
      }
    ]
  },
  {
    id: 'outcomes',
    title: 'Outcomes Over Output',
    subtitle: 'Why Customer Behavior Is the Key Metric for Business Success',
    author: 'Joshua Seiden',
    year: 2019,
    cover: coverOutcomes,
    artifacts: [
      {
        name: 'Program Logic Model',
        category: 'Strategy',
        description: 'Chain: Activities → Outputs → Outcomes → Impact'
      },
      {
        name: 'Magic Questions',
        category: 'Discovery',
        description: 'Three questions to move from features to behavioral outcomes'
      },
      {
        name: 'Leading Indicators',
        category: 'Measurement',
        description: 'Observable behaviors that predict future business results'
      },
      {
        name: 'Outcome-Based Key Results',
        category: 'Measurement',
        description:
          'OKRs where key results are measurable customer behaviors, not feature launches'
      },
      {
        name: 'Customer Journey Map (Boosters/Blockers)',
        category: 'Discovery',
        description: 'Journey annotated with what helps and hurts target behavior'
      },
      {
        name: 'Outcome-Based Roadmap',
        category: 'Strategy',
        description: 'Hypotheses about which behaviors to change, not features to ship'
      }
    ]
  },
  {
    id: 'sprint',
    title: 'Sprint',
    subtitle: 'How to Solve Big Problems and Test New Ideas in Just Five Days',
    author: 'Jake Knapp',
    year: 2016,
    cover: coverSprint,
    artifacts: [
      {
        name: 'Sprint Challenge',
        category: 'Strategy',
        description: 'High-stakes problem worth a week of intense focus'
      },
      {
        name: 'Long-term Goal + Sprint Questions',
        category: 'Strategy',
        description: 'North star + "can we..." risk questions to answer'
      },
      {
        name: 'Map',
        category: 'Discovery',
        description: 'Simple customer journey: actors on left, ending on right, 5-15 steps'
      },
      {
        name: 'HMW Notes',
        category: 'Discovery',
        description: '"How Might We" opportunity notes from expert interviews'
      },
      {
        name: 'Lightning Demos',
        category: 'Discovery',
        description: '3-minute tours of solutions from other products and domains'
      },
      {
        name: 'Solution Sketch (Four-Step)',
        category: 'Discovery',
        description: 'Individual detailed sketch: notes, ideas, crazy 8s, solution sketch'
      },
      {
        name: 'Storyboard',
        category: 'Delivery',
        description: '15-frame grid blueprint for the prototype'
      },
      {
        name: 'Prototype',
        category: 'Validation',
        description: 'Realistic facade built in one day using Keynote, slides, or props'
      },
      {
        name: 'Five-Act Interview',
        category: 'Validation',
        description: 'Welcome, context, introduce prototype, tasks, debrief'
      },
      {
        name: 'The Grid',
        category: 'Measurement',
        description: 'Whiteboard: 5 columns (customers) x rows (prototype parts), color-coded notes'
      }
    ]
  },
  {
    id: 'momtest',
    title: 'The Mom Test',
    subtitle: 'How to Talk to Customers and Learn If Your Business Is a Good Idea',
    author: 'Rob Fitzpatrick',
    year: 2013,
    cover: coverMomTest,
    artifacts: [
      {
        name: 'The Three Rules',
        category: 'Discovery',
        description:
          'Talk about their life, ask about specifics in the past, talk less and listen more'
      },
      {
        name: 'Currencies of Conversation',
        category: 'Validation',
        description: 'Evaluate meetings by commitments of time, reputation, or money'
      },
      {
        name: 'Who-Where Pairs',
        category: 'Discovery',
        description: 'Specific customer slice + where to find them'
      },
      {
        name: 'Five-Element Framing',
        category: 'Process',
        description: 'Vision, Framing, Weakness, Pedestal, Ask (Very Few Wizards Properly Ask)'
      },
      {
        name: 'The Golden Rule of Prep',
        category: 'Process',
        description: 'Identify the 3 biggest questions before any batch of interviews'
      },
      {
        name: 'Shorthand Symbols',
        category: 'Process',
        description: 'Icons for pain, goal, obstacle, feature request, money, follow-up'
      },
      {
        name: 'Note Review',
        category: 'Discovery',
        description: 'Team reviews notes together to update beliefs and refine questions'
      }
    ]
  },
  {
    id: 'usm',
    title: 'User Story Mapping',
    subtitle: 'Discover the Whole Story, Build the Right Product',
    author: 'Jeff Patton',
    year: 2014,
    cover: coverUSM,
    artifacts: [
      {
        name: 'Story Map',
        category: 'Delivery',
        description: 'Backbone (narrative flow) + body (details), left-to-right, top-to-bottom'
      },
      {
        name: 'MVPe',
        category: 'Delivery',
        description: 'Smallest thing to build to learn if a hypothesis is correct'
      },
      {
        name: 'Functional Walking Skeleton',
        category: 'Delivery',
        description: 'Thinnest end-to-end slice tackling highest technical risks first'
      },
      {
        name: 'Release Slicing',
        category: 'Delivery',
        description: 'Horizontal cuts: Opening, Midgame, Endgame with outcome goals'
      },
      {
        name: 'The 3 Cs',
        category: 'Delivery',
        description: 'Card, Conversation, Confirmation for each user story'
      },
      {
        name: 'Three Amigos',
        category: 'Process',
        description: 'Developer + Tester + Product discovery member agree on acceptance criteria'
      },
      {
        name: 'Discovery Triad',
        category: 'Discovery',
        description:
          'Product Owner + UX Designer + Senior Engineer ensure valuable, usable, feasible'
      },
      {
        name: 'Opportunity Canvas',
        category: 'Discovery',
        description: 'One-page canvas: problem, users, solutions, metrics, budget'
      },
      {
        name: 'Personas',
        category: 'Discovery',
        description: 'Sketches of target users based on facts and assumptions'
      },
      {
        name: 'The Report Card',
        category: 'Measurement',
        description: 'Grade major user activities A-F across the story map backbone'
      }
    ]
  },
  {
    id: 'ps101',
    title: 'Problem Solving 101',
    subtitle: 'A Simple Book for Smart People',
    author: 'Ken Watanabe',
    year: 2009,
    cover: coverPS101,
    artifacts: [
      {
        name: 'Logic Tree',
        category: 'Analysis',
        description: 'Break a large problem into smaller categories, no overlap, no one left out'
      },
      {
        name: 'Yes/No Tree',
        category: 'Analysis',
        description: 'Binary buckets to pinpoint where a process breaks down'
      },
      {
        name: 'Problem-Solving Design Plan',
        category: 'Analysis',
        description: 'Clarify questions, state hypotheses, list rationale and data needed'
      },
      {
        name: 'Hypothesis Pyramid',
        category: 'Analysis',
        description: 'Conclusion at top, supporting rationales at bottom'
      },
      {
        name: 'Gap Analysis',
        category: 'Strategy',
        description: 'Goal vs. current state, then logic tree to close the gap'
      },
      {
        name: 'Impact vs. Ease Matrix',
        category: 'Analysis',
        description: '2x2 prioritization: high impact + easy first'
      },
      {
        name: 'Pros-and-Cons Grid',
        category: 'Analysis',
        description: 'Side-by-side benefits and drawbacks of multiple options'
      }
    ]
  },
  {
    id: 'eg',
    title: 'Evidence-Guided',
    subtitle: 'Creating High-Impact Products in the Face of Uncertainty',
    author: 'Itamar Gilad',
    year: 2024,
    cover: coverEG,
    artifacts: [
      {
        name: 'Confidence Meter',
        category: 'Validation',
        description:
          'Scale from 0.01 (self-conviction) to 10+ (launch data) measuring evidence strength'
      },
      {
        name: 'North Star Metric',
        category: 'Measurement',
        description: 'Core value delivered to market, aggregate number that grows over time'
      },
      {
        name: 'Metrics Trees',
        category: 'Measurement',
        description:
          'Hierarchy decomposing top-level metrics into actionable submetrics teams can own'
      },
      {
        name: 'Idea Bank',
        category: 'Discovery',
        description: 'Repository with states: Triage, Parked, Candidates (<40), Working-Set (3-5)'
      },
      {
        name: 'ICE Score',
        category: 'Discovery',
        description: 'Impact x Confidence x Ease, each 0-10, to prioritize ideas over opinions'
      },
      {
        name: 'AFTER Model',
        category: 'Validation',
        description: 'Five validation stages: Assessment, Fact-Finding, Tests, Experiments, Release'
      },
      {
        name: 'GIST Board',
        category: 'Process',
        description: 'Visual board with three columns: Goals, Ideas, Steps'
      },
      {
        name: 'Step Document',
        category: 'Process',
        description: 'Template: what to test, who, how, what to measure, success criteria'
      },
      {
        name: 'Outcome Roadmap',
        category: 'Strategy',
        description: 'Timeline of Key Results; outputs appear only after reaching high confidence'
      }
    ]
  }
];
