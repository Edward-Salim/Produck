<script lang="ts">
	import StoryMapBoard from "$lib/components/story-map/StoryMapBoard.svelte";

	let { data } = $props();

	let storyMap = $derived(data.storyMap);

	let mainName = $derived(() => {
		const name = storyMap?.product ?? '';
		const match = name.match(/^([^(]+?)(?:\s*\((.+)\))?$/);
		return { primary: match?.[1]?.trim() ?? name, subtitle: match?.[2]?.trim() ?? '' };
	});
</script>

<svelte:head><title>{storyMap ? `Story Map: ${storyMap.product}` : 'Story Map'}</title></svelte:head>

{#if storyMap}
	<div>
		<header class="mb-6">
			<h1 class="font-display text-4xl text-cork-800">{mainName().primary}</h1>
			{#if mainName().subtitle}
				<div class="flex items-center justify-between gap-4 mt-0.5">
					<p class="text-sm text-cork-500">{mainName().subtitle}</p>
					<div class="flex flex-wrap items-center gap-2 shrink-0">
						{#each storyMap.actors as actor (actor.label)}
							<span class="bg-cork-300/50 text-cork-600 rounded-md px-3 py-1.5 text-sm">
								{actor.emoji} {actor.label}
							</span>
						{/each}
					</div>
				</div>
			{:else}
				<div class="flex justify-end gap-2 mt-2">
					{#each storyMap.actors as actor (actor.label)}
						<span class="bg-cork-300/50 text-cork-600 rounded-md px-3 py-1.5 text-sm">
							{actor.emoji} {actor.label}
						</span>
					{/each}
				</div>
			{/if}
		</header>

		<StoryMapBoard data={storyMap} />
	</div>
{:else}
	<div class="flex items-center justify-center h-64 text-cork-500">
		<p>No project selected. Pick one from the sidebar.</p>
	</div>
{/if}
