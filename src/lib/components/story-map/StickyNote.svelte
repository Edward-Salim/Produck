<script lang="ts">
	type Variant = 'activity' | 'task' | 'story';

	let {
		variant,
		colorIndex,
		title,
		id,
		done = false,
		pic = '',
		picColor = '',
		onclick = undefined
	}: {
		variant: Variant;
		colorIndex: number;
		title: string;
		id: string;
		done?: boolean;
		pic?: string;
		picColor?: string;
		onclick?: (() => void) | undefined;
	} = $props();

	const picColorMap: Record<string, string> = {
		c1: 'text-[#2471a3]',
		c2: 'text-[#1e8449]',
		c3: 'text-[#c0392b]',
		c4: 'text-[#7d3c98]',
		c5: 'text-[#ca6f1e]',
		c6: 'text-[#148f77]'
	};

	let picColorClass = $derived(picColor ? (picColorMap[picColor] ?? '') : '');

	/* Rotation: only stories rotate, matching original CSS nth-child pattern */
	const rotationValues = [-0.5, 0.35, -0.2];
	let rotation = $derived(variant === 'story' ? rotationValues[colorIndex % 3] : 0);

	/* Story yellow shade cycling */
	const storyColors = [
		{ from: '#fdf6dc', to: '#f5e9a0' },
		{ from: '#fef8e0', to: '#f7ecaa' },
		{ from: '#fcf4d6', to: '#f3e69e' }
	];
</script>

<button
	type="button"
	class="relative w-35 h-20 rounded-sm select-none overflow-visible shrink-0
		{variant === 'story' ? 'cursor-pointer hover:scale-105 transition-transform duration-150' : 'cursor-default'}"
	style="
		transform: rotate({rotation}deg);
		background: linear-gradient(170deg,
			{variant === 'activity' ? '#9ee4b4, #6dcf8c'
			: variant === 'task' ? '#d6eaf8, #aed6f1'
			: `${storyColors[colorIndex % 3].from}, ${storyColors[colorIndex % 3].to}`});
		box-shadow: 1px 2px 4px rgba(0,0,0,.1), 0 1px 1px rgba(0,0,0,.06);
	"
	{onclick}
>
	<!-- Pushpin dot -->
	<span
		class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full z-10"
		style="background: radial-gradient(circle,
			{variant === 'activity' ? '#3cb371, #2e9d5e'
			: variant === 'task' ? '#5dade2, #3498db'
			: '#e8c840, #d4b530'});
			box-shadow: 0 1px 2px rgba(0,0,0,.25);"
	></span>

	{#if variant === 'story'}
		<!-- Story layout -->
		<div class="flex flex-col px-2.5 pt-2.5 pb-1.5 h-full font-sans text-cork-800">
			<div class="flex items-start justify-between text-[9px] leading-tight opacity-50 font-semibold tracking-wide">
				<span>{id}</span>
				{#if pic}
					<span class="{picColorClass} font-semibold">{pic}</span>
				{/if}
			</div>
			<p class="text-[11px] font-semibold leading-snug mt-0.5 line-clamp-2 text-left">{title}</p>
		</div>

		{#if done}
			<span
				class="absolute -top-1 -right-1 w-3 h-3 rounded-sm bg-green-500 border border-green-700 flex items-center justify-center z-20"
			>
				<span class="text-white text-[8px] font-bold leading-none">&#10003;</span>
			</span>
		{/if}
	{:else}
		<!-- Activity / Task layout -->
		<div class="flex flex-col items-center justify-center h-full px-2 font-display text-cork-800">
			<span class="text-[9px] font-sans font-medium tracking-wide opacity-50">{id}</span>
			<p class="text-lg font-bold leading-tight mt-0.5 text-center line-clamp-2">{title}</p>
		</div>
	{/if}

	<!-- Folded corner -->
	<span
		class="absolute bottom-0 right-0 w-3 h-3 pointer-events-none"
		style="background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,.04) 50%);"
	></span>
</button>
