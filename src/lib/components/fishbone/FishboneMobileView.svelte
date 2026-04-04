<script lang="ts">
	import { diagram } from './fishbone-data.svelte.js';
	import { ChevronDown } from '@lucide/svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let expandedCategories = new SvelteSet<string>(
		diagram.categories.map((c) => c.id)
	);

	function toggleCategory(id: string) {
		if (expandedCategories.has(id)) {
			expandedCategories.delete(id);
		} else {
			expandedCategories.add(id);
		}
	}
</script>

<div class="space-y-3 px-1">
	<!-- Problem Statement Card -->
	<div
		class="rounded-xl p-4 shadow-md text-center"
		style="background: linear-gradient(135deg, #fdf6dc 0%, #f5e9a0 100%);"
	>
		<p class="font-display text-xl leading-snug text-cork-800">
			{diagram.problemStatement}
		</p>
	</div>

	<!-- Category Sections -->
	{#each diagram.categories as cat (cat.id)}
		{@const isExpanded = expandedCategories.has(cat.id)}

		<div
			class="rounded-lg border border-cork-200 bg-white/60 overflow-hidden"
			style="border-left: 4px solid {cat.color};"
		>
			<!-- Category Header -->
			<button
				type="button"
				class="flex w-full items-center gap-2 px-3 py-2 cursor-pointer"
				onclick={() => toggleCategory(cat.id)}
			>
				<ChevronDown
					size={20}
					class="shrink-0 text-cork-500 transition-transform {isExpanded ? '' : '-rotate-90'}"
				/>

				<span class="flex-1 text-left text-sm font-bold" style="color: {cat.color};">
					{cat.label}
				</span>

				<span
					class="shrink-0 flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
					style="background-color: {cat.color};"
				>
					{cat.causes.length}
				</span>
			</button>

			<!-- Expanded body -->
			{#if isExpanded}
				<div class="px-3 pb-3 pt-1">
					{#if cat.causes.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each cat.causes as cause (cause.id)}
								<span class="inline-flex items-center rounded-full bg-cork-100 px-3 py-1 text-sm text-cork-800">
									{cause.text}
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-xs text-cork-400 italic">No causes added</p>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
