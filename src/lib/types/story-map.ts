export interface Actor {
  emoji: string;
  label: string;
}

export interface Task {
  id: string;
  title: string;
}

export interface Activity {
  id: string;
  title: string;
  actors?: string[];
  tasks?: Task[];
}

export interface StoryCheckedAC {
  index: number;
  checkedAt: string;
}

export interface Assumption {
  id: string;
  type: 'desirability' | 'feasibility' | 'usability' | 'viability';
  assumption: string;
  rationale: string;
  testMethod: string;
  successCriteria: string;
  actualResults: string;
  status: 'untested' | 'validated' | 'revalidate' | 'invalidated';
  lastTested: string | null;
}

/** Percentages of the original image, independent of display size. */
export interface StoryPrototypeRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoryPrototypeImage {
  id: string;
  src: string;
  caption: string;
  alt: string;
  width?: number;
  height?: number;
  sourcePath?: string;
  /** Visible record or reference scope; different examples are displayed separately. */
  example?: string;
  crop?: StoryPrototypeRegion;
  highlights?: (StoryPrototypeRegion & { label: string; step?: number })[];
}

export interface StoryFieldNote {
  name: string;
  explain?: boolean;
  meaning?: string;
  needed?: string;
  values?: { label: string; meaning?: string }[];
  example?: string;
}

export interface Story {
  id: string;
  title: string;
  activity: string;
  task?: string;
  pic: string;
  picColor: string;
  done: boolean;
  asA?: string;
  wantTo?: string;
  soThat?: string;
  pains?: string[];
  hasPainPoint?: boolean;
  gains?: string[];
  details?: string[];
  checkedAcs?: StoryCheckedAC[];
  assumptions?: Assumption[];
  prototypeImages?: StoryPrototypeImage[];
  fieldNotes?: StoryFieldNote[];
}

export interface StoryMapData {
  product: string;
  actors: Actor[];
  levels?: number;
  activities: Activity[];
  stories: {
    'must-have': Story[];
    performance: Story[];
    delighter: Story[];
  };
}

export interface DataFile {
  id: string;
  label: string;
}

// ── Idea Bank ──

export type IdeaCategory = 'learning' | 'catalog' | 'community' | 'growth' | 'monetization';

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  status: string;
  category?: IdeaCategory;
  proposer: string;
  okrCode: string;
  createdAt: string;
}

// ── Backlog ──

export interface CheckedAC {
  index: number;
  checkedAt: string;
}

export interface BacklogStory {
  id: string;
  title: string;
  epic: string;
  task: string | null;
  taskOrder: number;
  kano: string;
  pic: string;
  picColor: string;
  done: boolean;
  acceptanceCriteria: string[];
  checkedAcs: CheckedAC[];
  assumptions: Assumption[];
}

export interface BacklogEpic {
  code: string;
  title: string;
  actors: string[];
  stories: BacklogStory[];
}

// ── Assumption Test ──

export interface StaticAssumption {
  id: string;
  label?: string;
  storyId?: string;
  storyTitle?: string;
  epicCode?: string;
  type: 'desirability' | 'feasibility' | 'usability' | 'viability';
  assumption: string;
  rationale: string;
  testMethod: string;
  successCriteria: string;
  actualResults: string;
  status: 'untested' | 'validated' | 'revalidate' | 'invalidated';
  lastTested: string | null;
  importance: number;
  evidence: number;
}

// ── Kanban Board ──

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  assignee: string;
  blockReason?: string;
  blockedBy?: string;
  dueDate: string;
  storyPoints: number | null;
  priority: 'none' | 'low' | 'medium' | 'high' | 'critical';
  type: 'task' | 'bug' | 'feature' | 'improvement';
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  wipLimit: number | null;
  cards: KanbanCard[];
}
