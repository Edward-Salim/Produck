<script lang="ts">
  import {
    Activity as ActivityIcon,
    Archive,
    AudioLines,
    Bath,
    BadgeCheck,
    Bike,
    BicepsFlexed,
    BookOpen,
    Bookmark,
    Briefcase,
    BriefcaseBusiness,
    Brain,
    Brush,
    Camera,
    Car,
    CarFront,
    Captions,
    ChevronDown,
    ClockCheck,
    Coffee,
    CookingPot,
    Dice5,
    Disc3,
    Drum,
    Dumbbell,
    Eye,
    Feather,
    FileImage,
    FileVideoCamera,
    Film,
    Flower2,
    FolderOpen,
    Footprints,
    Gamepad,
    Gamepad2,
    Gauge,
    GlassWater,
    Hammer,
    Hand,
    HandHeart,
    HandFist,
    HardDrive,
    HeartHandshake,
    HeartPulse,
    Headphones,
    Home,
    Image,
    Languages,
    Leaf,
    MailCheck,
    MessageCircleCheck,
    MessageCircle,
    MicVocal,
    Monitor,
    Moon,
    Mountain,
    Music,
    Newspaper,
    NotebookPen,
    NotebookText,
    Origami,
    Palette,
    PenLine,
    PersonStanding,
    Pill,
    Puzzle,
    Quote,
    Radio,
    Receipt,
    Repeat,
    Route,
    Send,
    Shirt,
    ShoppingBasket,
    Shuffle,
    Smile,
    Soup,
    Sparkles,
    Sprout,
    Stethoscope,
    Sun,
    Target,
    Timer,
    Trash,
    Utensils,
    Users,
    Waves,
    Wind,
    X,
    Zap
  } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';

  type Activity = {
    id: number;
    name: string;
    detail: string;
    icon: string;
    level: number;
    category: string;
  };

  type ActivityPick = {
    date: string;
    activityIds: number[];
  };

  type ActivityPickStore = {
    picks: ActivityPick[];
  };

  let { data } = $props();

  const iconMap = {
    activity: ActivityIcon,
    archive: Archive,
    'audio-lines': AudioLines,
    'badge-check': BadgeCheck,
    bath: Bath,
    bike: Bike,
    'biceps-flexed': BicepsFlexed,
    'book-open': BookOpen,
    bookmark: Bookmark,
    briefcase: Briefcase,
    'briefcase-business': BriefcaseBusiness,
    brain: Brain,
    brush: Brush,
    camera: Camera,
    car: Car,
    'car-front': CarFront,
    captions: Captions,
    'clock-check': ClockCheck,
    coffee: Coffee,
    'cooking-pot': CookingPot,
    'dice-5': Dice5,
    'disc-3': Disc3,
    drum: Drum,
    dumbbell: Dumbbell,
    eye: Eye,
    feather: Feather,
    'file-image': FileImage,
    'file-video-camera': FileVideoCamera,
    film: Film,
    'flower-2': Flower2,
    'folder-open': FolderOpen,
    footprints: Footprints,
    gamepad: Gamepad,
    'gamepad-2': Gamepad2,
    gauge: Gauge,
    'glass-water': GlassWater,
    hammer: Hammer,
    hand: Hand,
    'hand-heart': HandHeart,
    'hand-fist': HandFist,
    'hard-drive': HardDrive,
    'heart-handshake': HeartHandshake,
    'heart-pulse': HeartPulse,
    headphones: Headphones,
    home: Home,
    image: Image,
    languages: Languages,
    leaf: Leaf,
    'mail-check': MailCheck,
    'message-check': MessageCircleCheck,
    'message-circle': MessageCircle,
    'mic-vocal': MicVocal,
    monitor: Monitor,
    moon: Moon,
    mountain: Mountain,
    music: Music,
    newspaper: Newspaper,
    'notebook-pen': NotebookPen,
    'notebook-text': NotebookText,
    origami: Origami,
    palette: Palette,
    'pen-line': PenLine,
    'person-standing': PersonStanding,
    pill: Pill,
    puzzle: Puzzle,
    quote: Quote,
    radio: Radio,
    receipt: Receipt,
    repeat: Repeat,
    route: Route,
    send: Send,
    shirt: Shirt,
    'shopping-basket': ShoppingBasket,
    smile: Smile,
    soup: Soup,
    sparkles: Sparkles,
    sprout: Sprout,
    stethoscope: Stethoscope,
    sun: Sun,
    target: Target,
    timer: Timer,
    trash: Trash,
    utensils: Utensils,
    users: Users,
    waves: Waves,
    wind: Wind,
    zap: Zap
  };

  const fallbackIcon = Sparkles;
  const levels = [1, 2, 3];
  const stageLabels: Record<number, string> = {
    1: 'New',
    2: 'Familiar',
    3: 'Established'
  };
  const pickRoles = [
    { label: 'Anchor', targetLevel: 3 },
    { label: 'Practice', targetLevel: 2 },
    { label: 'Explore', targetLevel: 1 }
  ];
  const dayCopy = [
    'Give Sunday some shape with one familiar, one steady, one fresh',
    'Start Monday with one familiar, one steady, one fresh',
    'Build Tuesday momentum with one familiar, one steady, one fresh',
    'Find Wednesday balance with one familiar, one steady, one fresh',
    'Keep Thursday moving with one familiar, one steady, one fresh',
    'Close Friday well with one familiar, one steady, one fresh',
    'Make Saturday feel open with one familiar, one steady, one fresh'
  ];
  const todayCopy = dayCopy[new Date().getDay()] ?? 'Today mix of familiar, steady, fresh';
  const weekdayCategoryWeights: Record<string, number> = {
    Career: 0.35,
    Learning: 0.3,
    'Life Admin': 0.25,
    Movement: 0.1,
    Health: 0.1,
    Recovery: -0.05,
    Creative: -0.05,
    Social: -0.15,
    Adventure: -0.25
  };
  const weekendCategoryWeights: Record<string, number> = {
    Adventure: 0.35,
    Social: 0.3,
    Creative: 0.25,
    Recovery: 0.2,
    Movement: 0.15,
    Health: 0.05,
    Learning: -0.05,
    'Life Admin': -0.1,
    Career: -0.25
  };
  const activityGroups = $derived(data.activityGroups);
  const activities = $derived(
    activityGroups.flatMap((group) =>
      group.activities.map((activity) => ({ ...activity, category: group.category }))
    )
  );
  const todayPickStorageKey = 'activity-picker:today';
  const pickHistoryLimit = 30;

  let selectedActivities = $state<Activity[]>([]);
  let detailActivity = $state<Activity | null>(null);
  let stageOverrides = $state<Record<number, number>>({});
  let openLevelActivityId = $state<number | null>(null);
  let openCategories = $state<string[]>([]);

  function levelTextClass(level: number) {
    const tones: Record<number, string> = {
      1: 'text-orange-700',
      2: 'text-slate-500',
      3: 'text-yellow-700'
    };

    return tones[level] ?? tones[1];
  }

  function stageLabel(level: number) {
    return stageLabels[level] ?? stageLabels[1];
  }

  function activityStage(activity: Pick<Activity, 'id' | 'level'>) {
    return stageOverrides[activity.id] ?? activity.level;
  }

  function setActivityStage(activityId: number, level: number) {
    stageOverrides = { ...stageOverrides, [activityId]: level };
    if (detailActivity?.id === activityId) {
      detailActivity = { ...detailActivity, level };
    }
  }

  async function updateActivityStage(activityId: number, level: number) {
    const previousLevel =
      stageOverrides[activityId] ??
      activities.find((activity) => activity.id === activityId)?.level ??
      detailActivity?.level;
    setActivityStage(activityId, level);
    openLevelActivityId = null;

    const formData = new FormData();
    formData.set('activityId', String(activityId));
    formData.set('level', String(level));

    const response = await fetch('?/updateLevel', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      if (previousLevel !== undefined) {
        setActivityStage(activityId, previousLevel);
      }
    }
  }

  function toggleLevelMenu(activityId: number) {
    openLevelActivityId = openLevelActivityId === activityId ? null : activityId;
  }

  function closeLevelMenu() {
    openLevelActivityId = null;
  }

  function openActivityDetail(activity: Activity) {
    detailActivity = activity;
    closeLevelMenu();
  }

  function closeActivityDetail() {
    detailActivity = null;
  }

  function toggleCategory(category: string) {
    openCategories = openCategories.includes(category)
      ? openCategories.filter((item) => item !== category)
      : [...openCategories, category];
  }

  function toggleAllCategories() {
    openCategories =
      openCategories.length === activityGroups.length
        ? []
        : activityGroups.map((group) => group.category);
  }

  function levelIconClass(level: number) {
    const tones: Record<number, string> = {
      1: 'bg-gradient-to-br from-orange-100 via-orange-300 to-amber-700 text-orange-950 ring-1 ring-orange-500/70',
      2: 'bg-gradient-to-br from-zinc-50 via-zinc-200 to-zinc-500 text-zinc-900 ring-1 ring-zinc-400/80',
      3: 'bg-gradient-to-br from-yellow-100 via-amber-300 to-yellow-600 text-amber-950 shadow-sm ring-1 ring-amber-400/80'
    };

    return tones[level] ?? tones[1];
  }

  function todayKey() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function isWeekend() {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  }

  function dayContextBonus(activity: Activity) {
    const weights = isWeekend() ? weekendCategoryWeights : weekdayCategoryWeights;
    return weights[activity.category] ?? 0;
  }

  function daysSince(dateKey: string) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const pickedAt = new Date(year, month - 1, day).getTime();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    return Math.round((todayStart - pickedAt) / 86_400_000);
  }

  function readPickStore(): ActivityPickStore {
    const savedPick = localStorage.getItem(todayPickStorageKey);

    if (!savedPick) return { picks: [] };

    try {
      const parsed = JSON.parse(savedPick) as ActivityPickStore | ActivityPick;

      if ('picks' in parsed && Array.isArray(parsed.picks)) {
        return {
          picks: parsed.picks.filter(
            (pick) => typeof pick.date === 'string' && Array.isArray(pick.activityIds)
          )
        };
      }

      if ('date' in parsed && Array.isArray(parsed.activityIds)) {
        return { picks: [parsed] };
      }
    } catch {
      return { picks: [] };
    }

    return { picks: [] };
  }

  function getSavedTodayPick() {
    const today = todayKey();
    const todaysPick = readPickStore().picks.find((pick) => pick.date === today);

    if (!todaysPick) return [];

    return todaysPick.activityIds
      .map((activityId) => activities.find((activity) => activity.id === activityId))
      .filter((activity): activity is Activity => Boolean(activity));
  }

  function saveTodayPick(pickedActivities: Activity[]) {
    const today = todayKey();
    const nextPick: ActivityPick = {
      date: today,
      activityIds: pickedActivities.map((activity) => activity.id)
    };
    const picks = [
      nextPick,
      ...readPickStore().picks.filter((pick) => pick.date !== today && daysSince(pick.date) >= 0)
    ].slice(0, pickHistoryLimit);

    localStorage.setItem(todayPickStorageKey, JSON.stringify({ picks }));
  }

  function recentActivityPenalty(activity: Activity, history: ActivityPick[]) {
    return history.reduce((penalty, pick) => {
      if (!pick.activityIds.includes(activity.id)) return penalty;

      const age = daysSince(pick.date);

      if (age <= 0) return penalty;
      if (age <= 3) return penalty + 1.6;
      if (age <= 7) return penalty + 0.8;
      if (age <= 14) return penalty + 0.35;

      return penalty;
    }, 0);
  }

  function recentCategoryPenalty(activity: Activity, history: ActivityPick[]) {
    return history.reduce((penalty, pick) => {
      const age = daysSince(pick.date);

      if (age <= 0 || age > 4) return penalty;

      const pickedSameCategory = pick.activityIds.some((activityId) => {
        const pickedActivity = activities.find((item) => item.id === activityId);

        return pickedActivity?.category === activity.category;
      });

      return pickedSameCategory ? penalty + 0.18 : penalty;
    }, 0);
  }

  function scoreActivity(
    activity: Activity,
    pickedActivities: Activity[],
    history: ActivityPick[],
    pickIndex: number
  ) {
    const categoryIsNewToday = pickedActivities.every(
      (picked) => picked.category !== activity.category
    );
    const diversityBonus = categoryIsNewToday ? 1.8 : -0.9;
    const targetLevel = pickRoles[pickIndex]?.targetLevel ?? 3;
    const stageFit = Math.max(0, 1.6 - Math.abs(activityStage(activity) - targetLevel) * 0.45);
    const surprise = Math.random();

    return (
      surprise +
      diversityBonus +
      stageFit +
      dayContextBonus(activity) -
      recentActivityPenalty(activity, history) -
      recentCategoryPenalty(activity, history)
    );
  }

  function exactStageCandidates(targetLevel: number, pickedActivities: Activity[]) {
    return activities.filter(
      (activity) =>
        activityStage(activity) === targetLevel &&
        !pickedActivities.some((picked) => picked.id === activity.id)
    );
  }

  function fallbackCandidates(pickedActivities: Activity[]) {
    return activities.filter(
      (activity) => !pickedActivities.some((picked) => picked.id === activity.id)
    );
  }

  function bestCandidate(
    candidates: Activity[],
    pickedActivities: Activity[],
    history: ActivityPick[],
    pickIndex: number
  ) {
    return candidates
      .map((activity) => ({
        activity,
        score: scoreActivity(activity, pickedActivities, history, pickIndex)
      }))
      .sort((left, right) => right.score - left.score)[0]?.activity;
  }

  function matchesPickRoles(pickedActivities: Activity[]) {
    return pickRoles.every((role, index) => {
      const activity = pickedActivities[index];

      return activity && activityStage(activity) === role.targetLevel;
    });
  }

  function pickBalancedActivities() {
    const history = readPickStore().picks;
    const pickedActivities: Activity[] = [];

    for (const [index, role] of pickRoles.entries()) {
      if (pickedActivities.length >= activities.length) break;

      const exactCandidates = exactStageCandidates(role.targetLevel, pickedActivities);
      const candidates =
        exactCandidates.length > 0 ? exactCandidates : fallbackCandidates(pickedActivities);
      const bestActivity = bestCandidate(candidates, pickedActivities, history, index);

      if (!bestActivity) break;

      pickedActivities.push(bestActivity);
    }

    return pickedActivities;
  }

  function setTodayPick(pickedActivities: Activity[]) {
    selectedActivities = pickedActivities;
    saveTodayPick(pickedActivities);
  }

  function pickThreeActivities() {
    setTodayPick(pickBalancedActivities());
  }

  onMount(() => {
    const savedPick = getSavedTodayPick();

    if (savedPick.length === 3 && matchesPickRoles(savedPick)) {
      selectedActivities = savedPick;
      return;
    }

    setTodayPick(pickBalancedActivities());
  });
</script>

<svelte:window
  onclick={closeLevelMenu}
  onkeydown={(event) => {
    if (event.key === 'Escape') closeActivityDetail();
  }}
/>

<svelte:head>
  <title>Activity Picker | Produck</title>
</svelte:head>

<div class="mx-auto flex max-w-5xl flex-col gap-6">
  <header class="rounded-lg border border-cork-300/50 bg-cork-50 p-5 shadow-sm">
    <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 class="mt-1 font-display text-4xl leading-tight text-cork-800 md:text-5xl">
          Ways to spend today
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-cork-600">
          {todayCopy}
        </p>
      </div>

      <div class="flex gap-2">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center rounded-md border border-cork-300 px-4 py-2 text-sm font-semibold text-cork-700 transition-colors hover:bg-cork-100"
          onclick={toggleAllCategories}
        >
          {openCategories.length === activityGroups.length ? 'Collapse all' : 'Open all'}
        </button>
        <button
          type="button"
          class="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-cork-800 px-4 py-2 text-sm font-semibold text-cork-50 transition-colors hover:bg-cork-700"
          onclick={pickThreeActivities}
        >
          <Shuffle class="size-4" />
          Pick 3
        </button>
      </div>
    </div>
  </header>

  {#if selectedActivities.length > 0}
    <section
      class="today-wrapper rounded-lg border border-cork-300/50 bg-cork-50 p-2.5 sm:p-3"
      transition:fly={{ y: 8 }}
    >
      <div class="mb-1.5 flex items-center gap-1.5 px-0.5 sm:mb-2 sm:gap-2 sm:px-0">
        <Sparkles class="size-3.5 text-cork-600 sm:size-4" />
        <h2 class="text-xs font-semibold tracking-wide text-cork-700 uppercase">Today</h2>
      </div>

      <div class="grid gap-1.5 sm:gap-2 md:grid-cols-3">
        {#each selectedActivities as activity, index (activity.id)}
          {@const Icon = iconMap[activity.icon as keyof typeof iconMap] ?? fallbackIcon}
          {@const stage = activityStage(activity)}
          <button
            type="button"
            class="today-activity-card relative flex min-h-16 w-full min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-lg border border-cork-300/50 bg-cork-50 px-3 py-2 text-left transition-colors hover:bg-cork-100 sm:block sm:min-h-0 sm:p-3"
            style={`--idle-delay: ${index * 0.35}s`}
            onclick={() => openActivityDetail(activity)}
            transition:fly={{ y: 10, delay: index * 70, duration: 220 }}
          >
            <div class="flex shrink-0 items-center gap-2 sm:mb-2">
              <span
                class="w-16 text-sm leading-none font-semibold text-cork-500 sm:w-auto sm:text-xs"
                >{pickRoles[index]?.label ?? `#${index + 1}`}</span
              >
              <span
                class={`flex size-8 items-center justify-center rounded-md sm:ml-auto sm:size-7 ${levelIconClass(stage)}`}
              >
                <Icon class="size-4" />
              </span>
            </div>
            <div class="min-w-0 flex-1 overflow-hidden pt-px">
              <p
                class="truncate text-[9px] leading-3 font-semibold tracking-wide text-cork-400 uppercase sm:text-[10px]"
              >
                {activity.category}
              </p>
              <h3
                class="line-clamp-2 text-[15px] leading-5 font-semibold [overflow-wrap:anywhere] text-cork-800 sm:text-sm"
              >
                {activity.name}
              </h3>
            </div>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  <section class="space-y-5">
    {#each activityGroups as group (group.category)}
      <div>
        <button
          type="button"
          class="mb-2 flex w-full cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-left transition-colors hover:bg-cork-200/50"
          aria-expanded={openCategories.includes(group.category)}
          onclick={() => toggleCategory(group.category)}
        >
          <ChevronDown
            class={`size-4 shrink-0 text-cork-500 transition-transform ${openCategories.includes(group.category) ? 'rotate-0' : '-rotate-90'}`}
          />
          <span class="min-w-0">
            <span class="block text-base font-semibold text-cork-800">{group.category}</span>
            <span class="block truncate text-xs text-cork-500">{group.description}</span>
          </span>
        </button>

        {#if openCategories.includes(group.category)}
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {#each group.activities as activity (activity.id)}
              {@const Icon = iconMap[activity.icon as keyof typeof iconMap] ?? fallbackIcon}
              {@const stage = activityStage(activity)}
              <article
                class={`relative flex min-h-16 items-center gap-2.5 rounded-lg border border-cork-300/50 bg-cork-50 px-3 py-2 pr-12 ${openLevelActivityId === activity.id ? 'z-40' : 'z-0'}`}
              >
                <div class="absolute top-1/2 right-4 z-50 -translate-y-1/2">
                  <button
                    type="button"
                    aria-label={`Change stage for ${activity.name}`}
                    title={`Stage ${stage}: ${stageLabel(stage)}`}
                    class={`flex size-8 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-[10px] leading-none font-semibold outline-none hover:border-cork-300 hover:bg-cork-100 sm:size-6 ${levelTextClass(stage)}`}
                    onclick={(event) => {
                      event.stopPropagation();
                      toggleLevelMenu(activity.id);
                    }}
                  >
                    S{stage}
                  </button>
                  {#if openLevelActivityId === activity.id}
                    <div
                      class="absolute top-9 right-0 grid w-28 overflow-hidden rounded-md border border-cork-300 bg-cork-50 py-1 shadow-md sm:top-7"
                    >
                      {#each levels as level (level)}
                        <button
                          type="button"
                          class={`w-full cursor-pointer px-2 py-2 text-left text-xs font-semibold hover:bg-cork-100 sm:py-1.5 sm:text-[10px] ${levelTextClass(level)}`}
                          onclick={() => updateActivityStage(activity.id, level)}
                        >
                          S{level}
                          {stageLabel(level)}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
                <button
                  type="button"
                  class="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                  onclick={() => openActivityDetail({ ...activity, category: group.category })}
                >
                  <span
                    class={`flex size-8 shrink-0 items-center justify-center rounded-md ${levelIconClass(stage)}`}
                  >
                    <Icon class="size-4" />
                  </span>
                  <span class="min-w-0">
                    <span class="block pr-4 text-sm leading-5 font-semibold text-cork-800"
                      >{activity.name}</span
                    >
                  </span>
                </button>
              </article>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </section>
</div>

{#if detailActivity}
  {@const DetailIcon = iconMap[detailActivity.icon as keyof typeof iconMap] ?? fallbackIcon}
  {@const detailStage = activityStage(detailActivity)}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-cork-900/35 px-4 py-6"
    role="presentation"
    onclick={closeActivityDetail}
    transition:fade={{ duration: 140 }}
  >
    <div
      class="w-full max-w-md rounded-lg border border-cork-300 bg-cork-50 p-5 shadow-xl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-detail-title"
      tabindex="-1"
      onclick={(event) => event.stopPropagation()}
      onkeydown={(event) => event.stopPropagation()}
      in:scale={{ duration: 170, start: 0.96 }}
      out:fly={{ y: 8, duration: 120 }}
    >
      <div class="flex items-start gap-3">
        <span
          class={`flex size-10 shrink-0 items-center justify-center rounded-md ${levelIconClass(detailStage)}`}
        >
          <DetailIcon class="size-5" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] leading-4 font-semibold tracking-wide text-cork-400 uppercase">
            {detailActivity.category} · S{detailStage}
            {stageLabel(detailStage)}
          </p>
          <h2 id="activity-detail-title" class="text-lg leading-6 font-semibold text-cork-800">
            {detailActivity.name}
          </h2>
        </div>
        <button
          type="button"
          class="flex size-8 cursor-pointer items-center justify-center rounded-md text-cork-500 hover:bg-cork-100 hover:text-cork-800"
          aria-label="Close activity detail"
          onclick={closeActivityDetail}
        >
          <X class="size-4" />
        </button>
      </div>
      <p class="mt-4 text-sm leading-6 text-cork-600">{detailActivity.detail}</p>
    </div>
  </div>
{/if}
