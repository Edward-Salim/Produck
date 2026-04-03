<script lang="ts">
	import { MapPinned, Users, Map, ClipboardList } from '@lucide/svelte';
</script>

<svelte:head><title>Produck</title></svelte:head>

<div class="flex min-h-[80vh] flex-col items-center justify-center">
	<h1 class="font-display text-6xl text-cork-800">Produck</h1>
	<p class="mt-3 text-lg text-cork-500">Your product management toolkit</p>

	<div class="mt-12 grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
		<!-- Story Map - active card -->
		<a
			href="/story-map"
			class="group rounded-sm bg-linear-to-br from-[#fdf6dc] to-[#f5e9a0] p-6 shadow-[2px_3px_6px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 rotate-[-0.5deg]"
		>
			<MapPinned class="mb-3 size-8 text-cork-700" />
			<h2 class="font-display text-xl text-cork-800">Story Map</h2>
			<p class="mt-1 text-sm text-cork-600">Visualize your user journeys and plan releases</p>
		</a>

		<!-- Personas - disabled card -->
		<div
			class="relative cursor-not-allowed rounded-sm bg-linear-to-br from-[#fdf6dc] to-[#f5e9a0] p-6 opacity-50 shadow-[2px_3px_6px_rgba(0,0,0,0.15)] rotate-[0.7deg]"
		>
			<span
				class="absolute top-2 right-2 rounded-full bg-cork-300 px-2 py-0.5 text-[10px] font-semibold text-cork-700"
				>Coming Soon</span
			>
			<Users class="mb-3 size-8 text-cork-700" />
			<h2 class="font-display text-xl text-cork-800">Personas</h2>
			<p class="mt-1 text-sm text-cork-600">Define and manage your user personas</p>
		</div>

		<!-- Roadmap - disabled card -->
		<div
			class="relative cursor-not-allowed rounded-sm bg-linear-to-br from-[#fdf6dc] to-[#f5e9a0] p-6 opacity-50 shadow-[2px_3px_6px_rgba(0,0,0,0.15)] rotate-[0.3deg]"
		>
			<span
				class="absolute top-2 right-2 rounded-full bg-cork-300 px-2 py-0.5 text-[10px] font-semibold text-cork-700"
				>Coming Soon</span
			>
			<Map class="mb-3 size-8 text-cork-700" />
			<h2 class="font-display text-xl text-cork-800">Roadmap</h2>
			<p class="mt-1 text-sm text-cork-600">Plan your product roadmap and milestones</p>
		</div>

		<!-- Backlog - disabled card -->
		<div
			class="relative cursor-not-allowed rounded-sm bg-linear-to-br from-[#fdf6dc] to-[#f5e9a0] p-6 opacity-50 shadow-[2px_3px_6px_rgba(0,0,0,0.15)] rotate-[-0.4deg]"
		>
			<span
				class="absolute top-2 right-2 rounded-full bg-cork-300 px-2 py-0.5 text-[10px] font-semibold text-cork-700"
				>Coming Soon</span
			>
			<ClipboardList class="mb-3 size-8 text-cork-700" />
			<h2 class="font-display text-xl text-cork-800">Backlog</h2>
			<p class="mt-1 text-sm text-cork-600">Manage and prioritize your product backlog</p>
		</div>
	</div>
</div>
