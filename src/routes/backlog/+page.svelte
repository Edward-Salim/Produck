<script lang="ts">
	import { CircleCheck, Circle, ChevronRight, ChevronDown, Square, SquareCheck, ArrowUpDown } from '@lucide/svelte';
	import type { BacklogEpic, BacklogStory } from './+page.server.js';

	let { data } = $props();

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

	// Sort state
	let sortBy = $state<'default' | 'kano' | 'pic'>('default');
	let sortDir = $state<'asc' | 'desc'>('asc');

	function toggleSort(col: 'kano' | 'pic') {
		if (sortBy === col) {
			sortDir = sortDir === 'asc' ? 'desc' : 'asc';
		} else {
			sortBy = col;
			sortDir = 'asc';
		}
	}

	function resetSort() {
		sortBy = 'default';
		sortDir = 'asc';
	}

	// Flatten all stories for sorting, or keep grouped by epic
	let allStories = $derived.by(() => {
		const stories: (BacklogStory & { epicCode: string; epicTitle: string })[] = [];
		for (const epic of data.epics) {
			for (const s of epic.stories) {
				stories.push({ ...s, epicCode: epic.code, epicTitle: epic.title });
			}
		}
		return stories;
	});

	let sortedView = $derived.by(() => {
		if (sortBy === 'default') return null; // use grouped epic view

		const sorted = [...allStories];
		const dir = sortDir === 'asc' ? 1 : -1;

		if (sortBy === 'kano') {
			sorted.sort((a, b) => ((KANO_ORDER[a.kano] ?? 9) - (KANO_ORDER[b.kano] ?? 9)) * dir);
		} else if (sortBy === 'pic') {
			sorted.sort((a, b) => a.pic.localeCompare(b.pic) * dir);
		}

		return sorted;
	});

	// Expand/collapse
	let expandedStories = $state<Set<string>>(new Set());

	function toggleStory(id: string) {
		const next = new Set(expandedStories);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedStories = next;
	}

	// AC checkboxes
	let checkedAC = $state<Map<string, Set<number>>>(new Map());

	function toggleAC(storyId: string, index: number) {
		const current = new Set(checkedAC.get(storyId) ?? []);
		if (current.has(index)) current.delete(index);
		else current.add(index);
		checkedAC = new Map(checkedAC).set(storyId, current);
	}

	function isACChecked(storyId: string, index: number): boolean {
		return checkedAC.get(storyId)?.has(index) ?? false;
	}

	function isAllACDone(story: BacklogStory): boolean {
		if (story.acceptanceCriteria.length === 0) return false;
		const checked = checkedAC.get(story.id);
		if (!checked) return false;
		return checked.size >= story.acceptanceCriteria.length;
	}

	let totalStories = $derived(data.epics.reduce((sum: number, e: BacklogEpic) => sum + e.stories.length, 0));
	let doneStories = $derived(data.epics.reduce((sum: number, e: BacklogEpic) => sum + e.stories.filter((s: BacklogStory) => s.done).length, 0));
</script>

{#snippet storyRow(story: BacklogStory, epicLabel?: string)}
	{@const hasAC = story.acceptanceCriteria.length > 0}
	{@const isExpanded = expandedStories.has(story.id)}
	{@const allDone = isAllACDone(story)}

	<!-- Story row -->
	<div
		class="grid grid-cols-[1fr_100px_100px_70px] md:grid-cols-[1fr_140px_120px_80px] gap-2 px-4 py-2.5 border-b border-cork-400/10 transition-colors {hasAC ? 'cursor-pointer hover:bg-cork-200/30' : ''}"
		role={hasAC ? 'button' : undefined}
		tabindex={hasAC ? 0 : undefined}
		onclick={() => hasAC && toggleStory(story.id)}
		onkeydown={(e) => { if (hasAC && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggleStory(story.id); } }}
	>
		<div class="flex items-center gap-2 min-w-0">
			{#if hasAC}
				<ChevronRight class="size-3.5 shrink-0 text-cork-400 transition-transform {isExpanded ? 'rotate-90' : ''}" />
			{:else}
				<span class="w-3.5 shrink-0"></span>
			{/if}
			<span class="text-xs font-mono text-cork-400 shrink-0">{story.id}</span>
			<span class="text-sm truncate {allDone ? 'line-through text-cork-400' : 'text-cork-800'}">{story.title}</span>
			{#if story.task}
				<span class="text-[10px] text-cork-400 shrink-0">({story.task})</span>
			{/if}
			{#if epicLabel}
				<span class="text-[10px] text-cork-400 shrink-0 hidden md:inline">· {epicLabel}</span>
			{/if}
		</div>

		<div class="flex items-center">
			<span class="text-xs font-medium" style="color: {KANO_LABELS[story.kano]?.color ?? '#8a7e6b'};">{KANO_LABELS[story.kano]?.label ?? story.kano}</span>
		</div>

		<div class="flex items-center">
			{#if story.pic}
				<span class="text-xs text-cork-500">{story.pic}</span>
			{/if}
		</div>

		<div class="flex items-center justify-center">
			{#if story.done || allDone}
				<CircleCheck class="size-5 text-green-600" />
			{:else}
				<Circle class="size-5 text-cork-300" />
			{/if}
		</div>
	</div>

	<!-- AC rows -->
	{#if isExpanded && hasAC}
		{#each story.acceptanceCriteria as ac, i}
			{@const checked = isACChecked(story.id, i)}
			<div class="grid grid-cols-[1fr_100px_100px_70px] md:grid-cols-[1fr_140px_120px_80px] gap-2 px-4 py-1.5 border-b border-cork-400/8 bg-cork-100/30">
				<div class="flex items-center gap-2 min-w-0 pl-8">
					<button
						type="button"
						class="shrink-0 cursor-pointer"
						onclick={(e) => { e.stopPropagation(); toggleAC(story.id, i); }}
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
				<div></div>
			</div>
		{/each}
	{/if}
{/snippet}

<svelte:head><title>Backlog - Produck</title></svelte:head>

<div>
	<header class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h1 class="font-display text-2xl md:text-4xl text-cork-800">Backlog</h1>
			<p class="text-sm text-cork-500 mt-0.5">{totalStories} stories &middot; {doneStories} done</p>
		</div>
	</header>

	{#if data.epics.length === 0}
		<div class="flex items-center justify-center py-20">
			<p class="text-cork-400 text-sm">No stories in this project yet</p>
		</div>
	{:else}
		<div
			class="rounded-xl overflow-hidden"
			style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
				box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
		>
			<!-- Table header -->
			<div class="grid grid-cols-[1fr_100px_100px_70px] md:grid-cols-[1fr_140px_120px_80px] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-cork-500 border-b border-cork-400/20">
				<button type="button" class="flex items-center gap-1 text-left cursor-pointer hover:text-cork-700 transition-colors {sortBy === 'default' ? 'text-cork-700' : 'opacity-60'}" onclick={resetSort}>
					Story
					{#if sortBy !== 'default'}
						<span class="text-[9px] normal-case tracking-normal font-medium text-cork-400">(grouped)</span>
					{/if}
				</button>
				<button type="button" class="flex items-center gap-1 cursor-pointer hover:text-cork-700 transition-colors {sortBy === 'kano' ? 'text-cork-700' : ''}" onclick={() => toggleSort('kano')}>
					Priority
					<ArrowUpDown class="size-3 {sortBy === 'kano' ? 'opacity-100' : 'opacity-40'}" />
				</button>
				<button type="button" class="flex items-center gap-1 cursor-pointer hover:text-cork-700 transition-colors {sortBy === 'pic' ? 'text-cork-700' : ''}" onclick={() => toggleSort('pic')}>
					PIC
					<ArrowUpDown class="size-3 {sortBy === 'pic' ? 'opacity-100' : 'opacity-40'}" />
				</button>
				<span class="text-center">Status</span>
			</div>

			{#if sortedView}
				<!-- Flat sorted view -->
				{#each sortedView as story (story.id)}
					{@render storyRow(story, `${story.epicCode}`)}
				{/each}
			{:else}
				<!-- Grouped by epic (default) -->
				{#each data.epics as epic (epic.code)}
					{#if epic.stories.length > 0}
						<div class="px-4 py-2 bg-cork-400/10 border-b border-cork-400/15">
							<span class="font-bold text-cork-700 font-display text-base">{epic.code} — {epic.title}</span>
						</div>

						{#each epic.stories as story (story.id)}
							{@render storyRow(story)}
						{/each}
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
</div>
