<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import { getBusinessOutcome, getProductObjectives, updateKeyResultValue, AVAILABLE_YEARS } from '$lib/components/outcomes/outcomes-data.svelte.js';

	let selectedYear = $state(AVAILABLE_YEARS[0]);
	let selectedQuarter = $state<1 | 2 | 3 | 4 | null>(null);

	let bo = $derived(getBusinessOutcome(selectedYear));
	let objectives = $derived(getProductObjectives(selectedYear, selectedQuarter));

	let expandedObjectives = $state<Set<string>>(new Set());
	let editingKR = $state<string | null>(null);

	$effect(() => {
		expandedObjectives = new Set(objectives.map((o) => o.id));
	});

	function toggleObjective(id: string) {
		const next = new Set(expandedObjectives);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		expandedObjectives = next;
	}

	function krProgress(kr: { targetValue: number; currentValue: number; unit: string }): number {
		if (kr.targetValue === 0) return 0;
		// For "less is better" (e.g. < 2 min), invert
		if (kr.unit === 'min') return Math.max(0, Math.min(100, ((kr.targetValue / Math.max(kr.currentValue, 0.1)) * 100)));
		return Math.max(0, Math.min(100, (kr.currentValue / kr.targetValue) * 100));
	}

	function progressColor(pct: number): string {
		if (pct >= 80) return '#1e8449';
		if (pct >= 40) return '#d4a017';
		return '#c0392b';
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function handleValueKeydown(e: KeyboardEvent, krId: string) {
		if (e.key === 'Enter') {
			e.preventDefault();
			(e.target as HTMLInputElement).blur();
		}
		if (e.key === 'Escape') {
			editingKR = null;
		}
	}

	function saveValue(e: Event, krId: string) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		if (!isNaN(val)) updateKeyResultValue(krId, val);
		editingKR = null;
	}
</script>

<svelte:head><title>Outcomes - Produck</title></svelte:head>

<div>
	<header class="mb-4">
		<h1 class="font-display text-2xl md:text-4xl text-cork-800">Outcomes</h1>
		<p class="text-sm text-cork-500 mt-0.5">Business & Product Outcomes</p>
	</header>

	<!-- Timeframe selector -->
	<div class="flex flex-wrap items-center gap-4 mb-5">
		<div class="flex items-center gap-1">
			{#each AVAILABLE_YEARS as year}
				<button
					type="button"
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {selectedYear === year ? 'bg-cork-700 text-cork-50' : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
					onclick={() => (selectedYear = year)}
				>
					FY{year}
				</button>
			{/each}
		</div>

		<div class="h-5 w-px bg-cork-400/30"></div>

		<div class="flex items-center gap-1">
			{#each [1, 2, 3, 4] as q}
				<button
					type="button"
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {selectedQuarter === q ? 'bg-cork-700 text-cork-50' : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
					onclick={() => (selectedQuarter = q as 1 | 2 | 3 | 4)}
				>
					Q{q}
				</button>
			{/each}
			<button
				type="button"
				class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {selectedQuarter === null ? 'bg-cork-700 text-cork-50' : 'bg-cork-200/50 text-cork-600 hover:bg-cork-300/50'}"
				onclick={() => (selectedQuarter = null)}
			>
				Year
			</button>
		</div>
	</div>

	<!-- Business Outcome (1 per year) -->
	{#if bo}
		<section class="mb-5">
			<h2 class="text-xs font-bold uppercase tracking-wider text-cork-500 mb-2">Business Outcome — FY{selectedYear}</h2>
			<div
				class="rounded-xl p-5"
				style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
					box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.1);"
			>
				<div class="flex items-start gap-3">
					<span class="rounded bg-cork-600 px-1.5 py-0.5 text-[10px] font-bold text-cork-50 shrink-0 mt-0.5">{bo.code}</span>
					<div>
						<h3 class="font-display text-xl text-cork-800 mb-1">{bo.title}</h3>
						<p class="text-sm text-cork-600 mb-3">{bo.description}</p>
						<div class="flex flex-wrap gap-1.5">
							{#each bo.metrics as metric, i (i)}
								<span class="rounded-full bg-cork-200/60 px-2.5 py-0.5 text-xs font-medium text-cork-700">{metric}</span>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Product Outcomes / OKRs -->
	<section>
		<h2 class="text-xs font-bold uppercase tracking-wider text-cork-500 mb-2">
			Product Outcomes (OKRs){selectedQuarter ? ` — Q${selectedQuarter}` : ''}
		</h2>

		{#if objectives.length === 0}
			<p class="text-sm text-cork-400 italic">No objectives for this period</p>
		{:else}
			<div
				class="rounded-xl overflow-hidden"
				style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
					box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
			>
				<!-- Header -->
				<div class="grid grid-cols-[1fr_100px_100px_80px_90px] gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-cork-500 border-b border-cork-600/25">
					<span>Key Result</span>
					<span>Target</span>
					<span>Current</span>
					<span class="text-center">Progress</span>
					<span class="text-right">Updated</span>
				</div>

				{#each objectives as obj (obj.id)}
					{@const isExpanded = expandedObjectives.has(obj.id)}

					<!-- Objective header -->
					<button
						type="button"
						class="w-full flex items-center gap-3 px-4 py-2.5 bg-cork-400/10 border-b border-cork-600/20 cursor-pointer hover:bg-cork-400/15 transition-colors"
						onclick={() => toggleObjective(obj.id)}
					>
						<ChevronRight class="size-4 text-cork-500 transition-transform shrink-0 {isExpanded ? 'rotate-90' : ''}" />
						<span class="rounded bg-cork-600 px-1.5 py-0.5 text-[10px] font-bold text-cork-50 shrink-0">{obj.code}</span>
						<span class="font-display text-base font-bold text-cork-800 flex-1 text-left">{obj.title}</span>
					</button>

					<!-- Key Results -->
					{#if isExpanded}
						{#each obj.keyResults as kr (kr.id)}
							{@const pct = Math.round(krProgress(kr))}
							<div class="grid grid-cols-[1fr_100px_100px_80px_90px] gap-2 px-4 py-2 border-b border-cork-600/10 items-center">
								<!-- Description -->
								<div class="flex items-center gap-2 pl-8">
									<span class="text-xs font-mono text-cork-400 shrink-0">{kr.code}</span>
									<span class="text-sm text-cork-700">{kr.description}</span>
								</div>

								<!-- Target -->
								<div>
									<span class="text-xs text-cork-500">{kr.target}</span>
								</div>

								<!-- Current (editable) -->
								<div>
									{#if editingKR === kr.id}
										<input
											type="text"
											inputmode="decimal"
											value={kr.currentValue}
											class="w-20 rounded border border-cork-400 bg-cork-50 px-2 py-0.5 text-xs text-cork-800 outline-none appearance-none"
											onkeydown={(e) => handleValueKeydown(e, kr.id)}
											onblur={(e) => saveValue(e, kr.id)}
											onfocus={(e) => (e.target as HTMLInputElement).select()}
										/>
									{:else}
										<button
											type="button"
											class="text-xs text-cork-700 font-medium cursor-pointer hover:text-cork-900 transition-colors"
											onclick={() => (editingKR = kr.id)}
											title="Click to edit"
										>
											{kr.currentValue} {kr.unit}
										</button>
									{/if}
								</div>

								<!-- Progress bar -->
								<div class="flex items-center gap-1.5">
									<div class="flex-1 h-1.5 rounded-full bg-cork-300 overflow-hidden">
										<div class="h-full rounded-full transition-all" style="width: {pct}%; background: {progressColor(pct)};"></div>
									</div>
									<span class="text-[10px] font-medium text-cork-500 w-7 text-right">{pct}%</span>
								</div>

								<!-- Last updated -->
								<div class="text-right">
									<span class="text-[10px] text-cork-400">{formatDate(kr.lastUpdated)}</span>
								</div>
							</div>
						{/each}
					{/if}
				{/each}
			</div>
		{/if}
	</section>
</div>
