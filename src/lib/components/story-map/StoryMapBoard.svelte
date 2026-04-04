<script lang="ts">
	import StickyNote from "./StickyNote.svelte";
	import StoryModal from "./StoryModal.svelte";
	import type { StoryMapData, Story } from "$lib/types/story-map.js";
	import { SvelteMap, SvelteSet } from "svelte/reactivity";

	let { data }: { data: StoryMapData } = $props();

	let selectedStory: Story | null = $state(null);
	let modalOpen: boolean = $state(false);

	/* ---- Derived grid structure ---- */

	let is3Level = $derived(data.levels === 3);

	interface Column {
		actId: string;
		taskId: string | null;
		task: { id: string; title: string } | null;
		act: (typeof data.activities)[number];
	}

	let columns = $derived.by<Column[]>(() => {
		const cols: Column[] = [];
		for (const act of data.activities) {
			if (is3Level && act.tasks && act.tasks.length > 0) {
				for (const task of act.tasks) {
					cols.push({ actId: act.id, taskId: task.id, task, act });
				}
			} else {
				cols.push({ actId: act.id, taskId: null, task: null, act });
			}
		}
		return cols;
	});

	let activitySpans = $derived.by<Map<string, number>>(() => {
		const spans = new SvelteMap<string, number>();
		for (const col of columns) {
			spans.set(col.actId, (spans.get(col.actId) ?? 0) + 1);
		}
		return spans;
	});

	let totalCols = $derived(columns.length);

	let gridCols = $derived(`44px repeat(${totalCols}, minmax(145px, 1fr))`);

	/* ---- Kano section config ---- */

	const kanoSections = [
		{ key: "must-have" as const, label: "Must-have", textColor: "text-[#922b21]", lineColor: "bg-[#e74c3c]" },
		{ key: "performance" as const, label: "Performance", textColor: "text-[#1e8449]", lineColor: "bg-[#27ae60]" },
		{ key: "delighter" as const, label: "Delighter", textColor: "text-[#b7950b]", lineColor: "bg-[#f1c40f]" },
	];

	/* ---- Helpers ---- */

	function findColumnIndex(story: Story): number {
		if (is3Level && story.task) {
			const idx = columns.findIndex((c) => c.taskId === story.task);
			if (idx >= 0) return idx;
		}
		if (story.activity) {
			const idx = columns.findIndex((c) => c.actId === story.activity);
			if (idx >= 0) return idx;
		}
		return 0;
	}

	/** Group stories by column index so multiple stories in the same cell stack vertically */
	function groupByColumn(stories: Story[]): Map<number, Story[]> {
		const groups = new SvelteMap<number, Story[]>();
		for (const story of stories) {
			const col = findColumnIndex(story);
			const arr = groups.get(col);
			if (arr) arr.push(story);
			else groups.set(col, [story]);
		}
		return groups;
	}

	function openStory(story: Story) {
		selectedStory = story;
		modalOpen = true;
	}

	/* ---- Scroll hint ---- */
	let boardEl = $state<HTMLDivElement | null>(null);
	let showScrollHint = $state(false);

	function checkScroll() {
		if (!boardEl) return;
		const isScrollable = boardEl.scrollWidth > boardEl.clientWidth;
		const atEnd = boardEl.scrollLeft + boardEl.clientWidth >= boardEl.scrollWidth - 10;
		showScrollHint = isScrollable && !atEnd;
	}

	$effect(() => {
		if (!boardEl) return;
		checkScroll();
		boardEl.addEventListener("scroll", checkScroll);
		window.addEventListener("resize", checkScroll);
		return () => {
			boardEl?.removeEventListener("scroll", checkScroll);
			window.removeEventListener("resize", checkScroll);
		};
	});

	/* ---- Build unique activity order for spanning rows ---- */

	let kanoStartRow = $derived(is3Level ? 4 : 3); // row after actors + backbone + tasks (if 3-level)

	let activityOrder = $derived.by(() => {
		const seen = new SvelteSet<string>();
		const order: { act: (typeof data.activities)[number]; startCol: number; span: number }[] = [];
		let colIdx = 0;
		for (const act of data.activities) {
			if (!seen.has(act.id)) {
				seen.add(act.id);
				const span = activitySpans.get(act.id) ?? 1;
				order.push({ act, startCol: colIdx, span });
				colIdx += span;
			}
		}
		return order;
	});
</script>

<!-- Board wrap (scroll hint container) -->
<div class="relative">
<!-- Board container -->
<div
	bind:this={boardEl}
	class="rounded-xl shadow-[inset_0_1px_4px_rgba(255,255,255,.15),inset_0_-2px_6px_rgba(0,0,0,.06),0_6px_24px_rgba(0,0,0,.12)] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-8"
	style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;"
>
	<!-- CSS Grid -->
	<div class="grid gap-3 items-start min-w-max" style="grid-template-columns: {gridCols};">

		<!-- ====== ROW 1: Actor row ====== -->
		<!-- Gutter cell for actors -->
		<div
			class="flex items-center justify-center h-full"
			style="grid-column: 1; grid-row: 1;"
		>
			<span
				class="text-[9px] uppercase tracking-widest text-cork-500 font-semibold"
				style="writing-mode: vertical-rl; text-orientation: mixed;"
			>Actors</span>
		</div>

		{#each activityOrder as { act, startCol, span } (act.id)}
			<!-- Actor emojis: placed in first column only -->
			<div
				class="flex items-end justify-center py-1.5"
				style="grid-column: {startCol + 2}; grid-row: 1;"
			>
				{#if act.actors}
					<div class="flex items-center justify-center gap-1 w-35">
						{#each act.actors as actorEmoji (actorEmoji)}
							{@const actor = data.actors.find((a) => a.emoji === actorEmoji)}
							<span class="relative text-2xl cursor-default drop-shadow-sm group">
								{actorEmoji}
								{#if actor?.label}
									<span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-[10px] font-medium text-cork-50 bg-cork-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none z-10">
										{actor.label}
									</span>
								{/if}
							</span>
						{/each}
					</div>
				{/if}
			</div>
		{/each}

		<!-- ====== ROW 2: Backbone row ====== -->
		<!-- Gutter cell -->
		<div
			class="flex items-center justify-center h-full"
			style="grid-column: 1; grid-row: 2;"
		>
			<span
				class="text-[9px] uppercase tracking-widest text-cork-500 font-semibold"
				style="writing-mode: vertical-rl; text-orientation: mixed;"
			>Backbone</span>
		</div>

		{#each activityOrder as { act, startCol, span } (act.id)}
			{#if is3Level}
				<div
					class="flex items-center justify-center pb-3"
					style="grid-column: {startCol + 2}; grid-row: 2;"
				>
					<StickyNote
						variant="activity"
						colorIndex={0}
						title={act.title}
						id={act.id}
					/>
				</div>
			{:else}
				<div
					class="flex items-center justify-center pb-3"
					style="grid-column: {startCol + 2} / span {span}; grid-row: 2;"
				>
					<StickyNote
						variant="activity"
						colorIndex={0}
						title={act.title}
						id={act.id}
					/>
				</div>
			{/if}
		{/each}

		<!-- ====== ROW 3: Task row (only 3-level) ====== -->
		{#if is3Level}
			<!-- Gutter cell -->
			<div
				class="flex items-center justify-center h-full"
				style="grid-column: 1; grid-row: 3;"
			>
				<span
					class="text-[9px] uppercase tracking-widest text-cork-500 font-semibold"
					style="writing-mode: vertical-rl; text-orientation: mixed;"
				>Tasks</span>
			</div>

			{#each columns as col, i (col.taskId ?? col.actId + '-' + i)}
				<div
					class="flex items-center justify-center pb-3"
					style="grid-column: {i + 2}; grid-row: 3;"
				>
					{#if col.task}
						<StickyNote
							variant="task"
							colorIndex={i}
							title={col.task.title}
							id={col.task.id}
						/>
					{/if}
				</div>
			{/each}
		{/if}

		<!-- ====== Narrative flow label (overlaid, not a grid row) ====== -->

		<!-- ====== ROWS 5+: Kano sections ====== -->
		{#each kanoSections as section, sIdx (section.key)}
			{@const baseRow = kanoStartRow + 1 + sIdx * 2}

			<!-- Separator row -->
			<div
				class="flex items-center gap-3 py-1.5"
				style="grid-column: 1 / -1; grid-row: {baseRow};"
			>
				<span class="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap {section.textColor}">
					{section.label}
				</span>
				<div class="flex-1 h-0.5 rounded-full {section.lineColor}"></div>
			</div>

			<!-- Group stories by column so multiple stories stack vertically -->
			{@const grouped = groupByColumn(data.stories[section.key])}
			{#each [...grouped.entries()] as [colIndex, stories] (colIndex)}
				<div
					class="flex flex-col items-center gap-3"
					style="grid-column: {colIndex + 2}; grid-row: {baseRow + 1};"
				>
					{#each stories as story, storyIdx (story.id)}
						<StickyNote
							variant="story"
							colorIndex={sIdx * 100 + colIndex * 10 + storyIdx}
							title={story.title}
							id={story.id}
							done={story.done}
							pic={story.pic}
							picColor={story.picColor}
							onclick={() => openStory(story)}
						/>
					{/each}
				</div>
			{/each}
		{/each}

	</div>
</div>
<!-- Scroll hint overlay -->
<div
	class="absolute right-0 top-0 bottom-0 w-12 rounded-r-xl flex items-center justify-center pointer-events-none transition-opacity duration-300"
	style="background: linear-gradient(to right, transparent, rgba(205,195,174,.7)); opacity: {showScrollHint ? 1 : 0};"
>
	<span
		class="text-[10px] text-cork-600 tracking-wider"
		style="writing-mode: vertical-rl; animation: nudge 1.5s ease-in-out infinite;"
	>scroll &rarr;</span>
</div>
</div>

<!-- Story detail modal -->
<StoryModal bind:open={modalOpen} story={selectedStory} />
