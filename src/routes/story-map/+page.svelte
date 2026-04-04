<script lang="ts">
	import StoryMapBoard from "$lib/components/story-map/StoryMapBoard.svelte";
	import { CircleCheck, Circle, ChevronRight, Square, SquareCheck, MapPinned, ClipboardList } from '@lucide/svelte';
	import { invalidateAll } from '$app/navigation';
	import type { BacklogEpic, BacklogStory, CheckedAC } from './+page.server.js';

	let { data } = $props();

	let storyMap = $derived(data.storyMap);
	let view = $state<'map' | 'backlog'>('map');

	function switchView(v: 'map' | 'backlog') {
		if (v === view) return;
		view = v;
		invalidateAll();
	}

	let mainName = $derived(() => {
		const name = storyMap?.product ?? '';
		const match = name.match(/^([^(]+?)(?:\s*\((.+)\))?$/);
		return { primary: match?.[1]?.trim() ?? name, subtitle: match?.[2]?.trim() ?? '' };
	});

	// ── Backlog state ──
	const KANO_LABELS: Record<string, { label: string; color: string }> = {
		'must-have': { label: 'Must-have', color: '#e74c3c' },
		performance: { label: 'Performance', color: '#27ae60' },
		delighter: { label: 'Delighter', color: '#d4a017' }
	};

	const KANO_ORDER: Record<string, number> = {
		'must-have': 0,
		performance: 1,
		delighter: 2
	};

	let prioritySortDir = $state<'asc' | 'desc'>('asc');

	function togglePrioritySort() {
		prioritySortDir = prioritySortDir === 'asc' ? 'desc' : 'asc';
	}

	let sortedEpics = $derived.by(() => {
		const dir = prioritySortDir === 'asc' ? 1 : -1;
		return (data.epics as BacklogEpic[]).map((epic) => ({
			...epic,
			stories: [...epic.stories].sort((a, b) => {
				const taskCmp = a.taskOrder - b.taskOrder;
				if (taskCmp !== 0) return taskCmp;
				return ((KANO_ORDER[a.kano] ?? 9) - (KANO_ORDER[b.kano] ?? 9)) * dir;
			})
		}));
	});

	let expandedStories = $state<Set<string>>(new Set());

	function toggleStory(id: string) {
		const next = new Set(expandedStories);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedStories = next;
	}

	// AC state — derived from server data
	function isACChecked(story: BacklogStory, index: number): boolean {
		return story.checkedAcs.some((ac) => ac.index === index);
	}

	function getACTime(story: BacklogStory, index: number): string {
		const ac = story.checkedAcs.find((a) => a.index === index);
		if (!ac) return '';
		return new Date(ac.checkedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	}

	function isAllACDone(story: BacklogStory): boolean {
		if (story.acceptanceCriteria.length === 0) return false;
		return story.checkedAcs.length >= story.acceptanceCriteria.length;
	}

	let syncTimer: ReturnType<typeof setTimeout> | null = null;

	function toggleAC(storyId: string, story: BacklogStory, index: number) {
		const current = [...story.checkedAcs];
		const existing = current.findIndex((a) => a.index === index);

		if (existing >= 0) {
			current.splice(existing, 1);
		} else {
			current.push({ index, checkedAt: new Date().toISOString() });
		}

		// Optimistic update
		story.checkedAcs = current;

		const shouldBeDone = story.acceptanceCriteria.length > 0 && current.length >= story.acceptanceCriteria.length;

		// Debounced backend sync
		if (syncTimer) clearTimeout(syncTimer);
		syncTimer = setTimeout(() => {
			fetch('/api/story', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					code: storyId,
					checkedAcs: current,
					done: shouldBeDone
				})
			}).then(() => invalidateAll());
		}, 500);
	}
</script>

<svelte:head><title>{storyMap ? `${view === 'map' ? 'Story Map' : 'Backlog'}: ${storyMap.product}` : 'Story Map'}</title></svelte:head>

{#if storyMap}
	<div>
		<header class="mb-6">
			<h1 class="font-display text-4xl text-cork-800">{mainName().primary}</h1>
			<div class="flex items-center justify-between gap-4 mt-0.5">
				{#if mainName().subtitle}
					<p class="text-sm text-cork-500">{mainName().subtitle}</p>
				{:else}
					<div></div>
				{/if}

				<!-- View toggle (icons) -->
				<div class="flex border border-cork-300 rounded overflow-hidden shrink-0">
					<button
						type="button"
						class="px-2 py-1 transition-colors {view === 'map' ? 'bg-cork-700 text-cork-50' : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
						onclick={() => switchView('map')}
						title="Story Map"
					>
						<MapPinned class="size-3.5" />
					</button>
					<button
						type="button"
						class="px-2 py-1 transition-colors {view === 'backlog' ? 'bg-cork-700 text-cork-50' : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
						onclick={() => switchView('backlog')}
						title="Backlog"
					>
						<ClipboardList class="size-3.5" />
					</button>
				</div>
			</div>
		</header>

		{#if view === 'map'}
			<StoryMapBoard data={storyMap} />
		{:else}
			<!-- Backlog view -->

			{#if sortedEpics.length === 0}
				<p class="text-cork-400 text-sm">No stories yet</p>
			{:else}
				<div
					class="rounded-xl overflow-hidden"
					style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
						box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
				>
					<div class="grid grid-cols-[40px_1fr_100px_100px_70px] md:grid-cols-[40px_1fr_140px_120px_80px] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-cork-500 border-b border-cork-400/20">
						<span></span>
						<span>Story</span>
						<button type="button" class="flex items-center gap-1 cursor-pointer hover:text-cork-700 transition-colors text-left" onclick={togglePrioritySort}>
							Priority
							<span class="text-[8px]">{prioritySortDir === 'asc' ? '▼' : '▲'}</span>
						</button>
						<span>PIC</span>
						<span class="text-center">Status</span>
					</div>

					{#each sortedEpics as epic (epic.code)}
						{#if epic.stories.length > 0}
							<div class="grid grid-cols-[40px_1fr] gap-2 px-4 py-2 bg-cork-400/10 border-b border-cork-400/15 items-center">
								<div class="flex items-center justify-center gap-0.5">
									{#each epic.actors as actorEmoji}
										{@const actor = storyMap?.actors.find((a) => a.emoji === actorEmoji)}
										<span class="relative text-sm cursor-default group">
											{actorEmoji}
											{#if actor?.label}
												<span class="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 px-2 py-0.5 rounded text-[10px] font-medium text-cork-50 bg-cork-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none z-10">
													{actor.label}
												</span>
											{/if}
										</span>
									{/each}
								</div>
								<span class="font-bold text-cork-700 font-display text-base">{epic.code} — {epic.title}</span>
							</div>

							{#each epic.stories as story, si (story.id)}
								{@const hasAC = story.acceptanceCriteria.length > 0}
								{@const isExpanded = expandedStories.has(story.id)}
								{@const allDone = isAllACDone(story)}
								{@const isDone = story.done || allDone}
								{@const kano = KANO_LABELS[story.kano]}

								<div
									class="grid grid-cols-[40px_1fr_100px_100px_70px] md:grid-cols-[40px_1fr_140px_120px_80px] gap-2 px-4 py-2.5 border-b border-cork-400/10 transition-colors {si % 2 === 0 ? 'bg-cork-200/15' : ''} {hasAC ? 'cursor-pointer hover:bg-cork-200/40' : ''}"
									role={hasAC ? 'button' : undefined}
									tabindex={hasAC ? 0 : undefined}
									onclick={() => hasAC && toggleStory(story.id)}
									onkeydown={(e) => { if (hasAC && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleStory(story.id); } }}
								>
									<div></div>
									<div class="flex items-center gap-2 min-w-0">
										{#if hasAC}
											<ChevronRight class="size-3.5 shrink-0 text-cork-400 transition-transform {isExpanded ? 'rotate-90' : ''}" />
										{:else}
											<span class="w-3.5 shrink-0"></span>
										{/if}
										<span class="text-xs font-mono text-cork-400 shrink-0">{story.id}</span>
										<span class="text-sm font-medium truncate {isDone ? 'line-through text-cork-400' : 'text-cork-800'}">{story.title}</span>
										{#if story.task}
											<span class="text-[10px] text-cork-400 shrink-0">({story.task})</span>
										{/if}
									</div>

									<div class="flex items-center gap-1.5">
										<span class="size-2 rounded-full shrink-0" style="background: {kano?.color ?? '#8a7e6b'};"></span>
										<span class="text-xs font-medium" style="color: {kano?.color ?? '#8a7e6b'};">{kano?.label ?? story.kano}</span>
									</div>

									<div class="flex items-center">
										{#if story.pic}
											<span class="text-xs font-medium text-cork-600">{story.pic}</span>
										{/if}
									</div>

									<div class="flex items-center justify-center">
										{#if isDone}
											<CircleCheck class="size-5 text-cork-500" />
										{:else}
											<Circle class="size-5 text-cork-300" />
										{/if}
									</div>
								</div>

								{#if isExpanded && hasAC}
									{#each story.acceptanceCriteria as ac, i}
										{@const checked = isACChecked(story, i)}
										<div class="grid grid-cols-[40px_1fr_100px_100px_70px] md:grid-cols-[40px_1fr_140px_120px_80px] gap-2 px-4 py-1.5 border-b border-cork-400/8 bg-cork-100/30">
											<div></div>
											<div class="flex items-center gap-2 min-w-0 pl-8">
												<button
													type="button"
													class="shrink-0 cursor-pointer"
													onclick={(e) => { e.stopPropagation(); toggleAC(story.id, story, i); }}
												>
													{#if checked}
														<SquareCheck class="size-4 text-green-600" />
													{:else}
														<Square class="size-4 text-cork-400" />
													{/if}
												</button>
												<span class="text-xs {checked ? 'line-through text-cork-400' : 'text-cork-600'}">{ac}</span>
											</div>
											<div></div>
											<div></div>
											<div class="flex items-center justify-end">
												{#if checked && getACTime(story, i)}
													<span class="text-[9px] text-cork-400">{getACTime(story, i)}</span>
												{/if}
											</div>
										</div>
									{/each}
								{/if}
							{/each}
						{/if}
					{/each}
				</div>
			{/if}
		{/if}
	</div>
{:else}
	<div class="flex items-center justify-center h-64 text-cork-500">
		<p>No project selected. Pick one from the sidebar.</p>
	</div>
{/if}
