<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import type { Story } from "$lib/types/story-map.js";

	const PIC_COLORS: Record<string, string> = {
		c1: "#2471a3",
		c2: "#1e8449",
		c3: "#c0392b",
		c4: "#7d3c98",
		c5: "#ca6f1e",
		c6: "#148f77",
	};

	let { open = $bindable(false), story }: { open: boolean; story: Story | null } = $props();

	let picHex = $derived(story ? PIC_COLORS[story.picColor] ?? "#555" : "#555");
	let hasConnextra = $derived(story?.asA && story?.wantTo);
</script>

<Dialog.Root bind:open onOpenChange={(v) => (open = v)}>
	<Dialog.Content
		class="bg-gradient-to-br from-[#fdf6dc] to-[#f5e9a0] border-none sm:max-w-[420px]"
	>
		{#if story}
			<Dialog.Header class="gap-1">
				<div class="flex items-center justify-between">
					<span class="font-mono text-xs text-cork-500">{story.id}</span>
					<Badge
						class="text-[11px] font-semibold text-white"
						style="background-color: {picHex};"
					>
						{story.pic}
					</Badge>
				</div>
				<Dialog.Title class="text-lg font-bold text-cork-800">
					{story.title}
				</Dialog.Title>
			</Dialog.Header>

			<Dialog.Description class="sr-only">
				Detail for user story {story.id}
			</Dialog.Description>

			<div class="flex flex-col gap-4">
				{#if hasConnextra}
					<div class="border-l-3 border-[#c9b458] bg-black/5 rounded-r-sm px-3.5 py-2.5 text-sm text-cork-700">
						<strong>As a</strong> {story.asA},
						<strong>I want to</strong> {story.wantTo}
						{#if story.soThat}
							<strong>so that</strong> {story.soThat}
						{/if}
					</div>
				{/if}

				<div class="grid grid-cols-2 gap-3">
					<div>
						<p class="mb-1.5 text-[10px] font-bold tracking-widest text-cork-500">PAINS</p>
						{#if story.pains && story.pains.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each story.pains as pain (pain)}
									<Badge class="bg-[#fadbd8] text-[#922b21] hover:bg-[#fadbd8]">
										{pain}
									</Badge>
								{/each}
							</div>
						{:else}
							<span class="text-sm text-cork-400">&ndash;</span>
						{/if}
					</div>

					<div>
						<p class="mb-1.5 text-[10px] font-bold tracking-widest text-cork-500">GAINS</p>
						{#if story.gains && story.gains.length > 0}
							<div class="flex flex-wrap gap-1">
								{#each story.gains as gain (gain)}
									<Badge class="bg-[#d5f5e3] text-[#196f3d] hover:bg-[#d5f5e3]">
										{gain}
									</Badge>
								{/each}
							</div>
						{:else}
							<span class="text-sm text-cork-400">&ndash;</span>
						{/if}
					</div>
				</div>

				{#if story.details && story.details.length > 0}
					<div>
						<p class="mb-1.5 text-[10px] font-bold tracking-widest text-cork-500">DETAILS</p>
						<ul class="list-disc space-y-0.5 pl-4 text-sm text-cork-700">
							{#each story.details as detail (detail)}
								<li>{detail}</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
