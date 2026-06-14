<script module lang="ts">
  let cachedTf: any = null;
  let cachedModel: any = null;
  let cachedProcessor: any = null;
</script>

<script lang="ts">
  import { Download, Eraser, Paintbrush, LoaderCircle, ImagePlus, Sparkles, Scissors } from '@lucide/svelte';

  let { file, onreset: _onreset }: { file: File; onreset: () => void } = $props();

  function onreset() {
    _onreset();
  }

  let processing = $state(true);
  let progress = $state('Loading model...');
  let brushMode: 'erase' | 'restore' = $state('restore');
  let brushSize = $state(30);
  let isPainting = $state(false);
  let removalMode: 'ai' | 'simple' = $state('simple');

  let maskData: Uint8ClampedArray | null = $state(null);
  let undoStack: Uint8ClampedArray[] = $state([]);
  let modeCache: Record<string, Uint8ClampedArray> = $state({});

  let width = $state(0);
  let height = $state(0);

  let checkerboardCanvas: HTMLCanvasElement | undefined = $state(undefined);
  let resultCanvas: HTMLCanvasElement | undefined = $state(undefined);
  let brushCanvas: HTMLCanvasElement | undefined = $state(undefined);
  let originalCanvas: HTMLCanvasElement | undefined = $state(undefined);

  async function loadModel() {
    if (cachedTf && cachedModel && cachedProcessor) {
      return { tf: cachedTf, model: cachedModel, processor: cachedProcessor };
    }

    progress = 'Loading library...';
    const tf = await import('@huggingface/transformers');
    tf.env.allowLocalModels = false;
    cachedTf = tf;

    progress = 'Downloading RMBG-1.4 model...';
    const model = await tf.AutoModel.from_pretrained('briaai/RMBG-1.4', {
      dtype: 'quantized',
      device: 'wasm',
      progress_callback: (p: { status: string; progress?: number }) => {
        if (p.progress !== undefined) {
          progress = `Downloading: ${Math.round(p.progress)}%`;
        }
      }
    } as any);

    progress = 'Loading processor...';
    const processor = await tf.AutoProcessor.from_pretrained('briaai/RMBG-1.4');

    cachedModel = model;
    cachedProcessor = processor;
    return { tf, model, processor };
  }

  function drawCheckerboard() {
    if (!checkerboardCanvas) return;
    const ctx = checkerboardCanvas.getContext('2d');
    if (!ctx) return;
    const s = 10;
    for (let y = 0; y < height; y += s)
      for (let x = 0; x < width; x += s) {
        ctx.fillStyle = (Math.floor(x / s) + Math.floor(y / s)) % 2 === 0 ? '#fff' : '#e5e5e5';
        ctx.fillRect(x, y, s, s);
      }
  }

  function applyMask() {
    if (!maskData || !originalCanvas || !resultCanvas) return;
    const origCtx = originalCanvas.getContext('2d', { willReadFrequently: true })!;
    const resultCtx = resultCanvas.getContext('2d', { willReadFrequently: true })!;
    const d = origCtx.getImageData(0, 0, width, height);
    for (let i = 0; i < maskData.length; i++) d.data[i * 4 + 3] = maskData[i];
    resultCtx.putImageData(d, 0, 0);
  }

  function handleDownload() {
    if (!resultCanvas) return;
    const originalName = file.name.replace(/\.[^.]+$/, '');
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
    const downloadName = `bg-removed-${originalName}.${ext === 'jpg' || ext === 'jpeg' ? ext : 'png'}`;

    resultCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 'image/png');
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    maskData = undoStack[undoStack.length - 1];
    undoStack = undoStack.slice(0, -1);
    applyMask();
  }

  function getCanvasCoords(e: PointerEvent): { x: number; y: number } | null {
    if (!brushCanvas) return null;
    const rect = brushCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (brushCanvas.width / rect.width),
      y: (e.clientY - rect.top) * (brushCanvas.height / rect.height)
    };
  }

  function paintAtPosition(x: number, y: number) {
    if (!maskData) return;
    const r = brushSize,
      r2 = r * r;
    const x0 = Math.max(0, Math.floor(x - r)),
      x1 = Math.min(width - 1, Math.ceil(x + r));
    const y0 = Math.max(0, Math.floor(y - r)),
      y1 = Math.min(height - 1, Math.ceil(y + r));

    const value = brushMode === 'erase' ? 0 : 255;
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dist2 = (px - x) ** 2 + (py - y) ** 2;
        if (dist2 > r2) continue;
        maskData[py * width + px] = value;
      }
    }
  }

  function drawBrushIndicator(x: number, y: number) {
    if (!brushCanvas) return;
    const ctx = brushCanvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.strokeStyle = brushMode === 'erase' ? 'rgba(239,68,68,.7)' : 'rgba(34,197,94,.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function handlePointerDown(e: PointerEvent) {
    if (processing) return;
    const c = getCanvasCoords(e);
    if (!c || !maskData) return;
    isPainting = true;
    undoStack = [...undoStack, new Uint8ClampedArray(maskData)];
    brushCanvas?.setPointerCapture(e.pointerId);
    paintAtPosition(c.x, c.y);
    applyMask();
    drawBrushIndicator(c.x, c.y);
  }

  function handlePointerMove(e: PointerEvent) {
    const c = getCanvasCoords(e);
    if (!c) return;
    drawBrushIndicator(c.x, c.y);
    if (!isPainting) return;
    paintAtPosition(c.x, c.y);
    applyMask();
  }

  function handlePointerUp() {
    isPainting = false;
    brushCanvas?.getContext('2d')?.clearRect(0, 0, width, height);
  }

  function handlePointerLeave() {
    brushCanvas?.getContext('2d')?.clearRect(0, 0, width, height);
    isPainting = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
  }

  let lastProcessedMode: 'ai' | 'simple' | null = $state(null);
  let _prevFile: File | null = null;

  $effect(() => {
    const currentFile = file;
    if (!checkerboardCanvas || !resultCanvas || !brushCanvas || !originalCanvas) return;

    // Only run on actual file changes, not when removalMode triggers a re-run
    if (currentFile === _prevFile) return;
    _prevFile = currentFile;

    processing = true;
    progress = 'Loading...';
    maskData = null;
    undoStack = [];
    modeCache = {};

    lastProcessedMode = removalMode;
    processNewFile(currentFile);
  });

  // Re-process when mode changes after initial load
  $effect(() => {
    if (processing) return;
    if (lastProcessedMode === null) return;
    if (removalMode === lastProcessedMode) return;
    if (!file || !originalCanvas) return;

    // Save current mask for the mode we're switching away from
    if (maskData) {
      modeCache = { ...modeCache, [lastProcessedMode]: new Uint8ClampedArray(maskData) };
    }

    const cachedMask = modeCache[removalMode];
    if (cachedMask) {
      maskData = new Uint8ClampedArray(cachedMask);
      applyMask();
      undoStack = [];
      lastProcessedMode = removalMode;
      return;
    }

    processing = true;
    progress = removalMode === 'simple' ? 'Removing white background...' : 'Loading model...';
    maskData = null;
    undoStack = [];
    lastProcessedMode = removalMode;
    processNewFile(file);
  });

  function simpleWhiteRemoval(imageData: ImageData): Uint8ClampedArray {
    const raw = new Uint8ClampedArray(width * height);
    const data = imageData.data;
    for (let i = 0; i < raw.length; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      // Threshold: near-white pixels become transparent
      raw[i] = r > 240 && g > 240 && b > 240 ? 0 : 255;
    }
    return raw;
  }

  function processNewFile(currentFile: File) {
    if (!checkerboardCanvas || !resultCanvas || !brushCanvas || !originalCanvas) return;

    const img = new Image();
    const url = URL.createObjectURL(currentFile);

    img.onload = async () => {
      width = img.naturalWidth;
      height = img.naturalHeight;
      await new Promise((r) => requestAnimationFrame(r));

      for (const c of [checkerboardCanvas!, resultCanvas!, brushCanvas!, originalCanvas!]) {
        c.width = width;
        c.height = height;
      }

      originalCanvas!.getContext('2d')!.drawImage(img, 0, 0);
      drawCheckerboard();

      try {
        if (removalMode === 'simple') {
          // Simple PIL-style white background removal
          progress = 'Removing white background...';
          const origCtx = originalCanvas!.getContext('2d', { willReadFrequently: true })!;
          const imageData = origCtx.getImageData(0, 0, width, height);
          const raw = simpleWhiteRemoval(imageData);

          maskData = new Uint8ClampedArray(raw);
          applyMask();
          processing = false;
          modeCache = { ...modeCache, simple: new Uint8ClampedArray(raw) };
        } else {
          // AI model-based removal
          const { tf, model, processor } = await loadModel();

          progress = 'Processing image...';
          const rawImage = await tf.RawImage.fromURL(url);
          const { pixel_values } = await processor(rawImage);

          progress = 'Running segmentation...';
          const result = await model({ input: pixel_values });

          // Get the raw output tensor - shape varies by model
          const outputTensor = result.output;
          let maskTensor = outputTensor;

          // Navigate nested tensors: could be [batch, channel, H, W] or [batch, H, W]
          while (maskTensor.dims && maskTensor.dims.length > 2) {
            maskTensor = maskTensor[0];
          }

          // Now maskTensor is 2D (H, W) with float values 0-1
          const maskH = maskTensor.dims[0];
          const maskW = maskTensor.dims[1];
          const maskValues = maskTensor.data;

          // Resize mask to original image size using canvas
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = maskW;
          maskCanvas.height = maskH;
          const maskCtx = maskCanvas.getContext('2d')!;
          const maskImgData = maskCtx.createImageData(maskW, maskH);

          for (let i = 0; i < maskValues.length; i++) {
            const v = Math.round(Math.min(1, Math.max(0, maskValues[i])) * 255);
            maskImgData.data[i * 4] = v;
            maskImgData.data[i * 4 + 1] = v;
            maskImgData.data[i * 4 + 2] = v;
            maskImgData.data[i * 4 + 3] = 255;
          }
          maskCtx.putImageData(maskImgData, 0, 0);

          // Resize to original dimensions
          const resizeCanvas = document.createElement('canvas');
          resizeCanvas.width = width;
          resizeCanvas.height = height;
          const resizeCtx = resizeCanvas.getContext('2d')!;
          resizeCtx.drawImage(maskCanvas, 0, 0, width, height);
          const resizedData = resizeCtx.getImageData(0, 0, width, height);

          const raw = new Uint8ClampedArray(width * height);
          for (let i = 0; i < raw.length; i++) {
            raw[i] = resizedData.data[i * 4]; // R channel = grayscale mask value
          }

          maskData = new Uint8ClampedArray(raw);
          applyMask();
          processing = false;
          modeCache = { ...modeCache, ai: new Uint8ClampedArray(raw) };
        }
      } catch (err) {
        console.error('Background removal failed:', err);
        progress = 'Error: removal failed';
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

<svelte:window onkeydown={handleKeydown} />

<div
  class="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-center md:gap-6"
  style="height: calc(100vh - 180px);"
>
  <!-- Left: Canvas -->
  <div class="flex min-w-0 items-start justify-center">
    <div
      class="relative max-h-full w-fit overflow-hidden rounded-xl"
      style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
    >
      <canvas bind:this={originalCanvas} class="hidden"></canvas>
      <canvas
        bind:this={checkerboardCanvas}
        class="absolute inset-0 h-full w-full"
        style="image-rendering: pixelated;"
      ></canvas>
      <canvas bind:this={resultCanvas} class="absolute inset-0 h-full w-full"></canvas>
      <canvas
        bind:this={brushCanvas}
        class="absolute inset-0 h-full w-full"
        style="cursor: crosshair;"
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointerleave={handlePointerLeave}
      ></canvas>

      {#if width > 0 && height > 0}
        <img
          src={URL.createObjectURL(file)}
          alt=""
          class="invisible block max-w-full"
          style="max-height: calc(100vh - 220px);"
        />
      {:else}
        <div class="flex h-60 w-80 items-center justify-center">
          <LoaderCircle class="size-8 animate-spin text-cork-500" />
        </div>
      {/if}

      {#if processing}
        <div
          class="absolute inset-0 flex flex-col items-center justify-center bg-cork-900/40 backdrop-blur-sm"
        >
          <LoaderCircle class="mb-3 size-10 animate-spin text-cork-50" />
          <p class="text-sm font-medium text-cork-50">{progress}</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right: Tools -->
  <div
    class="h-fit w-full max-w-sm space-y-5 rounded-xl p-5 md:w-56 md:shrink-0"
    style="background: radial-gradient(ellipse at 70% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae; box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
  >
    <div>
      <p class="mb-2 text-xs font-semibold tracking-wider text-cork-500 uppercase">Mode</p>
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="cursor-pointer flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-xs font-medium transition-colors
            {removalMode === 'simple'
            ? 'border-cork-700 bg-cork-700 text-cork-50'
            : 'border-cork-200 bg-white/60 text-cork-600 hover:border-cork-300'}"
          disabled={processing}
          onclick={() => (removalMode = 'simple')}
        >
          <Scissors class="size-4" />
          Simple
        </button>
        <button
          type="button"
          class="cursor-pointer flex flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-xs font-medium transition-colors
            {removalMode === 'ai'
            ? 'border-cork-700 bg-cork-700 text-cork-50'
            : 'border-cork-200 bg-white/60 text-cork-600 hover:border-cork-300'}"
          disabled={processing}
          onclick={() => (removalMode = 'ai')}
          title="AI (RMBG-1.4)"
        >
          <Sparkles class="size-4" />
          AI
        </button>
      </div>
    </div>

    <div class="border-t border-cork-200"></div>

    <div class="flex items-center justify-between">
      <p class="text-xs font-semibold tracking-wider text-cork-500 uppercase">Brush</p>
      <div class="flex">
        <button
          type="button"
          class="cursor-pointer flex items-center justify-center rounded-l-md border px-2 py-1 transition-colors
            {brushMode === 'restore'
            ? 'border-cork-600 bg-cork-700 text-cork-50'
            : 'border-cork-300 bg-white/70 text-cork-400 hover:border-cork-400 hover:text-cork-600'}"
          disabled={processing}
          onclick={() => (brushMode = 'restore')}
          title="Restore"
        >
          <Paintbrush class="size-3.5" />
        </button>
        <button
          type="button"
          class="cursor-pointer flex items-center justify-center rounded-r-md border px-2 py-1 transition-colors -ml-px
            {brushMode === 'erase'
            ? 'border-cork-600 bg-cork-700 text-cork-50'
            : 'border-cork-300 bg-white/70 text-cork-400 hover:border-cork-400 hover:text-cork-600'}"
          disabled={processing}
          onclick={() => (brushMode = 'erase')}
          title="Erase"
        >
          <Eraser class="size-3.5" />
        </button>
      </div>
    </div>

    <div>
      <div class="flex gap-1.5">
        {#each [{ label: 'S', size: 10 }, { label: 'M', size: 30 }, { label: 'L', size: 60 }, { label: 'XL', size: 100 }] as preset (preset.label)}
          <button
            type="button"
            class="cursor-pointer flex-1 rounded-md py-1.5 text-xs font-medium transition-colors
							{brushSize === preset.size
              ? 'bg-cork-700 text-cork-50'
              : 'border border-cork-200 bg-white/60 text-cork-600 hover:border-cork-300'}"
            disabled={processing}
            onclick={() => (brushSize = preset.size)}
          >
            {preset.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="border-t border-cork-200"></div>

    <div class="space-y-2">
      <button
        type="button"
        class="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg bg-cork-700 px-3 py-2 text-sm font-medium text-cork-50 hover:bg-cork-800 disabled:opacity-40"
        disabled={processing}
        onclick={handleDownload}
      >
        <Download class="size-4" /> Download PNG
      </button>

      <button
        type="button"
        class="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg border border-cork-300 px-3 py-2 text-sm font-medium text-cork-500 hover:bg-cork-200/50"
        onclick={onreset}
      >
        <ImagePlus class="size-4" /> New Image
      </button>
    </div>
  </div>

</div>
