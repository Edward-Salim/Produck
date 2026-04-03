<script lang="ts">
	import { ImagePlus } from '@lucide/svelte';

	let { onupload }: { onupload: (file: File) => void } = $props();

	let dragOver = $state(false);
	let preview: string | null = $state(null);

	let fileInput: HTMLInputElement | undefined = $state(undefined);

	$effect(() => {
		const url = preview;
		return () => {
			if (url) {
				URL.revokeObjectURL(url);
			}
		};
	});

	function handleFiles(files: FileList | null) {
		if (!files || files.length === 0) return;
		const file = files[0];
		if (!file.type.startsWith('image/')) return;

		preview = URL.createObjectURL(file);
		onupload(file);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleClick() {
		fileInput?.click();
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		handleFiles(target.files);
		target.value = '';
	}

	function handlePaste(e: ClipboardEvent) {
		const items = e.clipboardData?.items;
		if (!items) return;
		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					e.preventDefault();
					preview = URL.createObjectURL(file);
					onupload(file);
					return;
				}
			}
		}
	}
</script>

<svelte:window onpaste={handlePaste} />

<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="hidden"
	onchange={handleChange}
/>

<button
	type="button"
	class="relative flex w-full h-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-cork-300 p-8 transition-colors hover:border-cork-400 {dragOver
		? 'bg-cork-200/50 border-cork-400'
		: ''}"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	onclick={handleClick}
>
	{#if preview}
		<img
			src={preview}
			alt="Upload preview"
			class="h-32 w-32 rounded-lg object-cover"
		/>
		<span
			class="mt-3 rounded-md bg-cork-300/80 px-3 py-1 text-sm font-medium text-cork-800 transition-colors hover:bg-cork-400/80"
		>
			Change
		</span>
	{:else}
		<ImagePlus class="mb-3 h-10 w-10 text-cork-400" />
		<p class="text-sm font-medium text-cork-700">Drop an image here</p>
		<p class="mt-1 text-xs text-cork-500">or click to browse, or paste from clipboard</p>
	{/if}
</button>
