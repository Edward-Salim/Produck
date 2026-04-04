<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Badge } from "$lib/components/ui/badge/index.js";
	import { Square, SquareCheck } from "@lucide/svelte";
	import { invalidateAll } from "$app/navigation";
	import type { Story, StoryCheckedAC } from "$lib/types/story-map.js";

	const PIC_COLORS: Record<string, string> = {
		c1: "#1a5276",
		c2: "#145a32",
		c3: "#7b241c",
		c4: "#5b2c6f",
		c5: "#935116",
		c6: "#0e6655",
	};

	let { open = $bindable(false), story }: { open: boolean; story: Story | null } = $props();

	let picHex = $derived(story ? PIC_COLORS[story.picColor] ?? "#3d3529" : "#3d3529");
	let hasConnextra = $derived(story?.asA && story?.wantTo);

	function isChecked(index: number): boolean {
		return story?.checkedAcs?.some((ac) => ac.index === index) ?? false;
	}

	let allACDone = $derived(
		!!story?.details && story.details.length > 0 && (story.checkedAcs?.length ?? 0) >= story.details.length
	);

	let syncTimer: ReturnType<typeof setTimeout> | null = null;

	function toggleAC(index: number) {
		if (!story) return;
		const current = [...(story.checkedAcs ?? [])];
		const existing = current.findIndex((a) => a.index === index);

		if (existing >= 0) {
			current.splice(existing, 1);
		} else {
			current.push({ index, checkedAt: new Date().toISOString() });
		}

		// Optimistic update
		story.checkedAcs = current;

		const shouldBeDone = story.details ? current.length >= story.details.length : false;

		if (syncTimer) clearTimeout(syncTimer);
		syncTimer = setTimeout(() => {
			fetch('/api/story', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ code: story!.id, checkedAcs: current, done: shouldBeDone })
			});
		}, 500);
	}

	function handleClose(v: boolean) {
		open = v;
		if (!v) {
			if (syncTimer) {
				clearTimeout(syncTimer);
				syncTimer = null;
				if (story) {
					const current = story.checkedAcs ?? [];
					const shouldBeDone = story.details ? current.length >= story.details.length : false;
					fetch('/api/story', {
						method: 'PATCH',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ code: story.id, checkedAcs: current, done: shouldBeDone })
					}).then(() => invalidateAll());
					return;
				}
			}
			invalidateAll();
		}
	}
</script>

<Dialog.Root bind:open onOpenChange={handleClose}>
	<Dialog.Content
		class="bg-gradient-to-br from-[#fdf6dc] to-[#f5e9a0] border-none sm:max-w-[420px]"
	>
		{#if story}
			<Dialog.Header class="gap-1">
				<div class="flex items-center justify-between pr-8">
					<span class="font-mono text-xs text-cork-500">{story.id}</span>
					<Badge
						class="text-[11px] font-semibold text-white"
						style="background-color: {picHex};"
					>
						{story.pic}
					</Badge>
				</div>
				<Dialog.Title class="text-lg font-bold text-cork-800 {allACDone ? 'line-through text-cork-400' : ''}">
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

				{#if story.details && story.details.length > 0}
					<div>
						<p class="mb-2 text-[10px] font-bold tracking-widest text-cork-500">ACCEPTANCE CRITERIA</p>
						<ul class="space-y-1.5">
							{#each story.details as detail, i (detail)}
								{@const checked = isChecked(i)}
								<li class="flex items-start gap-2">
									<button
										type="button"
										class="shrink-0 mt-0.5 cursor-pointer"
										onclick={() => toggleAC(i)}
									>
										{#if checked}
											<SquareCheck class="size-4 text-green-700" />
										{:else}
											<Square class="size-4 text-cork-400" />
										{/if}
									</button>
									<span class="text-sm {checked ? 'line-through text-cork-400' : 'text-cork-700'}">{detail}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
