<script lang="ts">
	import { diagram } from './fishbone-data.svelte.js';

	const W = 960;
	const H = 410;
	const SPINE_Y = H / 2;
	const SPINE_LEFT = 50;
	const SPINE_RIGHT = W - 200;
	const BRANCH_LEN = 140;
	const CAUSE_LINE = 65;

	let branches = $derived.by(() => {
		const cats = diagram.categories;
		const topSlots = cats.filter((_, i) => i % 2 === 0).length;
		const maxSlots = Math.max(topSlots, cats.length - topSlots);
		const usableWidth = SPINE_RIGHT - SPINE_LEFT - 100;
		const spacing = usableWidth / Math.max(maxSlots, 1);

		return cats.map((cat, i) => {
			const isTop = i % 2 === 0;
			const slot = Math.floor(i / 2);
			const attachX = SPINE_LEFT + 80 + slot * spacing;
			const angleDeg = isTop ? 55 : -55;
			const rad = (angleDeg * Math.PI) / 180;
			const endX = attachX - BRANCH_LEN * Math.cos(rad);
			const endY = SPINE_Y - BRANCH_LEN * Math.sin(rad);

			const causes = cat.causes.map((cause, j) => {
				const t = (j + 1) / (cat.causes.length + 1);
				const cx = attachX + t * (endX - attachX);
				const cy = SPINE_Y + t * (endY - SPINE_Y);
				return { cause, cx, cy };
			});

			return { cat, attachX, endX, endY, isTop, causes };
		});
	});

	// Fish tail — curved fork
	let tailPath = $derived.by(() => {
		const tx = SPINE_LEFT;
		const ty = SPINE_Y;
		return `M ${tx} ${ty}
			C ${tx - 10} ${ty - 20}, ${tx - 25} ${ty - 30}, ${tx - 40} ${ty - 50}
			C ${tx - 30} ${ty - 20}, ${tx - 20} ${ty - 5}, ${tx} ${ty}
			C ${tx - 20} ${ty + 5}, ${tx - 30} ${ty + 20}, ${tx - 40} ${ty + 50}
			C ${tx - 25} ${ty + 30}, ${tx - 10} ${ty + 20}, ${tx} ${ty} Z`;
	});

	// Fish head — teardrop pointing right with mouth slit
	let headPath = $derived.by(() => {
		const sx = SPINE_RIGHT + 8;
		const ty = SPINE_Y;
		const mx = sx + 175;
		return `M ${sx} ${ty}
			C ${sx + 35} ${ty - 70}, ${sx + 130} ${ty - 78}, ${mx} ${ty - 6}
			L ${mx + 3} ${ty}
			L ${mx} ${ty + 6}
			C ${sx + 130} ${ty + 78}, ${sx + 35} ${ty + 70}, ${sx} ${ty} Z`;
	});
</script>

<div
	class="rounded-xl overflow-x-auto"
	style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.18) 0%, transparent 60%), #cdc3ae;
		box-shadow: inset 0 1px 4px rgba(255,255,255,.15), inset 0 -2px 6px rgba(0,0,0,.06), 0 6px 24px rgba(0,0,0,.12);"
>
	<svg
		viewBox="0 0 {W} {H}"
		preserveAspectRatio="xMidYMid meet"
		width="100%"
		style="min-width: 700px;"
	>
		<!-- Fish body fill (subtle) -->
		<ellipse
			cx={(SPINE_LEFT + SPINE_RIGHT) / 2 + 40}
			cy={SPINE_Y}
			rx={(SPINE_RIGHT - SPINE_LEFT) / 2 + 40}
			ry="90"
			fill="#b8ad96"
			opacity="0.08"
		/>

		<!-- Fish tail -->
		<path d={tailPath} fill="#5c4b3a" opacity="0.18" />

		<!-- Fish head -->
		<path d={headPath} fill="#b8ad96" opacity="0.22" />
		<path d={headPath} fill="none" stroke="#5c4b3a" stroke-width="1.5" opacity="0.2" />

		<!-- Gill arc -->
		<path
			d="M {SPINE_RIGHT + 28} {SPINE_Y - 35} Q {SPINE_RIGHT + 20} {SPINE_Y}, {SPINE_RIGHT + 28} {SPINE_Y + 35}"
			fill="none"
			stroke="#5c4b3a"
			stroke-width="1.5"
			opacity="0.15"
		/>

		<!-- Eye -->
		<circle cx={SPINE_RIGHT + 135} cy={SPINE_Y - 20} r="7" fill="#f5f0e8" opacity="0.6" />
		<circle cx={SPINE_RIGHT + 135} cy={SPINE_Y - 20} r="7" fill="none" stroke="#5c4b3a" stroke-width="1" opacity="0.25" />
		<circle cx={SPINE_RIGHT + 136.5} cy={SPINE_Y - 21} r="3" fill="#5c4b3a" opacity="0.35" />

		<!-- Spine -->
		<line
			x1={SPINE_LEFT}
			y1={SPINE_Y}
			x2={SPINE_RIGHT + 12}
			y2={SPINE_Y}
			stroke="#5c4b3a"
			stroke-width="2.5"
		/>

		<!-- Branches + causes -->
		{#each branches as { cat, attachX, endX, endY, isTop, causes } (cat.id)}
			<!-- Main branch -->
			<line
				x1={attachX}
				y1={SPINE_Y}
				x2={endX}
				y2={endY}
				stroke={cat.color}
				stroke-width="2"
				stroke-linecap="round"
			/>

			<!-- Category label -->
			<text
				x={endX}
				y={isTop ? endY - 6 : endY + 18}
				text-anchor="middle"
				fill={cat.color}
				font-family="'Caveat', cursive"
				font-size="17"
				font-weight="bold"
			>
				{cat.label}
			</text>

			<!-- Causes -->
			{#each causes as { cause, cx, cy } (cause.id)}
				<!-- Dot at branch junction -->
				<circle cx={cx} cy={cy} r="2.5" fill={cat.color} opacity="0.4" />

				<!-- Sub-cause line -->
				<line
					x1={cx}
					y1={cy}
					x2={cx + CAUSE_LINE}
					y2={cy}
					stroke={cat.color}
					stroke-width="1"
					opacity="0.35"
				/>

				<!-- Cause text -->
				<text
					x={cx + CAUSE_LINE + 4}
					y={cy + 3.5}
					font-size="9.5"
					fill="#4a3d2e"
					font-family="'DM Sans Variable', sans-serif"
				>
					{cause.text}
				</text>
			{/each}
		{/each}

		<!-- Problem statement inside head -->
		<foreignObject
			x={SPINE_RIGHT + 35}
			y={SPINE_Y - 42}
			width="140"
			height="84"
		>
			<div xmlns="http://www.w3.org/1999/xhtml" class="h-full w-full flex items-center justify-center">
				<p
					class="text-center leading-tight"
					style="font-family: 'Caveat', cursive; font-size: 0.82rem; color: #3d3529;"
				>
					{diagram.problemStatement}
				</p>
			</div>
		</foreignObject>
	</svg>
</div>
