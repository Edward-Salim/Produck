<script lang="ts">
	import FishboneDiagram from '$lib/components/fishbone/FishboneDiagram.svelte';
	import FishboneMobileView from '$lib/components/fishbone/FishboneMobileView.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte.js';

	const isMobile = new IsMobile();
</script>

<svelte:head><title>Root Cause Analysis - Produck</title></svelte:head>

<div>
	<header class="mb-4">
		<h1 class="font-display text-2xl md:text-4xl text-cork-800">Root Cause Analysis</h1>
		<p class="text-sm text-cork-500 mt-0.5">Ishikawa / Fishbone Diagram</p>
	</header>

	{#if isMobile.current}
		<FishboneMobileView />
	{:else}
		<FishboneDiagram />
	{/if}
</div>
