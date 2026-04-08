// ── PM Toolkit Data ──
// Static catalog of PM artifacts and methodologies.

export interface Artifact {
  name: string;
  category:
    | 'Strategy'
    | 'Discovery'
    | 'Validation'
    | 'Delivery'
    | 'Measurement'
    | 'Process'
    | 'Analysis';
  description: string;
  source: string;
  howTo: string[];
  figure?: string;
}

export interface Methodology {
  name: string;
  phase: 'Learn' | 'Plan' | 'Build' | 'Evaluate' | 'Align';
  origin: string;
  description: string;
  relatedArtifacts: string[];
  figure?: string;
}

export const CATEGORIES = [
  'Strategy',
  'Discovery',
  'Validation',
  'Delivery',
  'Measurement',
  'Process',
  'Analysis'
] as const;
export const PHASES = ['Learn', 'Plan', 'Build', 'Evaluate', 'Align'] as const;

// ─────────────────────────────────────────────────────────
// ARTIFACTS (105 total)
// ─────────────────────────────────────────────────────────

export const ARTIFACTS: Artifact[] = [
  // ── Continuous Discovery Habits - Teresa Torres (10) ──
  {
    name: 'Experience Map',
    category: 'Discovery',
    description: 'End-to-end customer journey used to surface pain points',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Set scope based on your desired outcome (narrow for optimization, broad for exploration)',
      'Each trio member maps the customer journey individually (avoid groupthink)',
      'Merge all maps into one shared version using nodes (moments) and links (arrows)',
      'Include unhappy paths: where customers get frustrated, loop back, or abandon',
      'Update weekly as you learn more from interviews'
    ]
  },
  {
    name: 'Story-Based Interview',
    category: 'Discovery',
    description: 'Elicit specific past stories using temporal prompts, not direct questions',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Write research questions (what the team wants to learn)',
      'Convert to interview questions that elicit specific past stories ("Tell me about the last time you...")',
      'Use temporal prompts: "What happened first?" "What happened next?"',
      'Never ask about the future or hypotheticals',
      'Whole trio participates; each role hears different things'
    ]
  },
  {
    name: 'Interview Snapshot',
    category: 'Discovery',
    description: 'One-page synthesis: quote, insight, opportunity per interview',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Take a photo of the interviewee (with permission) to aid memory',
      'Pick one memorable quote that captures their experience',
      'Note quick facts for context (role, usage patterns)',
      'List insights: what surprised you or confirmed assumptions',
      'Frame opportunities as needs ("I don\'t want to...") not features ("I want a button that...")'
    ]
  },
  {
    name: 'Opportunity Solution Tree (OST)',
    category: 'Discovery',
    description: 'Visual tree linking outcome to opportunities to solutions to experiments',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Place your desired outcome at the top',
      'Branch into opportunities (needs, pain points, desires) from interviews',
      'Use parent-child relationships (subsets) and sibling relationships (distinct alternatives)',
      'Add solutions as children of each opportunity (aim for 3+ per opportunity)',
      'Add assumption tests as children of each solution'
    ]
  },
  {
    name: 'Opportunity Assessment',
    category: 'Strategy',
    description: 'Evaluate siblings by four lenses: sizing, market, company, customer factors',
    source: 'Continuous Discovery Habits',
    howTo: [
      'List sibling opportunities at the same level of the tree',
      'Score each on four lenses: Opportunity sizing (how many customers, how often?), Market factors (table stakes or differentiator?), Company factors (aligned with mission and strategy?), Customer factors (how important to them, how satisfied with current solutions?)',
      'Pick one leaf-node opportunity to focus on (limit WIP)',
      'Treat as a two-way door decision: move fast, reverse if wrong'
    ]
  },
  {
    name: 'Story Map (Solution-Level)',
    category: 'Validation',
    description:
      'Steps a user takes to get value from a solution, surfacing assumptions at each step',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Pick one solution idea from the OST',
      'Map the specific steps a user takes to get value from it',
      'At each step, ask: what must be true for this to work?',
      'Categorize surfaced assumptions: desirability, viability, feasibility, usability, ethical',
      'Feed the riskiest assumptions into the Assumption Map'
    ]
  },
  {
    name: 'Pre-Mortem',
    category: 'Validation',
    description: 'Team imagines the product failed 6 months out and lists reasons why',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Imagine it is 6 months from now and the product has failed',
      'Each trio member writes down reasons for the failure individually',
      'Share and cluster the reasons',
      'Identify which are desirability, viability, feasibility, usability, or ethical risks',
      'Add the most critical ones to the Assumption Map'
    ]
  },
  {
    name: 'Assumption Map',
    category: 'Validation',
    description: '2x2 matrix plotting assumptions by importance vs. evidence',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Draw a 2x2 grid: X-axis (strong evidence to weak evidence), Y-axis (less important to more important)',
      'List all assumptions from Story Maps, Pre-Mortems, and OST lines',
      'Place each assumption on the grid',
      'The top-right quadrant (high importance, weak evidence) = "leap of faith" assumptions',
      'Test leap-of-faith assumptions first'
    ]
  },
  {
    name: 'Assumption Test',
    category: 'Validation',
    description: 'Simulate a moment, evaluate behavior, define success criteria before running',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Pick the highest-risk assumption from the Assumption Map',
      'Design a simulation of the specific moment the user would encounter it',
      'Define success criteria with specific numbers before running ("3 out of 5 people will...")',
      'Run the test (one-question survey, unmoderated test, prototype, data mining)',
      'Update the Assumption Map: move the assumption left if evidence gained'
    ]
  },
  {
    name: 'Continuous Interviewing Cadence',
    category: 'Process',
    description: 'Weekly interview habit with automated recruiting for the Product Trio',
    source: 'Continuous Discovery Habits',
    howTo: [
      'Set a target: at least one customer interview per week',
      'Automate recruiting (in-app triggers, scheduling software, standing calendar slots)',
      'Whole trio attends each interview',
      'Synthesize after every interview (Interview Snapshot), not in batches',
      'Review and update the OST weekly based on new learnings'
    ]
  },

  // ── INSPIRED - Marty Cagan (12) ──
  {
    name: 'Business Context',
    category: 'Strategy',
    description: 'Vision + strategy + objectives replacing traditional roadmaps',
    source: 'INSPIRED',
    howTo: [
      'Identify the product vision (2-5 year future state) and the product strategy (sequence of milestones to reach it)',
      'Define specific business objectives for each product team, measured by outcomes rather than feature completion',
      "Map each team's work to a clear customer problem and target market segment",
      'Replace the traditional feature roadmap with a shared understanding of vision, strategy, and team-level objectives',
      'Communicate context continuously so empowered teams can make good autonomous decisions'
    ]
  },
  {
    name: 'High-Integrity Commitment',
    category: 'Strategy',
    description: 'Structured promise to stakeholders with evidence backing',
    source: 'INSPIRED',
    howTo: [
      'Resist committing to delivery dates at the roadmap stage when uncertainty is highest',
      'Request time for product discovery first to validate value, usability, feasibility, and business viability',
      'Use prototypes and tests to reduce the four risks before making any promise',
      'Once the solution is validated, commit to a specific delivery date and expected business result',
      'Score committed objectives at 1.0 (binary pass/fail) rather than the 0.7 aspirational OKR scale'
    ]
  },
  {
    name: 'Product Vision',
    category: 'Strategy',
    description: '3-5 year north star for the product',
    source: 'INSPIRED',
    howTo: [
      'Start with "why" by articulating the purpose behind the product and the problem worth solving',
      'Think big: frame a 2-5 year ambitious future state that inspires the team and serves as a recruiting tool',
      'Fall in love with the problem, not any particular solution',
      'Be stubborn on the vision but flexible on the details; allow discovery to pivot the "how"',
      'Evangelize the vision near-constantly across the organization to prevent confusion and maintain alignment'
    ]
  },
  {
    name: 'Product Strategy',
    category: 'Strategy',
    description: 'How to achieve the vision: focus areas, sequence, leverage',
    source: 'INSPIRED',
    howTo: [
      'Focus on one target market or persona at a time rather than trying to please everyone',
      'Sequence product releases as deliberate milestones that build toward the vision',
      "Align product goals with the company's monetization model and business strategy",
      'Obsess over customers rather than competitors; customers leave when you stop serving them well',
      'Review and adjust the strategy as you gain evidence from each market segment'
    ]
  },
  {
    name: 'Product Principles',
    category: 'Strategy',
    description: 'Decision-making guardrails for the team',
    source: 'INSPIRED',
    howTo: [
      'Identify decisions where two valid options create recurring tension (e.g., buyer vs. seller priority)',
      'State the principle as a clear, opinionated stance the team commits to (not a vague platitude)',
      'Use the principle to resolve conflicts quickly without re-debating the same trade-off each time',
      'Communicate principles alongside the vision so teams understand the "nature" of the product you want to build',
      'Revisit principles when the market or business model changes significantly'
    ]
  },
  {
    name: 'OKR Technique',
    category: 'Measurement',
    description: 'Objectives + measurable Key Results per quarter',
    source: 'INSPIRED',
    howTo: [
      'Set qualitative, inspirational objectives at the company level, then cascade to product teams',
      'Define 1-3 quantitative key results per objective that measure business outcomes, not feature delivery',
      'Score on a 0-to-1.0 scale where 0.7 indicates success on aspirational goals',
      'Assign OKRs to cross-functional product teams (not functional silos like Design or Engineering separately)',
      'Have leadership reconcile proposed key results across teams to close gaps and resolve conflicts'
    ]
  },
  {
    name: 'Opportunity Assessment (INSPIRED)',
    category: 'Discovery',
    description: '4 questions: objective, key results, customer problem, target market',
    source: 'INSPIRED',
    howTo: [
      'State the business objective this effort addresses (which company or team OKR)',
      'Define the key results that will indicate success',
      'Describe the specific customer problem you are solving',
      'Identify the target market or customer segment',
      'Use these four answers to align the team and filter out efforts that lack clear purpose'
    ]
  },
  {
    name: 'Customer Letter',
    category: 'Discovery',
    description: 'Amazon-style letter from a happy customer to the CEO',
    source: 'INSPIRED',
    howTo: [
      'Imagine the product has launched successfully and a delighted customer writes to the CEO',
      "Write the letter from the customer's perspective describing how the product improved their life",
      'Focus on the emotional and practical benefits the customer experienced, not technical features',
      'Use the letter to pressure-test whether the team truly understands the value proposition',
      'Share the letter with the team as a north-star framing artifact before starting discovery'
    ]
  },
  {
    name: 'Startup Canvas',
    category: 'Discovery',
    description: 'Lightweight alternative to business plans for new product lines',
    source: 'INSPIRED',
    howTo: [
      'Use as a lightweight alternative to a full business plan when exploring a new product line or venture',
      'Identify the biggest risks: value proposition, customer segments, channels, and revenue model',
      'Keep each section concise; the canvas is a thinking tool, not a comprehensive document',
      'Prioritize the riskiest assumptions (typically value proposition and distribution) for early testing',
      'Update the canvas iteratively as discovery experiments provide evidence'
    ]
  },
  {
    name: 'Story Map',
    category: 'Discovery',
    description: '2D map: horizontal user activities, vertical detailed tasks',
    source: 'INSPIRED',
    howTo: [
      'Lay out the major user activities horizontally across the top to show the end-to-end journey',
      'Under each activity, add detailed user tasks vertically, ordered by priority or sequence',
      'Draw a horizontal line to define the minimum viable slice that delivers value',
      'Use the map to provide holistic context for the product backlog rather than a flat list of stories',
      'Walk the entire team through the map so everyone shares the same mental model of the product'
    ]
  },
  {
    name: 'Reference Customers',
    category: 'Discovery',
    description: 'Six real users paying real money and willing to vouch for the product',
    source: 'INSPIRED',
    howTo: [
      'Set a target of six reference customers in a single target market segment',
      'Recruit real users who are paying real money (not friends, family, or free-tier users)',
      'Work closely with each reference customer through discovery and iteration until they are genuinely successful',
      'Ask reference customers to publicly vouch for the product (case studies, references, peer recommendations)',
      'Only declare product/market fit and expand to adjacent markets once you have earned your reference customers'
    ]
  },
  {
    name: 'Prototypes',
    category: 'Validation',
    description: 'Feasibility, user, live-data, and hybrid (Wizard of Oz) prototypes',
    source: 'INSPIRED',
    howTo: [
      'Choose the prototype fidelity based on the risk: feasibility prototypes for technical risk, user prototypes for usability and value risk',
      'Build feasibility prototypes as minimal code spikes written by engineers to test performance, scalability, or third-party integration',
      'Create user prototypes ranging from low-fidelity wireframes (for structure) to high-fidelity clickable simulations (for realistic testing)',
      'Use live-data prototypes when you need real data and traffic to validate an algorithm or recommendation engine',
      'Consider Wizard-of-Oz prototypes where a human performs the back-end task behind a realistic front end to simulate automation before building it'
    ]
  },

  // ── Outcomes Over Output - Joshua Seiden (6) ──
  {
    name: 'Program Logic Model',
    category: 'Strategy',
    description: 'Chain: Activities -> Outputs -> Outcomes -> Impact',
    source: 'Outcomes Over Output',
    howTo: [
      'Define the resources available: people, money, and materials',
      'List the activities (work performed) that consume those resources',
      'Identify the outputs - the tangible products or deliverables created',
      'Specify the outcomes - the measurable changes in human behavior those outputs produce',
      'Connect outcomes to the ultimate impact (e.g., higher revenue, better standard of living)'
    ]
  },
  {
    name: 'Magic Questions',
    category: 'Discovery',
    description: 'Three questions to move from features to behavioral outcomes',
    source: 'Outcomes Over Output',
    howTo: [
      'Ask: "What are the user and customer behaviors that drive business results?" to identify target outcomes',
      'Ask: "How can we get people to do more of those behaviors?" to generate possible features, policy changes, or promotions',
      'Ask: "How do we know that we\'re right?" to define tests and metrics for measuring progress',
      'Write each answer on a shared whiteboard so the team can see the chain from behavior to result',
      'Revisit these questions at the start of every planning cycle to keep the team outcome-focused'
    ]
  },
  {
    name: 'Leading Indicators',
    category: 'Measurement',
    description: 'Observable behaviors that predict future business results',
    source: 'Outcomes Over Output',
    howTo: [
      'List your lagging indicators (metrics that report the past, e.g., annual return rate)',
      'For each lagging indicator, brainstorm observable behaviors that predict its movement',
      'Select the behaviors with the strongest predictive link to future success (e.g., social sharing, newsletter opens)',
      'Define how you will measure each leading indicator at a regular cadence',
      'Target these leading indicators as team outcomes instead of chasing lagging metrics'
    ]
  },
  {
    name: 'Outcome-Based Key Results',
    category: 'Measurement',
    description: 'OKRs where key results are measurable customer behaviors, not feature launches',
    source: 'Outcomes Over Output',
    howTo: [
      'Write an Objective that describes the desired qualitative change',
      'Draft Key Results as measurable customer or user behaviors, not feature launches',
      'Validate each Key Result by checking: "If this behavior increases, does it plausibly drive the Objective?"',
      'Set specific numeric targets with time bounds (e.g., "1,000 new registrations in the first week")',
      'Review weekly; if a Key Result is not moving, treat it as a signal to experiment with different solutions'
    ]
  },
  {
    name: 'Customer Journey Map (Boosters/Blockers)',
    category: 'Discovery',
    description: 'Journey annotated with what helps and hurts target behavior',
    source: 'Outcomes Over Output',
    howTo: [
      'Draw swim lanes for each actor (buyer, seller, internal team) across the service timeline',
      'Map the actual behaviors at each step of the journey from first contact to goal completion',
      'Mark Boosters (+): behaviors that predict satisfaction and drive business results',
      'Mark Blockers (-): behaviors that predict dissatisfaction or abandonment',
      'Convert the most impactful Boosters and Blockers into outcome hypotheses for the roadmap'
    ]
  },
  {
    name: 'Outcome-Based Roadmap',
    category: 'Strategy',
    description: 'Hypotheses about which behaviors to change, not features to ship',
    source: 'Outcomes Over Output',
    howTo: [
      'Replace the feature-list roadmap with themes framed as behavior changes to deliver',
      'For each theme, write a hypothesis: "We believe that increasing [Behavior A] will lead to [Business Impact B]"',
      'Prioritize themes by their expected impact on leading indicators',
      'Plan experiments (MVPs) to test each hypothesis before committing full resources',
      'Update the roadmap as experiments confirm or disprove hypotheses - treat it as a living document'
    ]
  },

  // ── Sprint - Jake Knapp (10) ──
  {
    name: 'Sprint Challenge',
    category: 'Strategy',
    description: 'High-stakes problem worth a week of intense focus',
    source: 'Sprint',
    howTo: [
      'Evaluate whether your problem meets the sprint criteria: high stakes, not enough time, or just plain stuck',
      'Identify the big question the sprint must answer by the end of the week',
      'Choose to solve the surface first - focus on the customer-facing interface, not the back-end',
      'Assemble the right team (seven or fewer) including a Decider and a Facilitator',
      'Block five full days (Mon-Thu 10 a.m.-5 p.m., Fri 9 a.m.-5 p.m.) with no-device rules in the sprint room'
    ]
  },
  {
    name: 'Long-term Goal + Sprint Questions',
    category: 'Strategy',
    description: 'North star + "can we..." risk questions to answer',
    source: 'Sprint',
    howTo: [
      'Write an optimistic long-term goal answering where you want to be in six months to five years',
      "Post the goal at the top of the whiteboard as the team's North Star",
      'Imagine the project has failed - each team member lists reasons for the failure',
      'Rephrase each fear as a testable question (e.g., "Will customers trust our expertise?")',
      "Record all sprint questions on the whiteboard below the goal; these guide the week's decisions"
    ]
  },
  {
    name: 'Map',
    category: 'Discovery',
    description: 'Simple customer journey: actors on left, ending on right, 5-15 steps',
    source: 'Sprint',
    howTo: [
      'List the key actors (customers, users) on the left side of the whiteboard',
      'Place the ending goal (e.g., "purchase complete") on the right side',
      'Draw 5-15 steps showing how customers move from start to finish using words, arrows, and boxes',
      'Keep the map simple and customer-centric - avoid technical implementation details',
      'Update the map during expert interviews as new steps or gaps are discovered'
    ]
  },
  {
    name: 'HMW Notes',
    category: 'Discovery',
    description: '"How Might We" opportunity notes from expert interviews',
    source: 'Sprint',
    howTo: [
      'During expert interviews, reframe every problem heard as a "How might we...?" note on a sticky',
      'Write one idea per sticky note so each can be moved independently',
      'After interviews, organize all HMW notes into themed columns on a wall',
      'Dot-vote: each team member gets two dots, the Decider gets four, to mark the most promising questions',
      'Move the highest-voted HMW notes onto the map near the relevant steps; the Decider picks the target customer and target event'
    ]
  },
  {
    name: 'Lightning Demos',
    category: 'Discovery',
    description: '3-minute tours of solutions from other products and domains',
    source: 'Sprint',
    howTo: [
      'Each team member lists products or services that solve a similar problem - including from completely different domains',
      'Give three-minute tours of each solution, highlighting what makes it effective',
      'The Facilitator captures each "big idea" on the whiteboard with a quick sketch and a headline',
      'Build a "greatest hits" reference wall of inspiring solutions for the team to use during sketching',
      'Decide whether to "swarm" one target or "divide" the map among team members before sketching begins'
    ]
  },
  {
    name: 'Solution Sketch (Four-Step)',
    category: 'Discovery',
    description: 'Individual detailed sketch: notes, ideas, crazy 8s, solution sketch',
    source: 'Sprint',
    howTo: [
      'Notes (20 min): walk around the room reviewing the goal, map, HMW votes, and Lightning Demo ideas',
      'Ideas (20 min): jot down rough concepts and doodles privately - these are not shared',
      'Crazy 8s (8 min): fold a sheet into eight panels and sketch eight variations of your strongest idea, one per minute',
      'Solution Sketch (30+ min): create a detailed, self-explanatory three-panel storyboard with real words and a catchy title',
      'Submit anonymously - no names on sketches - so they are judged on content alone on Wednesday'
    ]
  },
  {
    name: 'Storyboard',
    category: 'Delivery',
    description: '15-frame grid blueprint for the prototype',
    source: 'Sprint',
    howTo: [
      'Draw a grid of approximately 15 frames on a whiteboard',
      'Choose the opening scene: how the customer first encounters the product (web search, news article, store shelf)',
      'Fill frames by stringing together the winning sketches from the Sticky Decision vote',
      'Plug gaps with "maybe-later" ideas or existing product screens - do not brainstorm new solutions',
      'Ensure the entire storyboard flow can be tested within a 15-minute window during Friday interviews'
    ]
  },
  {
    name: 'Prototype',
    category: 'Validation',
    description: 'Realistic facade built in one day using Keynote, slides, or props',
    source: 'Sprint',
    howTo: [
      'Pick rougher, faster tools (Keynote, PowerPoint, website builders) instead of production tools',
      'Divide the storyboard into parts and assign roles: Makers, Stitcher, Writer, Asset Collector, Interviewer',
      'Makers build individual components; the Stitcher combines them into one consistent experience',
      'The Writer crafts realistic text (no lorem ipsum) while the Asset Collector gathers photos, icons, and sample content',
      'Run a trial by 3 p.m. - the full team walks through the prototype to catch bugs and confirm it answers the sprint questions'
    ]
  },
  {
    name: 'Five-Act Interview',
    category: 'Validation',
    description: 'Welcome, context, introduce prototype, tasks, debrief',
    source: 'Sprint',
    howTo: [
      'Friendly Welcome: greet the customer warmly, clarify you are testing the product not the person',
      "Context Questions: ask open-ended questions about the customer's life and habits to build rapport",
      'Introduce the Prototype: show the prototype, ask them to think aloud, and distance yourself ("I didn\'t design this")',
      'Tasks and Nudges: give realistic, open-ended tasks and observe how they navigate without offering help',
      'Quick Debrief: ask overarching experience questions and use "magic wishes" to surface desired improvements'
    ]
  },
  {
    name: 'The Grid',
    category: 'Measurement',
    description: 'Whiteboard: 5 columns (customers) x rows (prototype parts), color-coded notes',
    source: 'Sprint',
    howTo: [
      'Draw a whiteboard grid with five columns (one per customer) and rows for each prototype section or sprint question',
      'While watching each interview on the live feed, write observations on color-coded sticky notes: green (positive), red (negative), black (neutral)',
      'Place each sticky note in the matching cell on the grid',
      'After all five interviews, review the grid together to spot patterns appearing with three or more customers',
      "Compare patterns against Monday's sprint questions; the Decider makes the final call on next steps"
    ]
  },

  // ── The Mom Test - Rob Fitzpatrick (7) ──
  {
    name: 'The Three Rules',
    category: 'Discovery',
    description:
      'Talk about their life, ask about specifics in the past, talk less and listen more',
    source: 'The Mom Test',
    howTo: [
      "Reframe every question to focus on the customer's life, not your idea - ask about their workflow, frustrations, and goals",
      'Anchor all responses to specifics in the past - replace hypotheticals with "Tell me about the last time that happened"',
      'When you catch yourself talking or pitching, stop, apologize, and redirect to listening',
      'After each conversation, check: did you learn concrete facts, or just collect opinions and compliments?'
    ]
  },
  {
    name: 'Currencies of Conversation',
    category: 'Validation',
    description: 'Evaluate meetings by commitments of time, reputation, or money',
    source: 'The Mom Test',
    howTo: [
      'Identify the three currencies a customer can give: time, reputation risk, or money',
      'At the end of every meeting, push for a concrete commitment in at least one currency (e.g., a follow-up meeting with defined goals, an intro to a decision-maker, or a pre-order)',
      'Classify the outcome: advancement (moved to next funnel stage) or failure (compliment or stalling tactic)',
      'Watch for zombie leads who keep meeting but never commit - cut them loose and refocus on leads who give real currency',
      'Use rejection ("no") as a valid, clarifying data point rather than treating it as a loss'
    ]
  },
  {
    name: 'Who-Where Pairs',
    category: 'Discovery',
    description: 'Specific customer slice + where to find them',
    source: 'The Mom Test',
    howTo: [
      'Start with a broad customer segment and slice it by asking: within this group, who wants this most and why?',
      'Keep slicing until you find a sub-group with consistent problems, goals, and motivations',
      'For each sub-group, identify where you can physically find them (conferences, communities, departments)',
      'Evaluate each pair on three criteria: profitable (can pay), easy to reach (accessible), and rewarding (worth building for)',
      'If feedback remains inconsistent after 10 conversations, the segment is still too broad - slice again'
    ]
  },
  {
    name: 'Five-Element Framing',
    category: 'Process',
    description: 'Vision, Framing, Weakness, Pedestal, Ask (Very Few Wizards Properly Ask)',
    source: 'The Mom Test',
    howTo: [
      'Open with your Vision: a half-sentence on the big problem you are trying to solve (not your product)',
      'State your Framing: explain your current stage and clarify you have nothing to sell yet',
      'Show a Weakness: name a specific challenge you are struggling to understand',
      'Place them on a Pedestal: explain why they, specifically, are uniquely qualified to help',
      'Make the Ask: request a specific, small amount of their time (use the mnemonic Very Few Wizards Properly Ask)'
    ]
  },
  {
    name: 'The Golden Rule of Prep',
    category: 'Process',
    description: 'Identify the 3 biggest questions before any batch of interviews',
    source: 'The Mom Test',
    howTo: [
      'Before any batch of interviews, write down the three most important (and scariest) things you need to learn',
      'Spend up to one hour updating your best guesses about what the customer cares about - the meeting validates or invalidates these',
      'Do desk research first: if a question can be answered via a search engine, do not waste conversation time on it',
      'Ask the pre-mortem question: "If this company fails, why will it have happened?" to surface hidden risks',
      'Replace any question you have reliable data on with the next murkiest unknown on your list'
    ]
  },
  {
    name: 'Shorthand Symbols',
    category: 'Process',
    description: 'Icons for pain, goal, obstacle, feature request, money, follow-up',
    source: 'The Mom Test',
    howTo: [
      'During live note-taking, use emotion symbols: :) for excited, :( for angry, :| for embarrassed',
      'Mark life and context signals: lightning bolt for pain/problem, goal icon for job-to-be-done, square for obstacle, curved arrow for workaround, caret for background',
      'Tag specifics: checkbox for feature request or purchasing criteria, dollar sign for money/budget, person icon for a specific person or company mentioned, star for follow-up task',
      'Capture exact verbatim quotes - these are powerful for marketing copy, fundraising decks, and resolving internal debates',
      'Store notes in a permanent, retrievable, sortable medium (index cards for physical sorting, or a shared spreadsheet/doc for digital teams)'
    ]
  },
  {
    name: 'Note Review',
    category: 'Discovery',
    description: 'Team reviews notes together to update beliefs and refine questions',
    source: 'The Mom Test',
    howTo: [
      'After every conversation, review notes together as a team to update collective beliefs',
      'Conduct a meta-level review: which questions worked, which signals were missed, and how to improve the interview craft',
      'Use the two-person rule: one leads the talk, one takes detailed notes, then both debrief to catch biases',
      'Update the three big questions based on what was learned - retire answered ones, promote new unknowns',
      'Check for warning signs: if you are talking more than listening, ideas remain unchanged despite new data, or you avoided scary questions, the process needs correction'
    ]
  },

  // ── User Story Mapping - Jeff Patton (10) ──
  {
    name: 'Story Map (USM)',
    category: 'Delivery',
    description: 'Backbone (narrative flow) + body (details), left-to-right, top-to-bottom',
    source: 'User Story Mapping',
    howTo: [
      'Frame the problem first: identify who the product is for and why it is being built before writing any cards',
      'Map the backbone left to right in narrative flow - write each high-level user activity on a card using the Think-Write-Explain-Place habit',
      'Decompose each activity top to bottom into user tasks (verb phrases), exploring alternatives and exceptions by playing "What About"',
      'Keep it mile wide, inch deep: cover the full breadth of the user journey before diving into details on any single activity',
      'Use the map to find holes - missing steps, unclear handoffs, or gaps that a flat backlog would hide'
    ]
  },
  {
    name: 'MVPe',
    category: 'Delivery',
    description: 'Smallest thing to build to learn if a hypothesis is correct',
    source: 'User Story Mapping',
    howTo: [
      'Start with the story map backbone and identify the specific hypothesis you need to test (not a product to ship)',
      'Slice the smallest possible set of tasks from the map that would let you run an experiment and learn',
      'Build only what is needed to observe real user behavior - it does not need to be "viable" for the general market',
      'Measure success through behavioral metrics (actual usage) rather than verbal feedback or politeness',
      'Update the map backbone and details based on what you learned, then design the next experiment'
    ]
  },
  {
    name: 'Functional Walking Skeleton',
    category: 'Delivery',
    description: 'Thinnest end-to-end slice tackling highest technical risks first',
    source: 'User Story Mapping',
    howTo: [
      'Identify the essential functional path through the story map - the minimum end-to-end flow a user must complete',
      'Slice this as the Opening Game: build just enough to see the product working from start to finish',
      'Address the highest technical risks first within this skeleton (infrastructure, integration points, unknowns)',
      'In the Midgame, fill in tough business rules and begin testing for performance, scalability, and usability',
      'In the Endgame, refine based on real data at scale and apply feedback gathered from earlier slices'
    ]
  },
  {
    name: 'Release Slicing',
    category: 'Delivery',
    description: 'Horizontal cuts: Opening, Midgame, Endgame with outcome goals',
    source: 'User Story Mapping',
    howTo: [
      'Draw horizontal lines across the story map to group tasks into distinct releases, each targeting a specific outcome',
      'For each slice, define the desired outcome (not just the features) - ask what user or business behavior should change',
      'Apply the minimization principle: everything above the line is necessary for the release to be viable, everything below is deferred',
      'Categorize features within each slice as table stakes, differentiators, spoilers, or cost reducers to sharpen focus',
      'Treat each release as a learning opportunity - plan to adjust later slices based on what earlier releases reveal'
    ]
  },
  {
    name: 'The 3 Cs',
    category: 'Delivery',
    description: 'Card, Conversation, Confirmation for each user story',
    source: 'User Story Mapping',
    howTo: [
      'Write the story on a Card - keep it short (a title and brief description) as a token to identify the conversation, not replace it',
      'Hold the Conversation with the people who have the problem and those who can solve it - use sketches, UI wireframes, and whiteboard drawings to externalize thinking',
      'Define Confirmation criteria (acceptance tests) that specify when the story is truly done',
      "Treat the card as a library catalog entry: it points to the real knowledge, which lives in the team's shared understanding",
      'After building, inspect results across three quality dimensions: user experience, functional correctness, and code maintainability'
    ]
  },
  {
    name: 'Three Amigos',
    category: 'Process',
    description: 'Developer + Tester + Product discovery member agree on acceptance criteria',
    source: 'User Story Mapping',
    howTo: [
      'Assemble three roles for the story workshop: a Product Owner or BA (value lens), a Developer (feasibility lens), and a Tester ("what about" lens)',
      'Walk through the story card together, discussing who the user is, what they need, and why it matters',
      'Have the Tester challenge the story with failure modes and edge cases to surface hidden acceptance criteria',
      'Agree on specific confirmation criteria that all three roles understand and accept before development begins',
      'Use the fishbowl technique for larger groups: the core trio works in the center while observers swap in only when they have something to add'
    ]
  },
  {
    name: 'Discovery Triad',
    category: 'Discovery',
    description: 'Product Owner + UX Designer + Senior Engineer ensure valuable, usable, feasible',
    source: 'User Story Mapping',
    howTo: [
      'Form a small cross-functional team of 2-4 people: a Product Owner, a UX Designer, and a Senior Engineer',
      'Explore opportunities together by discussing who the users are, what problems they face, and what solutions might work',
      'Evaluate every proposed solution against three lenses: Valuable (business/customer), Usable (user experience), and Feasible (technical implementation)',
      'Use prototypes, design comics, and story maps to envision the solution visually before committing to code',
      'Output a minimum viable solution definition - cut more ideas than you keep to maximize outcomes while minimizing output'
    ]
  },
  {
    name: 'Opportunity Canvas',
    category: 'Discovery',
    description: 'One-page canvas: problem, users, solutions, metrics, budget',
    source: 'User Story Mapping',
    howTo: [
      'Write the problem or idea name at the top, then describe the target users and customers in the first section',
      'Document the specific problems or needs these users have and how they currently cope (existing solutions or workarounds)',
      'State the proposed solution concept and the user value it delivers - what changes for the user?',
      'Define the business metrics that will indicate success and identify any budget, timeline, or technical constraints',
      'Use the completed canvas as a go/no-go filter: trash opportunities that do not offer clear hope for the desired outcomes'
    ]
  },
  {
    name: 'Personas',
    category: 'Discovery',
    description: 'Sketches of target users based on facts and assumptions',
    source: 'User Story Mapping',
    howTo: [
      'Identify the distinct user types who will interact with the product - give each a name, a sketch or photo, and a brief demographic context',
      'Base persona details on facts from real user research and interviews, flagging any attributes that are assumptions',
      'For each persona, list their primary goals, key frustrations, and the context in which they use the product',
      'In B2B settings, create Orgzonas alongside individual personas to capture organizational goals and purchasing dynamics',
      'Use personas during story mapping by color-coding cards per persona and walking through the map in character during rehearsal remapping'
    ]
  },
  {
    name: 'The Report Card',
    category: 'Measurement',
    description: 'Grade major user activities A-F across the story map backbone',
    source: 'User Story Mapping',
    howTo: [
      'Near the release date, list the major user activities from the story map backbone as rows in a grading sheet',
      'Grade each activity from A to F based on its current quality and completeness',
      'Identify any activity with a D or F grade as a critical focus area for the remaining development time',
      'Discuss grades with the team to ensure the assessment reflects user experience quality, functional correctness, and not just feature count',
      'Use the report card to make a ship-or-delay decision: all critical activities must reach a passing grade before release'
    ]
  },

  // ── Problem Solving 101 - Ken Watanabe (7) ──
  {
    name: 'Logic Tree',
    category: 'Analysis',
    description: 'Break a large problem into smaller categories, no overlap, no one left out',
    source: 'Problem Solving 101',
    howTo: [
      'State the broad problem or question on the left side of the tree',
      'Break it into major categories ensuring no overlaps and no gaps (the "no one gets left out" rule)',
      'Subdivide each category into finer sub-branches moving left to right',
      'Verify each level: confirm branches are mutually exclusive and collectively exhaustive',
      'Use the completed tree to pinpoint which branch deserves investigation or action'
    ]
  },
  {
    name: 'Yes/No Tree',
    category: 'Analysis',
    description: 'Binary buckets to pinpoint where a process breaks down',
    source: 'Problem Solving 101',
    howTo: [
      'Define the population or set you want to analyze (e.g., all potential customers)',
      'Pose a binary yes/no question that splits the set into two buckets',
      'For each bucket, pose the next binary question to split further',
      'Continue until each terminal bucket represents a distinct, actionable segment',
      'Identify the bucket with the biggest drop-off or problem and focus resources there'
    ]
  },
  {
    name: 'Problem-Solving Design Plan',
    category: 'Analysis',
    description: 'Clarify questions, state hypotheses, list rationale and data needed',
    source: 'Problem Solving 101',
    howTo: [
      'Write down the specific question you need to answer',
      'State your hypothesis (your best current guess) and the rationale behind it',
      'List the analyses or information sources needed to confirm or refute the hypothesis',
      'Collect and analyze the data, then compare actual results against your hypothesis',
      'Revise the hypothesis if disproven and repeat until the root cause is identified'
    ]
  },
  {
    name: 'Hypothesis Pyramid',
    category: 'Analysis',
    description: 'Conclusion at top, supporting rationales at bottom',
    source: 'Problem Solving 101',
    howTo: [
      'Place the main conclusion or recommendation at the top of the pyramid',
      'Below it, list 2-4 supporting rationales or sub-conclusions',
      'For each rationale, add the evidence or data points that back it up',
      'Decide the structure: grouping (independent supports) or argument (sequential chain)',
      'Test robustness: remove one support block and check whether the conclusion still holds'
    ]
  },
  {
    name: 'Gap Analysis',
    category: 'Strategy',
    description: 'Goal vs. current state, then logic tree to close the gap',
    source: 'Problem Solving 101',
    howTo: [
      'Set a clear, specific goal with measurable conditions and a deadline',
      'Determine your current state using concrete numbers',
      'Calculate the gap between the goal and the current state',
      'Use a logic tree to brainstorm ways to close the gap (e.g., increase income vs. reduce spending)',
      'Select the most feasible options and build a concrete action plan with milestones'
    ]
  },
  {
    name: 'Impact vs. Ease Matrix',
    category: 'Analysis',
    description: '2x2 prioritization: high impact + easy first',
    source: 'Problem Solving 101',
    howTo: [
      'Draw a 2x2 grid with Impact (low to high) on one axis and Ease of implementation (low to high) on the other',
      'List all candidate solutions from your brainstorming or logic tree',
      'Place each solution on the grid based on estimated impact and implementation difficulty',
      'Prioritize high-impact/high-ease solutions first; consider collaboration to shift hard items toward easy',
      'Discard or defer low-impact/low-ease solutions'
    ]
  },
  {
    name: 'Pros-and-Cons Grid',
    category: 'Analysis',
    description: 'Side-by-side benefits and drawbacks of multiple options',
    source: 'Problem Solving 101',
    howTo: [
      'List all options you are deciding between as column headers',
      'Define the evaluation criteria as row headers (e.g., cost, quality, location)',
      'Fill in the pros and cons for every option against every criterion',
      'Actively look for negatives in attractive options and positives in unattractive ones to counter bias',
      'Compare side-by-side and select the option with the strongest overall balance'
    ]
  },

  // ── Evidence-Guided - Itamar Gilad (9) ──
  {
    name: 'Confidence Meter',
    category: 'Validation',
    description:
      'Scale from 0.01 (self-conviction) to 10+ (launch data) measuring evidence strength',
    source: 'Evidence-Guided',
    howTo: [
      "Rate your idea's supporting evidence on the scale: self-conviction (0.01), thematic support (0.05), others' opinion (0.1), estimates/plans (0.3), anecdotal evidence (0.5), market data (1.0), user evidence (2-3), test results (5), launch data (10)",
      'Assign the confidence score that matches the strongest evidence you currently hold',
      'Use the score as the Confidence factor in your ICE calculation',
      'Identify which validation step would move you to the next confidence tier',
      'Re-score after each validation step and adjust investment accordingly'
    ]
  },
  {
    name: 'North Star Metric',
    category: 'Measurement',
    description: 'Core value delivered to market, aggregate number that grows over time',
    source: 'Evidence-Guided',
    howTo: [
      'Identify the core value your product delivers to users (not revenue, but the experience itself)',
      'Express that value as a single aggregate number that grows over time (e.g., messages sent per month)',
      'Verify it is simple enough for the entire organization to understand and remember',
      'Pair it with a Top Business Metric (e.g., revenue) to create the value exchange loop',
      'Revisit and refine if the metric no longer reflects where the product delivers its core value'
    ]
  },
  {
    name: 'Metrics Trees',
    category: 'Measurement',
    description: 'Hierarchy decomposing top-level metrics into actionable submetrics teams can own',
    source: 'Evidence-Guided',
    howTo: [
      'Place the North Star Metric and Top Business Metric at the root level',
      'Decompose each into contributing sub-metrics (input metrics that teams can influence)',
      'Continue branching until each leaf metric can be owned by a single team',
      'Check for overlap between the value-delivery tree and the value-capture tree; high overlap signals good alignment',
      'Add supplementary goals (code health, privacy, employee wellbeing) that the tree does not capture'
    ]
  },
  {
    name: 'Idea Bank',
    category: 'Discovery',
    description: 'Repository with states: Triage, Parked, Candidates (<40), Working-Set (3-5)',
    source: 'Evidence-Guided',
    howTo: [
      'Create a shared repository (spreadsheet, tool) open for anyone to submit ideas',
      'Triage incoming ideas: tag with relevant goal, estimate initial ICE scores',
      'Sort ideas into states: Parked (majority), Candidates (shortlist under 40), Working-Set (3-5 per goal)',
      'Review the bank regularly; promote promising ideas to Candidates and archive stale ones',
      'Assign a single owner (usually the PM) to keep the bank organized and visible'
    ]
  },
  {
    name: 'ICE Score',
    category: 'Discovery',
    description: 'Impact x Confidence x Ease, each 0-10, to prioritize ideas over opinions',
    source: 'Evidence-Guided',
    howTo: [
      'Estimate Impact: how much will this idea move the target metric? Score 0-10',
      'Estimate Ease: what is the inverse of effort in person-weeks? Score 0-10 (10 = less than one week)',
      'Assess Confidence using the Confidence Meter scale to score 0-10',
      'Calculate ICE = Impact x Confidence x Ease to get a comparable ranking number',
      'Treat scores as dynamic hints; re-score as new evidence arrives from validation steps'
    ]
  },
  {
    name: 'AFTER Model',
    category: 'Validation',
    description: 'Five validation stages: Assessment, Fact-Finding, Tests, Experiments, Release',
    source: 'Evidence-Guided',
    howTo: [
      'Assessment: run quick internal evaluations (ICE analysis, assumption mapping, stakeholder review)',
      'Fact-Finding: gather external data through user interviews, surveys, data mining, and competitive analysis',
      'Tests: measure real user reactions with low-cost fakes (fake door tests, Wizard of Oz, concierge tests, usability tests)',
      'Experiments: run controlled tests to reduce bias (A/B tests, multivariate tests) with predetermined success criteria',
      'Release: manage the final rollout via percent launches, holdback experiments, and dogfooding before full deployment'
    ]
  },
  {
    name: 'GIST Board',
    category: 'Process',
    description: 'Visual board with three columns: Goals, Ideas, Steps',
    source: 'Evidence-Guided',
    howTo: [
      'Create three columns on a physical or digital board: Goals (OKRs), Ideas (actively pursued), Steps (next 2-4 actions per idea)',
      "Populate Goals with the team's current OKR outcomes",
      'Link each active idea to a goal and display its current ICE score and confidence level',
      'List the upcoming validation steps for each idea and update them as evidence is collected',
      'Review the board every 1-2 weeks in a 30-minute trio meeting (PM, Designer, Engineering Lead)'
    ]
  },
  {
    name: 'Step Document',
    category: 'Process',
    description: 'Template: what to test, who, how, what to measure, success criteria',
    source: 'Evidence-Guided',
    howTo: [
      'State what to test: the core assumption or hypothesis being validated',
      'Define who to test with: the target user segment and sample size',
      'Describe how to test: the method (prototype, fake door, Wizard of Oz, A/B test, etc.)',
      'Specify what to measure: the data points to collect and success criteria (set before the test runs)',
      'Summarize results and next action: update the confidence score and decide to continue, pivot, or park the idea'
    ]
  },
  {
    name: 'Outcome Roadmap',
    category: 'Strategy',
    description: 'Timeline of Key Results; outputs appear only after reaching high confidence',
    source: 'Evidence-Guided',
    howTo: [
      'Define the timeline horizon (e.g., quarterly or yearly) and place Key Results as milestones',
      'Show target metric values at each milestone rather than feature names',
      'Add validated, high-confidence ideas as committed deliverables only after they pass through Steps',
      'Keep low-confidence ideas off the roadmap; reference them in the Idea Bank instead',
      'Share with stakeholders so Sales and Marketing communicate customer needs being addressed rather than promising specific unvalidated features'
    ]
  },

  // ── PPD - Digital Product Management Class (34) ──
  {
    name: 'Product-Market Fit Pyramid',
    category: 'Strategy',
    description: 'Hierarchical model: Target Customer -> Underserved Needs -> Value Proposition',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Positioning Statement',
    category: 'Strategy',
    description: 'Internal statement: core product benefits for target segment vs. competitors',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Business Model Canvas (BMC)',
    category: 'Strategy',
    description: 'Nine components: customers, value prop, channels, revenue, costs, etc.',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Lean Canvas',
    category: 'Strategy',
    description: 'BMC variant for startups: problem, solution, key metrics, unfair advantage',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Kano Model',
    category: 'Strategy',
    description: 'Categorize features: Must-Have, Performance, Delighter',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'RDCL Framework',
    category: 'Strategy',
    description: 'Evaluate strategy: Real Pain, Design, Capabilities, Logistics',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Product Strategy Canvas',
    category: 'Strategy',
    description: 'Strategic planning template mapping vision to execution',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'TAM/SAM/SOM',
    category: 'Strategy',
    description: 'Market sizing: Total Available, Serviceable Available, Share of Market',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Vision Iteration Template',
    category: 'Strategy',
    description: '"Today, when [segment] want to [activity], they have to [current solution]..."',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'RWW Screening',
    category: 'Strategy',
    description: 'Go/no-go: Is it Real? Can we Win? Is it Worth it?',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Idea Classification Matrix',
    category: 'Strategy',
    description: '2x2: novelty vs. usefulness = Invention, Innovation, Improvement, Irrelevant',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Diamond-Square Framework',
    category: 'Strategy',
    description: 'Four pillars: Customer Value Prop, Tech & Ops, Go-to-Market, Profit Formula',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Mission Model Canvas',
    category: 'Strategy',
    description: 'BMC variant for mission-driven/non-profit organizations',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: "Porter's Generic Strategies",
    category: 'Strategy',
    description: '2x2: Scope (broad/narrow) x Advantage (low cost/differentiation)',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Investment Readiness Level (IRL)',
    category: 'Strategy',
    description: '9-level scale from first BMC (IRL 1) to validated metrics (IRL 9)',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Empathy Map',
    category: 'Discovery',
    description: 'Four quadrants: Says, Thinks, Does, Feels for a specific user',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Problem Statement (POV Madlib)',
    category: 'Discovery',
    description: '"[User] needs to [Need] because [Insight]"',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Value Proposition Canvas (VPC)',
    category: 'Discovery',
    description:
      'Customer Profile (Jobs, Pains, Gains) + Value Map (Pain Relievers, Gain Creators)',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Importance vs. Satisfaction Matrix',
    category: 'Discovery',
    description: 'Plot needs by importance vs. satisfaction to find gaps',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Value Proposition Grid',
    category: 'Discovery',
    description:
      'Competitive comparison: must-have, performance, delighter features vs. competitors',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Market Segmentation (4 Types)',
    category: 'Discovery',
    description: 'Demographic (Who), Psychographic (Why), Geographic (Where), Behavioral (How)',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Customer Journey Map (CJM)',
    category: 'Discovery',
    description:
      'Visualize touchpoints, friction, emotions, and moments of truth across the user journey',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Ad-lib Value Proposition Template',
    category: 'Discovery',
    description:
      '"Our [product] helps [segment] who want to [job] by [benefit] and [benefit] unlike [competitor]"',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Unique Selling Proposition (USP)',
    category: 'Strategy',
    description:
      "Venn diagram: overlap of Your Product + Competitor's Product + Customers = your unique sweet spot",
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'BLAC & white',
    category: 'Validation',
    description: 'Problem validation: Blatant, Latent, Aspirational, Critical',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: '4U Framework',
    category: 'Validation',
    description: 'Problem criteria: Unworkable, Unavoidable, Urgent, Underserved',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'SWOT Analysis',
    category: 'Analysis',
    description: 'Internal (Strengths, Weaknesses) + external (Opportunities, Threats)',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'PESTEL Analysis',
    category: 'Analysis',
    description: 'Macro-external: Political, Economic, Social, Technological, Environmental, Legal',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: "Porter's Five Forces",
    category: 'Analysis',
    description:
      'Competitive intensity: rivalry, new entrants, substitutes, supplier power, buyer power',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'VRIO Framework',
    category: 'Analysis',
    description: 'Evaluate resources: Valuable, Rare, Inimitable, Organized to exploit',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: "Ohmae's 3Cs Model",
    category: 'Analysis',
    description: 'Strategic triangle: Customer, Competitors, Corporation',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Vision Fit vs. Sustainability Matrix',
    category: 'Analysis',
    description: '2x2: vision fit (high/low) vs. sustainability (high/low)',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'Stakeholder Map',
    category: 'Process',
    description: 'Identify and position stakeholders by influence and interest',
    source: 'PPD Class',
    howTo: []
  },
  {
    name: 'V2MOM',
    category: 'Process',
    description: 'Alignment: Vision, Values, Methods, Obstacles, Measures',
    source: 'PPD Class',
    howTo: []
  }
];

// ─────────────────────────────────────────────────────────
// METHODOLOGIES (27 total)
// ─────────────────────────────────────────────────────────

export const METHODOLOGIES: Methodology[] = [
  // ── Learn (7) ──
  {
    name: 'Design Thinking',
    phase: 'Learn',
    origin: 'Stanford d.school / IDEO',
    description: 'Empathize -> Define -> Ideate -> Prototype -> Test (non-linear, iterative)',
    relatedArtifacts: ['Empathy Map', 'Personas', 'Problem Statement (POV Madlib)', 'Prototypes']
  },
  {
    name: 'Double Diamond',
    phase: 'Learn',
    origin: 'British Design Council',
    description:
      'Discover (diverge) -> Define (converge) -> Develop (diverge) -> Deliver (converge)',
    relatedArtifacts: ['Problem Statement (POV Madlib)', 'Prototypes']
  },
  {
    name: 'Continuous Discovery',
    phase: 'Learn',
    origin: 'Teresa Torres',
    description: 'Weekly cadence: interview, map opportunities, ideate, test assumptions',
    relatedArtifacts: [
      'Opportunity Solution Tree (OST)',
      'Experience Map',
      'Interview Snapshot',
      'Assumption Map'
    ]
  },
  {
    name: 'The Mom Test',
    phase: 'Learn',
    origin: 'Rob Fitzpatrick',
    description: 'Talk about their life, ask specifics in the past, listen more than talk',
    relatedArtifacts: ['Who-Where Pairs', 'Currencies of Conversation', 'Note Review']
  },
  {
    name: 'Customer Discovery Program',
    phase: 'Learn',
    origin: 'Marty Cagan / Steve Blank',
    description: 'Develop 6 reference customers in a single target market before scaling',
    relatedArtifacts: ['Reference Customers']
  },
  {
    name: 'Jobs to Be Done (JTBD)',
    phase: 'Learn',
    origin: 'Clayton Christensen',
    description: 'Customers "hire" products to complete functional, social, emotional jobs',
    relatedArtifacts: ['Value Proposition Canvas (VPC)']
  },
  {
    name: 'Design Sprint',
    phase: 'Learn',
    origin: 'Jake Knapp (GV)',
    description: '5-day process: Map, Sketch, Decide, Prototype, Test',
    relatedArtifacts: [
      'Map',
      'HMW Notes',
      'Solution Sketch (Four-Step)',
      'Storyboard',
      'Prototype',
      'The Grid'
    ]
  },

  // ── Plan (7) ──
  {
    name: 'Lean Startup',
    phase: 'Plan',
    origin: 'Eric Ries',
    description: 'Build -> Measure -> Learn loop; minimize waste through validated learning',
    relatedArtifacts: ['MVPe', 'Lean Canvas', 'Leading Indicators']
  },
  {
    name: 'Lean Product Process',
    phase: 'Plan',
    origin: 'Dan Olsen',
    description:
      'Determine target customers -> Identify underserved needs -> Define value proposition',
    relatedArtifacts: [
      'Product-Market Fit Pyramid',
      'Importance vs. Satisfaction Matrix',
      'Value Proposition Canvas (VPC)'
    ]
  },
  {
    name: 'GIST',
    phase: 'Plan',
    origin: 'Itamar Gilad',
    description: 'Goals, Ideas, Steps, Tasks - evidence over opinions, confidence over debate',
    relatedArtifacts: ['GIST Board', 'ICE Score', 'Confidence Meter', 'AFTER Model', 'Idea Bank']
  },
  {
    name: 'OKR System',
    phase: 'Plan',
    origin: 'Andy Grove (Intel)',
    description: 'Objectives (qualitative) + Key Results (quantitative), quarterly cadence',
    relatedArtifacts: ['OKR Technique', 'Outcome-Based Key Results']
  },
  {
    name: 'STP',
    phase: 'Plan',
    origin: 'Philip Kotler',
    description: 'Segmentation -> Targeting -> Positioning',
    relatedArtifacts: ['Positioning Statement', 'TAM/SAM/SOM']
  },
  {
    name: 'Blue Ocean Strategy',
    phase: 'Plan',
    origin: 'W. Chan Kim, Renee Mauborgne',
    description: 'Create uncontested market space instead of competing in crowded markets',
    relatedArtifacts: ['Importance vs. Satisfaction Matrix', 'Positioning Statement']
  },
  {
    name: 'Kano Analysis',
    phase: 'Plan',
    origin: 'Noriaki Kano',
    description:
      'Classify features by customer satisfaction response: Must-Have, Performance, Delighter',
    relatedArtifacts: ['Kano Model']
  },

  // ── Build (5) ──
  {
    name: 'Agile',
    phase: 'Build',
    origin: 'Agile Alliance (2001)',
    description: 'Individuals over processes, working software over docs, responding to change',
    relatedArtifacts: ['The 3 Cs', 'Story Map', 'MVPe']
  },
  {
    name: 'Scrum',
    phase: 'Build',
    origin: 'Ken Schwaber, Jeff Sutherland',
    description:
      'Time-boxed sprints, daily standups, sprint planning, sprint review, retrospective',
    relatedArtifacts: ['The 3 Cs', 'Release Slicing', 'The Report Card']
  },
  {
    name: 'Kanban',
    phase: 'Build',
    origin: 'Taiichi Ohno (Toyota)',
    description: 'Visualize work, limit WIP, manage flow, continuous delivery',
    relatedArtifacts: ['GIST Board', 'Story Map']
  },
  {
    name: 'User Story Mapping',
    phase: 'Build',
    origin: 'Jeff Patton',
    description:
      'Map narrative flow left-to-right, decompose top-to-bottom, slice horizontally for releases',
    relatedArtifacts: ['Story Map (USM)', 'MVPe', 'Functional Walking Skeleton', 'Release Slicing']
  },
  {
    name: 'Three Amigos',
    phase: 'Build',
    origin: 'George Dinwiddie',
    description: 'Developer + Tester + PO align on acceptance criteria before building',
    relatedArtifacts: ['The 3 Cs', 'Discovery Triad']
  },

  // ── Evaluate (5) ──
  {
    name: 'SWOT Analysis',
    phase: 'Evaluate',
    origin: 'Albert Humphrey (SRI)',
    description: 'Evaluate internal strengths/weaknesses + external opportunities/threats',
    relatedArtifacts: ['SWOT Analysis']
  },
  {
    name: "Porter's Five Forces",
    phase: 'Evaluate',
    origin: 'Michael Porter',
    description:
      'Assess competitive intensity: rivalry, new entrants, substitutes, supplier/buyer power',
    relatedArtifacts: ["Porter's Five Forces"]
  },
  {
    name: 'PESTEL Analysis',
    phase: 'Evaluate',
    origin: 'Francis Aguilar',
    description:
      'Scan macro-environment: Political, Economic, Social, Technological, Environmental, Legal',
    relatedArtifacts: ['PESTEL Analysis']
  },
  {
    name: 'Problem Solving (Watanabe)',
    phase: 'Evaluate',
    origin: 'Ken Watanabe',
    description: 'Understand -> Identify root cause -> Develop action plan -> Execute & modify',
    relatedArtifacts: ['Logic Tree', 'Yes/No Tree', 'Hypothesis Pyramid']
  },
  {
    name: 'AFTER Validation',
    phase: 'Evaluate',
    origin: 'Itamar Gilad',
    description:
      'Five stages of increasing rigor: Assessment, Fact-Finding, Tests, Experiments, Release',
    relatedArtifacts: ['Confidence Meter', 'ICE Score']
  },

  // ── Align (3) ──
  {
    name: 'V2MOM',
    phase: 'Align',
    origin: 'Marc Benioff (Salesforce)',
    description: 'Vision, Values, Methods, Obstacles, Measures - cascaded across org',
    relatedArtifacts: ['V2MOM']
  },
  {
    name: 'Product Evangelism',
    phase: 'Align',
    origin: 'Marty Cagan',
    description: 'Sell the dream: use prototypes, share customer pain, share credit generously',
    relatedArtifacts: ['Product Vision', 'Business Context']
  },
  {
    name: 'Servant Leadership',
    phase: 'Align',
    origin: 'Robert Greenleaf',
    description: 'Lead by serving the team: remove obstacles, provide context, trust autonomy',
    relatedArtifacts: ['Stakeholder Map']
  }
];

// ── Figure mappings (from academic BOOKS catalog) ──

const ARTIFACT_FIGURES: Record<string, string> = {
  'AFTER Model': '/assets/pm-figures/evidence_guided/evidence_guided_p92.png',
  'Ad-lib Value Proposition Template': '/assets/pm-figures/ppd/ppd_w04_p25.png',
  'Assumption Map': '/assets/pm-figures/cdh/cdh_p131.png',
  'Business Model Canvas (BMC)': '/assets/pm-figures/ppd/ppd_w05_p7.png',
  'Confidence Meter': '/assets/pm-figures/evidence_guided/evidence_guided_p25.png',
  'Continuous Interviewing Cadence': '/assets/pm-figures/cdh/cdh_p17.png',
  'Customer Journey Map (Boosters/Blockers)': '/assets/pm-figures/ooo/ooo_p31.png',
  'Customer Journey Map (CJM)': '/assets/pm-figures/ppd/ppd_w03_p50.png',
  'Diamond-Square Framework': '/assets/pm-figures/ppd/ppd_w05_p5.png',
  'Discovery Triad': '/assets/pm-figures/usm/usm_p200.png',
  'Empathy Map': '/assets/pm-figures/ppd/ppd_w03_p46.png',
  'Experience Map': '/assets/pm-figures/cdh/cdh_p55.png',
  'Five-Act Interview': '/assets/pm-figures/sprint/sprint_p206.png',
  'Functional Walking Skeleton': '/assets/pm-figures/usm/usm_p56.png',
  'GIST Board': '/assets/pm-figures/evidence_guided/evidence_guided_p106.png',
  'HMW Notes': '/assets/pm-figures/sprint/sprint_p80.png',
  'ICE Score': '/assets/pm-figures/evidence_guided/evidence_guided_p89.png',
  'Idea Bank': '/assets/pm-figures/evidence_guided/evidence_guided_p57.png',
  'Idea Classification Matrix': '/assets/pm-figures/ppd/ppd_w02_p6.png',
  'Importance vs. Satisfaction Matrix': '/assets/pm-figures/ppd/ppd_w05_p3.png',
  'Interview Snapshot': '/assets/pm-figures/cdh/cdh_p69.png',
  'Investment Readiness Level (IRL)': '/assets/pm-figures/ppd/ppd_w05_p24.png',
  'Kano Model': '/assets/pm-figures/ppd/ppd_w06s_p14.png',
  'Lean Canvas': '/assets/pm-figures/ppd/ppd_w05_p8.png',
  'Lightning Demos': '/assets/pm-figures/sprint/sprint_p103.png',
  'Long-term Goal + Sprint Questions': '/assets/pm-figures/sprint/sprint_p94.png',
  MVPe: '/assets/pm-figures/usm/usm_p89.png',
  Map: '/assets/pm-figures/sprint/sprint_p91.png',
  'Market Segmentation (4 Types)': '/assets/pm-figures/ppd/ppd_w02_p12.png',
  'Metrics Trees': '/assets/pm-figures/evidence_guided/evidence_guided_p42.png',
  'Mission Model Canvas': '/assets/pm-figures/ppd/ppd_w05_p9.png',
  'North Star Metric': '/assets/pm-figures/evidence_guided/evidence_guided_p39.png',
  'Opportunity Assessment': '/assets/pm-figures/cdh/cdh_p99.png',
  'Opportunity Canvas': '/assets/pm-figures/usm/usm_p212_0.png',
  'Opportunity Solution Tree (OST)': '/assets/pm-figures/cdh/cdh_p26.png',
  'Outcome Roadmap': '/assets/pm-figures/evidence_guided/evidence_guided_p137.png',
  'PESTEL Analysis': '/assets/pm-figures/ppd/ppd_w05_p16.png',
  Personas: '/assets/pm-figures/usm/usm_p226.png',
  "Porter's Five Forces": '/assets/pm-figures/ppd/ppd_w05_p14.png',
  "Porter's Generic Strategies": '/assets/pm-figures/ppd/ppd_w05_p17.png',
  'Positioning Statement': '/assets/pm-figures/ppd/ppd_w04_p6.png',
  'Problem Statement (POV Madlib)': '/assets/pm-figures/ppd/ppd_w03_p63.png',
  'Product Strategy Canvas': '/assets/pm-figures/ppd/ppd_w06s_p30.png',
  'Product-Market Fit Pyramid': '/assets/pm-figures/ppd/ppd_w02_p4.png',
  'Program Logic Model': '/assets/pm-figures/ooo/ooo_p10.png',
  Prototype: '/assets/pm-figures/sprint/sprint_p173.png',
  'RWW Screening': '/assets/pm-figures/ppd/ppd_w05_p20.png',
  'Release Slicing': '/assets/pm-figures/usm/usm_p98.png',
  'SWOT Analysis': '/assets/pm-figures/ppd/ppd_w05_p13.png',
  'Solution Sketch (Four-Step)': '/assets/pm-figures/sprint/sprint_p115.png',
  'Sprint Challenge': '/assets/pm-figures/sprint/sprint_p3.png',
  'Stakeholder Map': '/assets/pm-figures/ppd/ppd_w06a_p13_0.png',
  'Step Document': '/assets/pm-figures/evidence_guided/evidence_guided_p112.png',
  'Story Map (Solution-Level)': '/assets/pm-figures/cdh/cdh_p124.png',
  'Story Map': '/assets/pm-figures/usm/usm_p19.png',
  Storyboard: '/assets/pm-figures/sprint/sprint_p159.png',
  'TAM/SAM/SOM': '/assets/pm-figures/ppd/ppd_w05_p19.png',
  'The 3 Cs': '/assets/pm-figures/usm/usm_p135.png',
  'The Grid': '/assets/pm-figures/sprint/sprint_p224.png',
  'The Report Card': '/assets/pm-figures/usm/usm_p299.png',
  'Three Amigos': '/assets/pm-figures/usm/usm_p203.png',
  'Unique Selling Proposition (USP)': '/assets/pm-figures/ppd/ppd_w04_p7.png',
  V2MOM: '/assets/pm-figures/ppd/ppd_w06a_p21.png',
  'VRIO Framework': '/assets/pm-figures/ppd/ppd_w05_p11.png',
  'Value Proposition Canvas (VPC)': '/assets/pm-figures/ppd/ppd_w04_p22.png',
  'Value Proposition Grid': '/assets/pm-figures/ppd/ppd_w06s_p17.png',
  'Vision Fit vs. Sustainability Matrix': '/assets/pm-figures/ppd/ppd_w06s_p39.png',
  'Vision Iteration Template': '/assets/pm-figures/ppd/ppd_w06v_p16.png'
};

const METHODOLOGY_FIGURES: Record<string, string> = {
  'AFTER Validation': '/assets/pm-figures/evidence_guided/evidence_guided_p92.png',
  Agile: '/assets/pm-figures/ppd/ppd_w07_p8.png',
  'Continuous Discovery': '/assets/pm-figures/cdh/cdh_p26.png',
  'Design Sprint': '/assets/pm-figures/sprint/sprint_p3.png',
  'Design Thinking': '/assets/pm-figures/ppd/ppd_w03_p32.png',
  'Double Diamond': '/assets/pm-figures/ppd/ppd_w03_p26.png',
  GIST: '/assets/pm-figures/evidence_guided/evidence_guided_p19.png',
  'Kano Analysis': '/assets/pm-figures/ppd/ppd_w06s_p14.png',
  'Lean Product Process': '/assets/pm-figures/ppd/ppd_w06v_p4.png',
  'Lean Startup': '/assets/pm-figures/ppd/ppd_w07_p22.png',
  'OKR System': '/assets/pm-figures/ppd/ppd_w06a_p27.png',
  'PESTEL Analysis': '/assets/pm-figures/ppd/ppd_w05_p16.png',
  "Porter's Five Forces": '/assets/pm-figures/ppd/ppd_w05_p14.png',
  'SWOT Analysis': '/assets/pm-figures/ppd/ppd_w05_p13.png',
  'Three Amigos': '/assets/pm-figures/usm/usm_p203.png',
  'User Story Mapping': '/assets/pm-figures/usm/usm_p19.png',
  V2MOM: '/assets/pm-figures/ppd/ppd_w06a_p21.png'
};

// Apply figures to artifacts and methodologies
for (const a of ARTIFACTS) {
  if (!a.figure && ARTIFACT_FIGURES[a.name]) a.figure = ARTIFACT_FIGURES[a.name];
}
for (const m of METHODOLOGIES) {
  if (!m.figure && METHODOLOGY_FIGURES[m.name]) m.figure = METHODOLOGY_FIGURES[m.name];
}
