<script lang="ts">
	import ImageUploader from "$lib/components/bg-remove/ImageUploader.svelte";
	import UpscaleEditor from "$lib/components/upscale/UpscaleEditor.svelte";
	import { loadFromCache, getHistory, removeHistoryItem } from '$lib/utils/image-cache.js';
	import { Download, ImagePlus, Zap, Sparkles, X } from '@lucide/svelte';

	let file = $state<File | null>(null);
	let checking = $state(true);
	let historyItems: { thumb: string; index: number }[] = $state([]);

	async function refreshHistory() {
		const items = await getHistory('upscale');
		historyItems.forEach((h) => URL.revokeObjectURL(h.thumb));
		historyItems = items.map((item, i) => ({
			thumb: item.thumb ? URL.createObjectURL(item.thumb) : '',
			index: i
		}));
	}

	async function loadHistoryAt(index: number) {
		const items = await getHistory('upscale');
		const cached = items[index];
		if (!cached) return;
		file = new File([cached.original], 'history.png', { type: 'image/png' });
	}

	async function removeHistory(index: number) {
		await removeHistoryItem('upscale', index);
		refreshHistory();
	}

	$effect(() => {
		refreshHistory();
		loadFromCache('upscale').then((cached) => {
			if (cached && cached.timestamp > Date.now() - 24 * 60 * 60 * 1000) {
				file = new File([cached.original], 'cached-image.png', { type: 'image/png' });
			}
			checking = false;
		}).catch(() => { checking = false; });
	});

	function handleUpload(f: File) {
		file = f;
	}

	function handleReset() {
		file = null;
		refreshHistory();
	}
</script>

<svelte:head><title>Image Upscaler - Produck</title></svelte:head>

<div>
	<header class="mb-6">
		<h1 class="font-display text-4xl text-cork-800">Image Upscaler</h1>
		<p class="text-sm text-cork-500 mt-0.5">Upload an image, upscale 2x or 4x, download the HD version</p>
	</header>

	{#if checking}
		<!-- waiting -->
	{:else if file}
		<UpscaleEditor {file} onreset={handleReset} />
	{:else}
		<div class="flex justify-center gap-6" style="height: calc(100vh - 180px);">
			<div class="min-w-0 flex items-center justify-center">
				<ImageUploader onupload={handleUpload} />
			</div>

			<div
				class="w-56 shrink-0 space-y-5 rounded-xl p-5 h-fit opacity-40 pointer-events-none select-none"
				style="background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
			>
				<div>
					<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Mode</p>
					<div class="grid grid-cols-2 gap-2">
						<div class="flex flex-col items-center gap-1 rounded-lg border-2 border-cork-700 bg-cork-700 px-3 py-2.5 text-xs font-medium text-cork-50"><Zap class="size-4" /> Fast</div>
						<div class="flex flex-col items-center gap-1 rounded-lg border-2 border-cork-200 bg-white/60 px-3 py-2.5 text-xs font-medium text-cork-600"><Sparkles class="size-4" /> Enhanced</div>
					</div>
				</div>
				<div>
					<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Scale</p>
					<div class="flex gap-1.5">
						<div class="flex-1 rounded-md py-1.5 text-center text-xs font-medium bg-cork-700 text-cork-50">2x</div>
						<div class="flex-1 rounded-md py-1.5 text-center text-xs font-medium bg-white/60 border border-cork-200 text-cork-600">4x</div>
					</div>
				</div>
				<div class="border-t border-cork-200"></div>
				<div class="space-y-2">
					<div class="flex w-full items-center justify-center gap-2 rounded-lg bg-cork-700 px-3 py-2 text-sm font-medium text-cork-50"><Download class="size-4" /> Download PNG</div>
					<div class="flex w-full items-center justify-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-500"><ImagePlus class="size-4" /> New Image</div>
				</div>
			</div>

			<!-- History column -->
			{#if historyItems.length > 0}
				<div class="shrink-0">
					<p class="text-[10px] font-semibold uppercase tracking-wider text-cork-400 mb-1.5">History</p>
					<div class="grid grid-cols-3 gap-1.5">
						{#each historyItems as item (item.index)}
							<div class="relative group">
								<button
									type="button"
									class="w-10 h-10 rounded-md overflow-hidden border-2 border-cork-200 transition-colors hover:border-cork-500"
									onclick={() => loadHistoryAt(item.index)}
								>
									{#if item.thumb}
										<img src={item.thumb} alt="History {item.index + 1}" class="w-full h-full object-cover" />
									{:else}
										<div class="w-full h-full bg-cork-200 flex items-center justify-center text-[9px] text-cork-500">{item.index + 1}</div>
									{/if}
								</button>
								<button
									type="button"
									class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cork-600 text-cork-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
									onclick={() => removeHistory(item.index)}
								>
									<X class="size-2.5" />
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>
