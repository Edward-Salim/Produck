<script lang="ts">
	import { Users } from "@lucide/svelte";

	const allAvatars = import.meta.glob('$lib/assets/personas/*', { eager: true, import: 'default' }) as Record<string, string>;

	const manAvatars = Object.entries(allAvatars)
		.filter(([path]) => path.split('/').pop()?.startsWith('man'))
		.map(([, src]) => src);

	const womanAvatars = Object.entries(allAvatars)
		.filter(([path]) => path.split('/').pop()?.startsWith('woman'))
		.map(([, src]) => src);

	function getAvatar(gender: string | null, index: number): string | null {
		const isWoman = gender?.toLowerCase().match(/^(f|female|woman|perempuan|wanita)/);
		const pool = isWoman ? womanAvatars : manAvatars;
		if (pool.length === 0) return null;
		return pool[index % pool.length];
	}

	let { data } = $props();

	let personas = $derived(data.personas);
	let projectName = $derived(data.projectName);

	let parsedName = $derived(() => {
		const match = projectName.match(/^([^(]+?)(?:\s*\((.+)\))?$/);
		return { primary: match?.[1]?.trim() ?? projectName, subtitle: match?.[2]?.trim() ?? '' };
	});

	let currentIndex = $state(0);
	let persona = $derived(personas[currentIndex] ?? null);
	let avatarSrc = $derived(getAvatar(persona?.gender ?? null, currentIndex));

	const accentGradients = [
		'from-rose-400 to-rose-500',
		'from-sky-400 to-sky-500',
		'from-amber-400 to-amber-500',
		'from-emerald-400 to-emerald-500',
		'from-violet-400 to-violet-500',
	];

	const accentBorders = [
		'border-l-rose-400', 'border-l-sky-400', 'border-l-amber-400',
		'border-l-emerald-400', 'border-l-violet-400',
	];
</script>

<svelte:head><title>Personas: {projectName}</title></svelte:head>

<div>
	<header class="mb-6">
		<h1 class="font-display text-2xl md:text-4xl text-cork-800">{parsedName().primary} Personas</h1>
		{#if parsedName().subtitle || personas.length > 0}
			<div class="flex flex-wrap items-center justify-between gap-2 md:gap-4 mt-0.5">
				{#if parsedName().subtitle}
					<p class="text-sm text-cork-500">{parsedName().subtitle}</p>
				{:else}
					<div></div>
				{/if}
				{#if personas.length > 0}
					<div class="flex flex-wrap items-center gap-1">
						{#each personas as p, i (p.id)}
							<button
								type="button"
								class="px-3 py-1 text-sm rounded-full transition-all duration-200
									{i === currentIndex
										? 'bg-cork-800 text-cork-50 shadow-sm'
										: 'text-cork-500 hover:text-cork-700 hover:bg-cork-200/60'}"
								onclick={() => (currentIndex = i)}
							>
								{p.name.split(' ')[0]}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</header>

	{#if personas.length === 0}
		<div class="flex flex-col items-center justify-center gap-3 py-24 text-cork-400">
			<Users class="size-12" />
			<p class="text-lg">No personas yet</p>
		</div>
	{:else if persona}
		<!-- Corkboard wrapper -->
		<div
			class="rounded-xl p-4 md:p-6 shadow-[inset_0_1px_4px_rgba(255,255,255,.15),inset_0_-2px_6px_rgba(0,0,0,.06),0_6px_24px_rgba(0,0,0,.12)] border-l-4 {accentBorders[currentIndex % accentBorders.length]}"
			style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;"
		>
			<div class="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 md:gap-6">
				<!-- Left: Identity column -->
				<div class="flex flex-col items-center text-center gap-3">
					{#if avatarSrc}
						<img
							src={avatarSrc}
							alt={persona.name}
							class="size-28 rounded-2xl object-cover shadow-md"
						/>
					{:else}
						<div class="size-28 rounded-2xl bg-linear-to-br {accentGradients[currentIndex % accentGradients.length]} flex items-center justify-center text-5xl font-display font-bold text-white shadow-md">
							{persona.name.charAt(0)}
						</div>
					{/if}
					<div>
						<p class="text-lg font-semibold text-cork-800">{persona.name}</p>
						{#if persona.role}
							<p class="text-xs text-cork-500">{persona.role}</p>
						{/if}
						{#if persona.age}
							<p class="text-xs text-cork-400 mt-1">Age: {persona.age}</p>
						{/if}
					</div>
				</div>

				<!-- Right: Quote + Quadrant -->
				<div class="flex flex-col gap-4">
					<!-- Quote -->
					{#if persona.quote}
						<p class="text-sm italic text-cork-700 leading-relaxed">
							&ldquo;{persona.quote}&rdquo;
						</p>
					{/if}

					<!-- 2x2 Quadrant -->
					<div class="grid grid-cols-2 gap-2 flex-1">
						<div class="rounded-lg bg-emerald-100 p-3.5">
							<h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700 mb-2">Goals</h3>
							{#if (persona.goals ?? []).length > 0}
								<ul class="space-y-1.5">
									{#each persona.goals ?? [] as goal, gi (gi)}
										<li class="flex gap-2 text-xs text-cork-700 leading-snug">
											<span class="shrink-0 size-4 rounded-full bg-emerald-200 text-emerald-800 text-[9px] font-bold flex items-center justify-center mt-px">{gi + 1}</span>
											{goal}
										</li>
									{/each}
								</ul>
							{:else}<p class="text-xs text-cork-400">&ndash;</p>{/if}
						</div>

						<div class="rounded-lg bg-rose-100 p-3.5">
							<h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-rose-700 mb-2">Challenges</h3>
							{#if (persona.challenges ?? []).length > 0}
								<ul class="space-y-1.5">
									{#each persona.challenges ?? [] as challenge, ci (ci)}
										<li class="flex gap-2 text-xs text-cork-700 leading-snug">
											<span class="shrink-0 size-4 rounded-full bg-rose-200 text-rose-800 text-[9px] font-bold flex items-center justify-center mt-px">{ci + 1}</span>
											{challenge}
										</li>
									{/each}
								</ul>
							{:else}<p class="text-xs text-cork-400">&ndash;</p>{/if}
						</div>

						<div class="rounded-lg bg-sky-100 p-3.5">
							<h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-sky-700 mb-2">Motivators</h3>
							{#if (persona.motivators ?? []).length > 0}
								<ul class="space-y-1.5">
									{#each persona.motivators ?? [] as motivator, mi (mi)}
										<li class="flex gap-2 text-xs text-cork-700 leading-snug">
											<span class="shrink-0 size-4 rounded-full bg-sky-200 text-sky-800 text-[9px] font-bold flex items-center justify-center mt-px">{mi + 1}</span>
											{motivator}
										</li>
									{/each}
								</ul>
							{:else}<p class="text-xs text-cork-400">&ndash;</p>{/if}
						</div>

						<div class="rounded-lg bg-amber-100 p-3.5">
							<h3 class="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-2">Info Sources</h3>
							{#if (persona.infoSources ?? []).length > 0}
								<ul class="space-y-1.5">
									{#each persona.infoSources ?? [] as source, si (si)}
										<li class="flex gap-2 text-xs text-cork-700 leading-snug">
											<span class="shrink-0 size-4 rounded-full bg-amber-200 text-amber-800 text-[9px] font-bold flex items-center justify-center mt-px">{si + 1}</span>
											{source}
										</li>
									{/each}
								</ul>
							{:else}<p class="text-xs text-cork-400">&ndash;</p>{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
