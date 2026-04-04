<script lang="ts">
	import type { ExperienceActivity, ExperienceTask, ExperienceStory } from './+page.server.js';

	let { data } = $props();

	const acts = $derived(data.activities as ExperienceActivity[]);

	let allStories = $derived.by(() => {
		const result: { story: ExperienceStory; taskTitle: string; actIndex: number }[] = [];
		for (let ai = 0; ai < acts.length; ai++) {
			for (const task of acts[ai].tasks) {
				for (const story of task.stories) {
					result.push({ story, taskTitle: task.title, actIndex: ai });
				}
			}
		}
		return result;
	});

	let actSpans = $derived.by(() => {
		const spans: { title: string; span: number; actors: string[] }[] = [];
		for (const act of acts) {
			let count = 0;
			for (const task of act.tasks) count += task.stories.length;
			if (count > 0) spans.push({ title: act.title, span: count, actors: act.actors });
		}
		return spans;
	});

	let taskSpans = $derived.by(() => {
		const spans: { title: string; span: number; actIndex: number }[] = [];
		for (let ai = 0; ai < acts.length; ai++) {
			for (const task of acts[ai].tasks) {
				if (task.stories.length > 0) {
					spans.push({ title: task.title, span: task.stories.length, actIndex: ai });
				}
			}
		}
		return spans;
	});

	let totalCols = $derived(allStories.length);

	const PHASE_COLORS = [
		{ bg: 'rgba(221,212,194,0.4)', text: '#5c4b3a' },
		{ bg: 'rgba(176,164,142,0.35)', text: '#5c4b3a' },
		{ bg: 'rgba(138,126,107,0.3)', text: '#f5f0e8' },
		{ bg: 'rgba(107,94,74,0.4)', text: '#f5f0e8' },
		{ bg: 'rgba(92,75,58,0.45)', text: '#f5f0e8' },
		{ bg: 'rgba(61,53,41,0.45)', text: '#f5f0e8' },
	];

	const HAPPY_FACES = ['\u{1F60A}', '\u{1F929}', '\u{1F60D}', '\u{1F973}', '\u{1F642}', '\u{263A}'];
	const MIXED_FACES = ['\u{1F914}', '\u{1F928}', '\u{1F9D0}', '\u{1F60F}', '\u{1F643}', '\u{1F612}'];
	const SAD_FACES = ['\u{1F615}', '\u{1F61F}', '\u{1F623}', '\u{1F629}', '\u{1F62B}', '\u{1F630}'];

	function storyEmoji(s: ExperienceStory, index: number): string {
		const p = s.pains.length;
		const g = s.gains.length;
		if (p === 0 && g === 0) return '\u{1F610}';
		if (g > p) return HAPPY_FACES[index % HAPPY_FACES.length];
		if (p > g) return SAD_FACES[index % SAD_FACES.length];
		return MIXED_FACES[index % MIXED_FACES.length];
	}

	function touchpointLabel(taskTitle: string): string {
		const t = taskTitle.toLowerCase();
		if (t.includes('whatsapp') || t.includes('chat') || t.includes('contact')) return 'WhatsApp';
		if (t.includes('login') || t.includes('register') || t.includes('auth')) return 'Auth Page';
		if (t.includes('upload')) return 'Upload Page';
		if (t.includes('search') || t.includes('browse')) return 'Search Page';
		if (t.includes('profile')) return 'Profile Page';
		if (t.includes('manage') || t.includes('access') || t.includes('control')) return 'Dashboard';
		if (t.includes('detail') || t.includes('view') || t.includes('preview') || t.includes('portfolio')) return 'Detail Page';
		if (t.includes('email') || t.includes('mail')) return 'Email';
		if (t.includes('zoom') || t.includes('meet') || t.includes('call')) return 'Video Call';
		return 'Web App';
	}

	function phase(i: number) { return PHASE_COLORS[i % PHASE_COLORS.length]; }
</script>

<svelte:head><title>Experience Map - Produck</title></svelte:head>

<style>
	.xmap-scroll::-webkit-scrollbar { height: 6px; }
	.xmap-scroll::-webkit-scrollbar-track { background: transparent; }
	.xmap-scroll::-webkit-scrollbar-thumb { background: rgba(92,75,58,0.25); border-radius: 3px; }
	.xmap-scroll::-webkit-scrollbar-thumb:hover { background: rgba(92,75,58,0.4); }
	.xmap-scroll { scrollbar-width: thin; scrollbar-color: rgba(92,75,58,0.25) transparent; }
</style>

<div>
	<header class="mb-4">
		<h1 class="font-display text-2xl md:text-4xl text-cork-800">Experience Map</h1>
		<p class="text-sm text-cork-500 mt-0.5">Customer journey across all activities</p>
	</header>

	{#if totalCols === 0}
		<div class="flex items-center justify-center py-20">
			<p class="text-cork-400 text-sm">No stories in this project yet</p>
		</div>
	{:else}
		<div
			class="rounded-xl xmap-scroll overflow-x-auto"
			style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
				box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);
				min-height: calc(100vh - 180px);"
		>
			<div class="flex flex-col" style="min-width: {Math.max(700, totalCols * 155)}px; min-height: calc(100vh - 180px);">

				<!-- Activity -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Activity</div>
					{#each actSpans as act, i}
						<div class="px-3 py-2 text-center border-l border-cork-600/30 flex items-center justify-center" style="grid-column: span {act.span}; background: {phase(i).bg};">
							<p class="font-display text-lg font-bold" style="color: {phase(i).text};">{act.title}</p>
						</div>
					{/each}
				</div>

				<!-- Actors -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Actors</div>
					{#each actSpans as act}
						<div class="px-3 py-1.5 text-center border-l border-cork-600/30 flex items-center justify-center" style="grid-column: span {act.span};">
							<p class="text-sm text-cork-700">{act.actors.join(' ')}</p>
						</div>
					{/each}
				</div>

				<!-- Tasks -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Tasks</div>
					{#each taskSpans as task}
						<div class="px-3 py-1.5 text-center border-l border-cork-600/30 flex items-center justify-center" style="grid-column: span {task.span};">
							<p class="text-sm font-bold text-cork-700">{task.title}</p>
						</div>
					{/each}
				</div>

				<!-- Stories -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Stories</div>
					{#each allStories as s}
						<div class="px-3 py-2 border-l border-cork-600/30 flex items-center justify-center">
							<p class="text-sm text-cork-800 text-center">{s.story.title}</p>
						</div>
					{/each}
				</div>

				<!-- Needs & Pains -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Needs &amp; Pains</div>
					{#each allStories as s}
						<div class="px-3 py-2 border-l border-cork-600/30">
							<div class="space-y-1.5">
								{#each s.story.gains as gain, i (i)}
									<p class="text-xs italic" style="color: #1e8449;">"{gain}"</p>
								{/each}
								{#each s.story.pains as pain, i (i)}
									<p class="text-xs italic" style="color: #c0392b;">"{pain}"</p>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				<!-- Touchpoint -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Touchpoint</div>
					{#each allStories as s}
						<div class="px-3 py-2 border-l border-cork-600/30 flex items-center justify-center">
							<span class="text-xs font-medium text-cork-700">{touchpointLabel(s.taskTitle)}</span>
						</div>
					{/each}
				</div>

				<!-- Feeling -->
				<div class="grid flex-1 border-b border-cork-600/30" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Feeling</div>
					{#each allStories as s, i}
						<div class="px-3 py-2 border-l border-cork-600/30 flex items-center justify-center">
							<span class="text-2xl">{storyEmoji(s.story, i)}</span>
						</div>
					{/each}
				</div>

				<!-- Ownership -->
				<div class="grid flex-1" style="grid-template-columns: 100px repeat({totalCols}, 1fr);">
					<div class="px-3 text-xs font-bold uppercase tracking-wider text-cork-500 flex items-center">Ownership</div>
					{#each allStories as s}
						<div class="px-3 py-2 border-l border-cork-600/30 flex items-center justify-center">
							{#if s.story.pic}
								<p class="text-sm font-medium text-cork-700">{s.story.pic}</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
