<script lang="ts">
	import { Download, LoaderCircle, ImagePlus, Zap, Sparkles, X } from '@lucide/svelte';
	import { saveToCache, loadFromCache, getHistory, createThumb, removeHistoryItem } from '$lib/utils/image-cache.js';

	let { file, onreset: _onreset }: { file: File; onreset: () => void } = $props();

	function onreset() {
		_onreset();
	}

	let processing = $state(true);
	let progress = $state('Loading...');
	let mode: 'fast' | 'enhanced' = $state('fast');
	let scale = $state(2);

	let origWidth = $state(0);
	let origHeight = $state(0);
	let upWidth = $derived(origWidth * scale);
	let upHeight = $derived(origHeight * scale);

	let sliderPos = $state(50);
	let isDragging = $state(false);

	let historyItems: { thumb: string; index: number }[] = $state([]);

	let containerEl: HTMLDivElement | undefined = $state(undefined);
	let beforeCanvas: HTMLCanvasElement | undefined = $state(undefined);
	let afterCanvas: HTMLCanvasElement | undefined = $state(undefined);

	// Track current file identity to avoid re-saving on mode/scale change
	let lastFileRef: File | null = null;

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

	function sharpenCanvas(ctx: CanvasRenderingContext2D, w: number, h: number, strength = 1) {
		const imageData = ctx.getImageData(0, 0, w, h);
		const src = imageData.data;
		const out = new Uint8ClampedArray(src);
		const center = 4 * strength + 1;
		const edge = -strength;
		const k = [0, edge, 0, edge, center, edge, 0, edge, 0];

		for (let y = 1; y < h - 1; y++) {
			for (let x = 1; x < w - 1; x++) {
				for (let c = 0; c < 3; c++) {
					let sum = 0;
					for (let ky = 0; ky < 3; ky++) {
						for (let kx = 0; kx < 3; kx++) {
							sum += src[((y + ky - 1) * w + (x + kx - 1)) * 4 + c] * k[ky * 3 + kx];
						}
					}
					out[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, sum));
				}
			}
		}
		imageData.data.set(out);
		ctx.putImageData(imageData, 0, 0);
	}

	function upscaleImage(srcCanvas: HTMLCanvasElement, targetScale: number, enhanced: boolean): HTMLCanvasElement {
		let current = srcCanvas;
		let remaining = targetScale;
		while (remaining >= 2) {
			const next = document.createElement('canvas');
			next.width = current.width * 2;
			next.height = current.height * 2;
			const ctx = next.getContext('2d')!;
			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = 'high';
			ctx.drawImage(current, 0, 0, next.width, next.height);
			if (enhanced) {
				sharpenCanvas(ctx, next.width, next.height, 1.2);
				sharpenCanvas(ctx, next.width, next.height, 0.5);
			} else {
				sharpenCanvas(ctx, next.width, next.height, 0.8);
			}
			current = next;
			remaining /= 2;
		}
		return current;
	}

	function handleDownload() {
		if (!afterCanvas) return;
		afterCanvas.toBlob((blob) => {
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `upscaled-${upWidth}x${upHeight}.png`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}, 'image/png');
	}

	function updateSlider(e: PointerEvent) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		sliderPos = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
	}

	function handleSliderDown(e: PointerEvent) {
		isDragging = true;
		containerEl?.setPointerCapture(e.pointerId);
		updateSlider(e);
	}

	function handleSliderMove(e: PointerEvent) {
		if (!isDragging) return;
		updateSlider(e);
	}

	function handleSliderUp() {
		isDragging = false;
	}

	// React to file, mode, or scale changes
	$effect(() => {
		const currentFile = file;
		const _mode = mode;
		const _scale = scale;
		if (!beforeCanvas || !afterCanvas) return;
		processFile(currentFile);
	});

	function processFile(currentFile: File) {
		if (!beforeCanvas || !afterCanvas) return;

		processing = true;
		progress = 'Loading...';
		refreshHistory();

		const img = new Image();
		const url = URL.createObjectURL(currentFile);

		img.onload = async () => {
			origWidth = img.naturalWidth;
			origHeight = img.naturalHeight;

			const uw = origWidth * scale;
			const uh = origHeight * scale;

			await new Promise((r) => requestAnimationFrame(r));

			beforeCanvas!.width = uw;
			beforeCanvas!.height = uh;
			const beforeCtx = beforeCanvas!.getContext('2d')!;
			beforeCtx.imageSmoothingEnabled = false;
			beforeCtx.drawImage(img, 0, 0, uw, uh);

			const srcCanvas = document.createElement('canvas');
			srcCanvas.width = origWidth;
			srcCanvas.height = origHeight;
			srcCanvas.getContext('2d')!.drawImage(img, 0, 0);

			progress = mode === 'enhanced' ? 'Enhancing...' : 'Upscaling...';
			await new Promise((r) => setTimeout(r, 10));

			const result = upscaleImage(srcCanvas, scale, mode === 'enhanced');

			afterCanvas!.width = result.width;
			afterCanvas!.height = result.height;
			afterCanvas!.getContext('2d')!.drawImage(result, 0, 0);

			processing = false;

			// Only save to history if it's a new file (not a mode/scale re-process)
			const isNewFile = lastFileRef !== currentFile;
			lastFileRef = currentFile;

			if (isNewFile) {
				afterCanvas!.toBlob(async (blob) => {
					if (blob) {
						const thumb = await createThumb(blob);
						await saveToCache('upscale', {
							original: currentFile, result: blob,
							width: result.width, height: result.height, thumb,
							meta: { origWidth, origHeight },
							timestamp: Date.now()
						});
						refreshHistory();
					}
				}, 'image/png');
			}

			URL.revokeObjectURL(url);
		};

		img.onerror = () => {
			progress = 'Error: failed to load image';
			processing = false;
			URL.revokeObjectURL(url);
		};
		img.src = url;
	}
</script>

<div class="flex justify-center items-start gap-6" style="height: calc(100vh - 180px);">
	<!-- Left: Canvas -->
	<div class="min-w-0 flex flex-col items-start justify-start gap-4">
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={containerEl}
			class="relative overflow-hidden rounded-xl max-h-full w-fit select-none"
			style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12); cursor: ew-resize;"
			onpointerdown={handleSliderDown}
			onpointermove={handleSliderMove}
			onpointerup={handleSliderUp}
			onpointerleave={handleSliderUp}
		>
			<canvas bind:this={beforeCanvas} class="absolute inset-0 h-full w-full" style="clip-path: inset(0 {100 - sliderPos}% 0 0); image-rendering: pixelated;"></canvas>
			<canvas bind:this={afterCanvas} class="absolute inset-0 h-full w-full" style="clip-path: inset(0 0 0 {sliderPos}%);"></canvas>

			{#if !processing && origWidth > 0}
				<div class="absolute top-0 bottom-0 w-0.5 bg-cork-600 shadow-md z-10 pointer-events-none" style="left: {sliderPos}%;">
					<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cork-600 shadow-lg flex items-center justify-center">
						<span class="text-cork-100 text-xs font-bold">&#x2194;</span>
					</div>
				</div>
				<div class="absolute top-2 left-2 bg-cork-800/70 text-cork-50 text-[10px] font-medium px-1.5 py-0.5 rounded z-10 pointer-events-none">Before</div>
				<div class="absolute top-2 right-2 bg-cork-800/70 text-cork-50 text-[10px] font-medium px-1.5 py-0.5 rounded z-10 pointer-events-none">After</div>
			{/if}

			{#if origWidth > 0 && origHeight > 0}
				<img src={URL.createObjectURL(file)} alt="" class="invisible block max-w-full" style="max-height: calc(100vh - 260px);" />
			{:else}
				<div class="flex h-60 w-80 items-center justify-center">
					<LoaderCircle class="size-8 animate-spin text-cork-500" />
				</div>
			{/if}

			{#if processing}
				<div class="absolute inset-0 flex flex-col items-center justify-center bg-cork-900/40 backdrop-blur-sm">
					<LoaderCircle class="mb-3 size-10 animate-spin text-cork-50" />
					<p class="text-sm font-medium text-cork-50">{progress}</p>
				</div>
			{/if}
		</div>

	</div>

	<!-- Right: Tools -->
	<div
		class="w-56 shrink-0 space-y-5 rounded-xl p-5 h-fit"
		style="background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
	>
		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Mode</p>
			<div class="grid grid-cols-2 gap-2">
				<button type="button" class="flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-colors {mode === 'fast' ? 'border-cork-700 bg-cork-700 text-cork-50' : 'border-cork-200 bg-white/60 text-cork-600 hover:border-cork-300'}" disabled={processing} onclick={() => (mode = 'fast')}>
					<Zap class="size-4" /> Fast
				</button>
				<button type="button" class="flex flex-col items-center gap-1 rounded-lg border-2 px-3 py-2.5 text-xs font-medium transition-colors {mode === 'enhanced' ? 'border-cork-700 bg-cork-700 text-cork-50' : 'border-cork-200 bg-white/60 text-cork-600 hover:border-cork-300'}" disabled={processing} onclick={() => (mode = 'enhanced')}>
					<Sparkles class="size-4" /> Enhanced
				</button>
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Scale</p>
			<div class="flex gap-1.5">
				{#each [2, 4] as s (s)}
					<button type="button" class="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors {scale === s ? 'bg-cork-700 text-cork-50' : 'bg-white/60 border border-cork-200 text-cork-600 hover:border-cork-300'}" disabled={processing} onclick={() => (scale = s)}>
						{s}x
					</button>
				{/each}
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Dimensions</p>
			<div class="space-y-1.5 text-sm">
				<div class="flex justify-between">
					<span class="text-cork-500">Before</span>
					<span class="font-medium text-cork-700">{origWidth} x {origHeight}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-cork-500">After</span>
					<span class="font-medium text-cork-700">{upWidth} x {upHeight}</span>
				</div>
			</div>
		</div>

		<div class="border-t border-cork-200"></div>

		<div class="space-y-2">
			<button type="button" class="flex w-full items-center justify-center gap-2 rounded-lg bg-cork-700 px-3 py-2 text-sm font-medium text-cork-50 hover:bg-cork-800 disabled:opacity-40" disabled={processing} onclick={handleDownload}>
				<Download class="size-4" /> Download PNG
			</button>
			<button type="button" class="flex w-full items-center justify-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-500 hover:bg-cork-200/50" onclick={onreset}>
				<ImagePlus class="size-4" /> New Image
			</button>
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
						class="w-10 h-10 rounded-md overflow-hidden border-2 transition-colors hover:border-cork-500
							{item.index === 0 ? 'border-cork-600' : 'border-cork-200'}"
						disabled={processing}
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
