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
  gains?: string[];
  details?: string[];
  checkedAcs?: StoryCheckedAC[];
  assumptions?: Assumption[];
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

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  status: string;
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
