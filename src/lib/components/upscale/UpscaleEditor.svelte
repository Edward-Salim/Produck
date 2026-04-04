<script module lang="ts">
	let cachedModel: { tf: any; model: any; processor: any } | null = null;
	let pendingResult: Blob | null = null;
	export function setPendingResult(blob: Blob | null) {
		pendingResult = blob;
	}
</script>

<script lang="ts">
	import { Download, LoaderCircle, ImagePlus, X } from '@lucide/svelte';
	import { saveToCache, getHistory, createThumb, removeHistoryItem } from '$lib/utils/image-cache.js';

	let { file, onreset: _onreset }: { file: File; onreset: () => void } = $props();

	function onreset() {
		_onreset();
	}

	let processing = $state(true);
	let progress = $state('Loading...');

	let origWidth = $state(0);
	let origHeight = $state(0);
	let origFileSize = $state(0);
	let resultWidth = $state(0);
	let resultHeight = $state(0);
	let resultFileSize = $state(0);

	let format: 'png' | 'jpeg' | 'webp' = $state('png');
	const formats = [
		{ key: 'png' as const, label: 'PNG', mime: 'image/png', ext: 'png' },
		{ key: 'jpeg' as const, label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
		{ key: 'webp' as const, label: 'WEBP', mime: 'image/webp', ext: 'webp' }
	];
	let activeFormat = $derived(formats.find((f) => f.key === format)!);

	let sliderPos = $state(50);
	let isDragging = $state(false);

	let historyItems: { thumb: string; index: number }[] = $state([]);

	let containerEl: HTMLDivElement | undefined = $state(undefined);
	let beforeCanvas: HTMLCanvasElement | undefined = $state(undefined);
	let afterCanvas: HTMLCanvasElement | undefined = $state(undefined);

	let lastFileRef: File | null = null;

	function formatSize(bytes: number): string {
		if (bytes === 0) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}
	let loadedFromHistory = false;
	let cachedResultBlob: Blob | null = null;

	const MAX_SIDE = 512;
	const MODEL_ID = 'Xenova/swin2SR-realworld-sr-x4-64-bsrgan-psnr';

	async function loadModel() {
		if (cachedModel) return cachedModel;

		progress = 'Loading AI library...';
		const tf = await import('@huggingface/transformers');
		tf.env.allowLocalModels = false;

		progress = 'Downloading AI model...';
		const model = await tf.AutoModel.from_pretrained(MODEL_ID, {
			dtype: 'fp32',
			device: 'wasm',
			progress_callback: (p: { status: string; progress?: number }) => {
				if (p.progress !== undefined) {
					progress = `Downloading model: ${Math.round(p.progress)}%`;
				}
			}
		} as any);

		progress = 'Loading processor...';
		const processor = await tf.AutoProcessor.from_pretrained(MODEL_ID);

		cachedModel = { tf, model, processor };
		return cachedModel;
	}

	function tensorToCanvas(tensor: any): HTMLCanvasElement {
		// tensor shape: [1, 3, H, W] - CHW float format
		const dims = tensor.dims;
		const outH = dims[2];
		const outW = dims[3];
		const data = tensor.data;

		// Detect value range: [0,1] float or [0,255] pixel values
		let maxVal = 0;
		const sampleSize = Math.min(data.length, 1000);
		for (let i = 0; i < sampleSize; i++) {
			if (data[i] > maxVal) maxVal = data[i];
		}
		const scale = maxVal > 2 ? 1 : 255;

		const canvas = document.createElement('canvas');
		canvas.width = outW;
		canvas.height = outH;
		const ctx = canvas.getContext('2d')!;
		const imageData = ctx.createImageData(outW, outH);

		for (let y = 0; y < outH; y++) {
			for (let x = 0; x < outW; x++) {
				const pixelIdx = (y * outW + x) * 4;
				for (let c = 0; c < 3; c++) {
					const val = data[c * outH * outW + y * outW + x] * scale;
					imageData.data[pixelIdx + c] = Math.round(Math.max(0, Math.min(255, val)));
				}
				imageData.data[pixelIdx + 3] = 255;
			}
		}

		ctx.putImageData(imageData, 0, 0);
		return canvas;
	}

	function resizeIfNeeded(img: HTMLImageElement): HTMLCanvasElement {
		const w = img.naturalWidth;
		const h = img.naturalHeight;
		const longest = Math.max(w, h);

		const canvas = document.createElement('canvas');

		if (longest > MAX_SIDE) {
			const scale = MAX_SIDE / longest;
			canvas.width = Math.round(w * scale);
			canvas.height = Math.round(h * scale);
		} else {
			canvas.width = w;
			canvas.height = h;
		}

		const ctx = canvas.getContext('2d')!;
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		return canvas;
	}

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
		loadedFromHistory = true;
		cachedResultBlob = cached.result;
		file = new File([cached.original], 'history.png', { type: 'image/png' });
	}

	async function removeHistory(index: number) {
		await removeHistoryItem('upscale', index);
		const remaining = await getHistory('upscale');
		if (remaining.length === 0) {
			onreset();
		} else {
			refreshHistory();
		}
	}

	function handleDownload() {
		if (!afterCanvas) return;
		afterCanvas.toBlob((blob) => {
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `enhanced-${resultWidth}x${resultHeight}.${activeFormat.ext}`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}, activeFormat.mime, format === 'jpeg' ? 0.92 : undefined);
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

	$effect(() => {
		const currentFile = file;
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
			origFileSize = currentFile.size;

			await new Promise((r) => requestAnimationFrame(r));

			try {
				let srCanvas: HTMLCanvasElement;

				const resultBlob = cachedResultBlob ?? pendingResult;
				if (resultBlob) {
					// Load cached result directly — skip AI
					const resultImg = new Image();
					const resultUrl = URL.createObjectURL(resultBlob);
					srCanvas = await new Promise<HTMLCanvasElement>((resolve) => {
						resultImg.onload = () => {
							const c = document.createElement('canvas');
							c.width = resultImg.naturalWidth;
							c.height = resultImg.naturalHeight;
							c.getContext('2d')!.drawImage(resultImg, 0, 0);
							URL.revokeObjectURL(resultUrl);
							resolve(c);
						};
						resultImg.src = resultUrl;
					});
					cachedResultBlob = null;
					pendingResult = null;
				} else {
					// Run AI enhancement
					const inputCanvas = resizeIfNeeded(img);
					const { tf, model, processor } = await loadModel();

					progress = 'Enhancing image with AI...';
					await new Promise((r) => setTimeout(r, 10));

					const inputBlob = await new Promise<Blob>((resolve) =>
						inputCanvas.toBlob((b) => resolve(b!), 'image/png')
					);
					const inputUrl = URL.createObjectURL(inputBlob);

					const rawImage = await tf.RawImage.fromURL(inputUrl);
					URL.revokeObjectURL(inputUrl);

					const { pixel_values } = await processor(rawImage);

					progress = 'Running AI enhancement...';
					const output = await model({ pixel_values });

					srCanvas = tensorToCanvas(output.reconstruction);
				}

				resultWidth = srCanvas.width;
				resultHeight = srCanvas.height;

				// Before: original stretched to AI output size for fair comparison
				beforeCanvas!.width = srCanvas.width;
				beforeCanvas!.height = srCanvas.height;
				const bCtx = beforeCanvas!.getContext('2d')!;
				bCtx.imageSmoothingEnabled = true;
				bCtx.imageSmoothingQuality = 'high';
				bCtx.drawImage(img, 0, 0, srCanvas.width, srCanvas.height);

				// After: AI enhanced result
				afterCanvas!.width = srCanvas.width;
				afterCanvas!.height = srCanvas.height;
				afterCanvas!.getContext('2d')!.drawImage(srCanvas, 0, 0);

				processing = false;

				// Get enhanced file size
				afterCanvas!.toBlob((blob) => {
					if (blob) resultFileSize = blob.size;
				}, 'image/png');

				const isNewFile = !loadedFromHistory;
				lastFileRef = currentFile;
				loadedFromHistory = false;

				if (isNewFile) {
					afterCanvas!.toBlob(async (blob) => {
						if (blob) {
							const thumb = await createThumb(blob);
							await saveToCache('upscale', {
								original: currentFile,
								result: blob,
								width: srCanvas.width,
								height: srCanvas.height,
								thumb,
								meta: { origWidth, origHeight },
								timestamp: Date.now()
							});
							refreshHistory();
						}
					}, 'image/png');
				}
			} catch (err) {
				console.error('AI enhancement failed:', err);
				progress = 'Error: AI processing failed';
				processing = false;
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

<div class="flex flex-col items-center gap-4 md:flex-row md:justify-center md:items-start md:gap-6" style="height: calc(100vh - 180px);">
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
			<canvas bind:this={beforeCanvas} class="absolute inset-0 h-full w-full" style="clip-path: inset(0 {100 - sliderPos}% 0 0);"></canvas>
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
				<img src={URL.createObjectURL(file)} alt="" class="invisible block max-w-full max-h-[50vh] md:max-h-[calc(100vh-260px)]" />
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
		class="w-full max-w-sm md:w-56 md:shrink-0 space-y-5 rounded-xl p-5 h-fit"
		style="background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
	>
		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Dimensions</p>
			<div class="space-y-1.5 text-sm">
				<div class="flex justify-between">
					<span class="text-cork-500">Original</span>
					<span class="font-medium text-cork-700">{origWidth} x {origHeight}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-cork-500">Enhanced</span>
					<span class="font-medium text-cork-700">{resultWidth > 0 ? `${resultWidth} x ${resultHeight}` : '—'}</span>
				</div>
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">File Size</p>
			<div class="space-y-1.5 text-sm">
				<div class="flex justify-between">
					<span class="text-cork-500">Original</span>
					<span class="font-medium text-cork-700">{formatSize(origFileSize)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-cork-500">Enhanced</span>
					<span class="font-medium text-cork-700">{resultFileSize > 0 ? formatSize(resultFileSize) : '—'}</span>
				</div>
			</div>
		</div>

		<div>
			<p class="mb-2 text-xs font-semibold uppercase tracking-wider text-cork-500">Format</p>
			<div class="flex gap-1.5">
				{#each formats as f (f.key)}
					<button
						type="button"
						class="flex-1 rounded-md py-1.5 text-xs font-medium transition-colors {format === f.key ? 'bg-cork-700 text-cork-50' : 'bg-white/60 border border-cork-200 text-cork-600 hover:border-cork-300'}"
						disabled={processing}
						onclick={() => (format = f.key)}
					>
						{f.label}
					</button>
				{/each}
			</div>
		</div>

		<div class="border-t border-cork-200"></div>

		<div class="space-y-2">
			<button type="button" class="flex w-full items-center justify-center gap-2 rounded-lg bg-cork-700 px-3 py-2 text-sm font-medium text-cork-50 hover:bg-cork-800 disabled:opacity-40" disabled={processing} onclick={handleDownload}>
				<Download class="size-4" /> Download {activeFormat.label}
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
			<div class="flex flex-wrap gap-1.5 md:grid md:grid-cols-3">
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
