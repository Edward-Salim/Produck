export type FormFieldDef = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'array';
  options?: string[];
};

export const KEY_LABELS: Record<string, string> = {
  project: 'Project',
  outcomes: 'Outcomes',
  objectives: 'Objectives',
  keyResults: 'Key Results',
  interviews: 'Interviews',
  experiencePhases: 'Phases',
  experienceSteps: 'Steps',
  experienceTouchpoints: 'Touchpoints',
  ideas: 'Ideas',
  actors: 'Actors',
  activities: 'Activities',
  tasks: 'Tasks',
  stories: 'Stories',
  personas: 'Personas'
};

export const SECTIONS = [
  { key: 'all', label: 'All Data', subs: [] as string[] },
  { key: 'project', label: 'Project Info', subs: ['project'] },
  { key: 'outcomes', label: 'Outcomes', subs: ['outcomes', 'objectives', 'keyResults'] },
  { key: 'interviews', label: 'Interviews', subs: ['interviews'] },
  {
    key: 'experience',
    label: 'Experience Map',
    subs: ['experiencePhases', 'experienceSteps', 'experienceTouchpoints']
  },
  {
    key: 'ideas-storymap',
    label: 'Idea Bank & Story Map',
    subs: ['ideas', 'actors', 'activities', 'tasks', 'stories']
  },
  { key: 'personas', label: 'Personas', subs: ['personas'] }
] as const;

export type Section = (typeof SECTIONS)[number];

export function getNewRecordTemplate(
  key: string,
  id: number,
  projectId?: number
): Record<string, any> {
  const base: Record<string, any> = { id };
  switch (key) {
    case 'ideas':
      return { ...base, title: '', description: '', status: 'triage', proposer: '', okrCode: '' };
    case 'actors':
      return { ...base, ideaId: 0, emoji: '', label: '', sortOrder: 0 };
    case 'activities':
      return { ...base, ideaId: 0, code: '', title: '', actorEmojis: [], sortOrder: 0 };
    case 'tasks':
      return { ...base, activityId: 0, code: '', title: '', sortOrder: 0 };
    case 'stories':
      return {
        ...base,
        activityId: 0,
        taskId: null,
        code: '',
        title: '',
        pic: '',
        picColor: '',
        done: false,
        kano: 'performance',
        asA: '',
        wantTo: '',
        soThat: '',
        pains: [],
        gains: [],
        details: [],
        checkedAcs: [],
        assumptions: [],
        sortOrder: 0
      };
    case 'experiencePhases':
      return { ...base, projectId, title: '', actorEmojis: [], sortOrder: 0 };
    case 'experienceSteps':
      return { ...base, phaseId: 0, title: '', sortOrder: 0 };
    case 'experienceTouchpoints':
      return {
        ...base,
        stepId: 0,
        title: '',
        asA: '',
        wantTo: '',
        soThat: '',
        pains: [],
        gains: [],
        pic: '',
        picColor: '',
        sortOrder: 0
      };
    case 'outcomes':
      return {
        ...base,
        projectId,
        year: new Date().getFullYear(),
        code: '',
        title: '',
        description: '',
        metrics: []
      };
    case 'objectives':
      return {
        ...base,
        projectId,
        year: new Date().getFullYear(),
        quarter: Math.ceil((new Date().getMonth() + 1) / 3),
        code: '',
        title: '',
        sortOrder: 0
      };
    case 'keyResults':
      return {
        ...base,
        objectiveId: 0,
        code: '',
        description: '',
        target: '',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        lastUpdated: new Date().toISOString().slice(0, 10)
      };
    case 'interviews':
      return {
        ...base,
        projectId,
        personName: '',
        personRole: '',
        interviewDate: new Date().toISOString().slice(0, 10),
        quote: '',
        quickFacts: [],
        insights: [],
        opportunities: [],
        transcript: ''
      };
    case 'personas':
      return {
        ...base,
        projectId,
        name: '',
        role: '',
        goals: [],
        challenges: [],
        motivators: [],
        sortOrder: 0
      };
    default:
      return base;
  }
}

export const FORM_FIELDS: Record<string, FormFieldDef[]> = {
  project: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'shortName', label: 'Short Name', type: 'text' },
    { key: 'levels', label: 'Levels', type: 'number' }
  ],
  ideas: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: ['triage', 'candidate', 'working-set', 'released', 'parked']
    },
    { key: 'proposer', label: 'Proposer', type: 'text' },
    { key: 'okrCode', label: 'OKR Code', type: 'text' }
  ],
  actors: [
    { key: 'emoji', label: 'Emoji', type: 'text' },
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'sortOrder', label: 'Order', type: 'number' }
  ],
  activities: [
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'sortOrder', label: 'Order', type: 'number' }
  ],
  tasks: [
    { key: 'activityId', label: 'Activity ID', type: 'number' },
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'sortOrder', label: 'Order', type: 'number' }
  ],
  stories: [
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    {
      key: 'kano',
      label: 'Kano',
      type: 'select',
      options: ['must-have', 'performance', 'delighter']
    },
    { key: 'pic', label: 'PIC', type: 'text' },
    { key: 'done', label: 'Done', type: 'boolean' },
    { key: 'asA', label: 'As a...', type: 'text' },
    { key: 'wantTo', label: 'I want to...', type: 'text' },
    { key: 'soThat', label: 'So that...', type: 'text' },
    { key: 'pains', label: 'Pains', type: 'array' },
    { key: 'gains', label: 'Gains', type: 'array' },
    { key: 'details', label: 'Acceptance Criteria', type: 'array' }
  ],
  experiencePhases: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'sortOrder', label: 'Order', type: 'number' }
  ],
  experienceSteps: [
    { key: 'phaseId', label: 'Phase ID', type: 'number' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'sortOrder', label: 'Order', type: 'number' }
  ],
  experienceTouchpoints: [
    { key: 'stepId', label: 'Step ID', type: 'number' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'asA', label: 'As a...', type: 'text' },
    { key: 'wantTo', label: 'I want to...', type: 'text' },
    { key: 'soThat', label: 'So that...', type: 'text' },
    { key: 'pains', label: 'Pains', type: 'array' },
    { key: 'gains', label: 'Gains', type: 'array' },
    { key: 'kpi', label: 'KPI (Outcome Code)', type: 'text' }
  ],
  outcomes: [
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'metrics', label: 'Metrics', type: 'array' }
  ],
  objectives: [
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'quarter', label: 'Quarter', type: 'number' },
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'sortOrder', label: 'Order', type: 'number' }
  ],
  keyResults: [
    { key: 'objectiveId', label: 'Objective ID', type: 'number' },
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'target', label: 'Target', type: 'text' },
    { key: 'targetValue', label: 'Target Value', type: 'number' },
    { key: 'currentValue', label: 'Current Value', type: 'number' },
    { key: 'unit', label: 'Unit', type: 'text' }
  ],
  interviews: [
    { key: 'personName', label: 'Name', type: 'text' },
    { key: 'personRole', label: 'Role', type: 'text' },
    { key: 'interviewDate', label: 'Date', type: 'text' },
    { key: 'quote', label: 'Quote', type: 'textarea' },
    { key: 'quickFacts', label: 'Quick Facts', type: 'array' },
    { key: 'insights', label: 'Insights', type: 'array' },
    { key: 'opportunities', label: 'Opportunities', type: 'array' },
    { key: 'transcript', label: 'Transcript', type: 'textarea' }
  ],
  personas: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'quote', label: 'Quote', type: 'textarea' },
    { key: 'biography', label: 'Biography', type: 'textarea' },
    { key: 'goals', label: 'Goals', type: 'array' },
    { key: 'challenges', label: 'Challenges', type: 'array' },
    { key: 'motivators', label: 'Motivators', type: 'array' }
  ]
};
