type RoadmapEntry = { id: string; title: string };

type RoadmapProgress = { label: string; completed: number; total: number };
type RoadmapSchedule = { start: string; end: string };

export type RoadmapCard = RoadmapEntry & {
  description?: string;
  quarter?: string;
  endQuarter?: string;
  schedule?: RoadmapSchedule;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
  goal?: string;
  goalEmoji?: string;
  progress?: RoadmapProgress;
};

type RoadmapPhase = RoadmapEntry & { cards: RoadmapCard[] };

type Roadmap = { phases: RoadmapPhase[]; closed?: RoadmapCard[] };
export type RoadmapView = 'horizons' | 'quarters' | 'timeline';

const priorityOrder = { high: 0, medium: 1, low: 2, unassigned: 3 };
const quarterEndDates = ['03-31', '06-30', '09-30', '12-31'];

const monthFormat = new Intl.DateTimeFormat('en', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isLabel(value: unknown): value is string {
  return typeof value === 'string' && Boolean(value.trim());
}

function isEntry(value: unknown): value is RoadmapEntry {
  return isRecord(value) && isLabel(value.id) && isLabel(value.title);
}

function isProgress(value: unknown): value is RoadmapProgress {
  if (!isRecord(value) || !isLabel(value.label)) return false;

  const { completed, total } = value;
  return (
    typeof completed === 'number' &&
    Number.isSafeInteger(completed) &&
    completed >= 0 &&
    typeof total === 'number' &&
    Number.isSafeInteger(total) &&
    total > 0 &&
    completed <= total
  );
}

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isSchedule(value: unknown): value is RoadmapSchedule {
  return isRecord(value) && isDate(value.start) && isDate(value.end) && value.start <= value.end;
}

function isQuarter(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-Q[1-4]$/.test(value);
}

function isCard(value: unknown): value is RoadmapCard {
  if (!isRecord(value)) return false;
  const {
    description,
    quarter,
    endQuarter,
    schedule,
    status,
    priority,
    goal,
    goalEmoji,
    progress
  } = value;
  return (
    isEntry(value) &&
    (description === undefined || typeof description === 'string') &&
    (quarter === undefined || isQuarter(quarter)) &&
    (endQuarter === undefined ||
      (isQuarter(quarter) && isQuarter(endQuarter) && quarter <= endQuarter)) &&
    (schedule === undefined || isSchedule(schedule)) &&
    (status === undefined || isLabel(status)) &&
    (priority === undefined ||
      priority === 'high' ||
      priority === 'medium' ||
      priority === 'low') &&
    (goal === undefined || isLabel(goal)) &&
    (goalEmoji === undefined || isLabel(goalEmoji)) &&
    (progress === undefined || isProgress(progress))
  );
}

function comparePriority(first: RoadmapCard, second: RoadmapCard) {
  return (
    priorityOrder[first.priority ?? 'unassigned'] - priorityOrder[second.priority ?? 'unassigned']
  );
}

function targetDate(card: RoadmapCard) {
  if (card.schedule) return card.schedule.end;

  const quarter = card.endQuarter ?? card.quarter;
  if (!quarter) return undefined;

  const year = quarter.slice(0, 4);
  const monthAndDay = quarterEndDates[Number(quarter.at(-1)) - 1];
  return `${year}-${monthAndDay}`;
}

function compareTargets(first: RoadmapCard, second: RoadmapCard) {
  const firstTarget = targetDate(first);
  const secondTarget = targetDate(second);
  if (!firstTarget || !secondTarget) return Number(!firstTarget) - Number(!secondTarget);
  return firstTarget.localeCompare(secondTarget);
}

export function sortRoadmapCards(cards: RoadmapCard[]) {
  return [...cards].sort(
    (first, second) => comparePriority(first, second) || compareTargets(first, second)
  );
}

export function groupRoadmapByQuarter(phases: RoadmapPhase[]): RoadmapPhase[] {
  const byQuarter = new Map<string, RoadmapCard[]>();
  const unscheduled: RoadmapCard[] = [];

  for (const phase of phases) {
    for (const card of phase.cards) {
      if (!card.quarter) {
        unscheduled.push(card);
        continue;
      }

      const cards = byQuarter.get(card.quarter);
      if (cards) cards.push(card);
      else byQuarter.set(card.quarter, [card]);
    }
  }

  const quarters = [...byQuarter]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, cards]) => {
      const [year, period] = quarter.split('-');
      return {
        id: `quarter-${quarter}`,
        title: `${period} ${year}`,
        cards: sortRoadmapCards(cards)
      };
    });
  if (unscheduled.length)
    quarters.push({
      id: 'quarter-unscheduled',
      title: 'Unscheduled',
      cards: sortRoadmapCards(unscheduled)
    });
  return quarters;
}

function monthNumber(date: string) {
  return Number(date.slice(0, 4)) * 12 + Number(date.slice(5, 7)) - 1;
}

function quarterStartMonth(quarter: string) {
  return Number(quarter.slice(0, 4)) * 12 + (Number(quarter.at(-1)) - 1) * 3;
}

function timelineRange(card: RoadmapCard) {
  if (card.schedule) {
    return {
      start: monthNumber(card.schedule.start),
      end: monthNumber(card.schedule.end),
      startDay: Number(card.schedule.start.slice(8, 10))
    };
  }
  if (!card.quarter) return null;
  return {
    start: quarterStartMonth(card.quarter),
    end: quarterStartMonth(card.endQuarter ?? card.quarter) + 2,
    startDay: 1
  };
}

export function buildRoadmapTimeline(phases: RoadmapPhase[]) {
  const scheduled = [];
  const unscheduled: RoadmapCard[] = [];
  let first = Infinity;
  let last = -Infinity;

  for (const phase of phases) {
    for (const card of phase.cards) {
      const range = timelineRange(card);
      if (!range) {
        unscheduled.push(card);
        continue;
      }
      first = Math.min(first, range.start);
      last = Math.max(last, range.end);
      scheduled.push({ card, ...range });
    }
  }

  const months = scheduled.length
    ? Array.from({ length: last - first + 1 }, (_, offset) => {
        const month = first + offset;
        const date = new Date(0);
        date.setUTCFullYear(Math.floor(month / 12), month % 12, 1);
        return monthFormat.format(date);
      })
    : [];

  const firstYear = Math.floor(first / 12);
  const years = scheduled.length
    ? Array.from({ length: Math.floor(last / 12) - firstYear + 1 }, (_, offset) => {
        const year = firstYear + offset;
        return {
          year,
          startColumn: Math.max(year * 12, first) - first + 1,
          endColumn: Math.min((year + 1) * 12, last + 1) - first + 1
        };
      })
    : [];

  const cards = scheduled
    .sort((a, b) => a.start - b.start || a.startDay - b.startDay || comparePriority(a.card, b.card))
    .map(({ card, start, end }) => ({
      card,
      startColumn: start - first + 1,
      endColumn: end - first + 2
    }));

  return { years, months, cards, unscheduled: sortRoadmapCards(unscheduled) };
}

export function formatRoadmapQuarter(quarter: string, endQuarter = quarter): string {
  const [startYear, startPeriod] = quarter.split('-');
  if (quarter === endQuarter) return `${startPeriod} ${startYear}`;

  const [endYear, endPeriod] = endQuarter.split('-');
  return startYear === endYear
    ? `${startPeriod}–${endPeriod} ${startYear}`
    : `${startPeriod} ${startYear} – ${endPeriod} ${endYear}`;
}

function isPhase(value: unknown): value is RoadmapPhase {
  return (
    isRecord(value) && Array.isArray(value.cards) && value.cards.every(isCard) && isEntry(value)
  );
}

export function parseRoadmap(source: string | undefined): Roadmap | null {
  if (!source) return null;
  try {
    const value: unknown = JSON.parse(source);
    if (
      !isRecord(value) ||
      !Array.isArray(value.phases) ||
      !value.phases.length ||
      !value.phases.every(isPhase) ||
      (value.closed !== undefined && (!Array.isArray(value.closed) || !value.closed.every(isCard)))
    )
      return null;

    const ids = value.phases.flatMap((phase) => [phase.id, ...phase.cards.map((card) => card.id)]);
    const closed = value.closed;
    if (closed) ids.push(...closed.map((card) => card.id));
    if (new Set(ids).size !== ids.length) return null;

    return closed ? { phases: value.phases, closed } : { phases: value.phases };
  } catch {
    return null;
  }
}
