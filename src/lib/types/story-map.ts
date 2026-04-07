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
