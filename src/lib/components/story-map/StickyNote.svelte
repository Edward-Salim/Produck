<script lang="ts">
  import { PIC_COLORS, STICKY_GRADIENTS } from '$lib/constants/colors.js';
  import type { Actor } from '$lib/types/story-map.js';
  type Variant = 'activity' | 'task' | 'story';

  let {
    variant,
    colorIndex,
    title,
    id,
    showId = true,
    done = false,
    pic = '',
    picColor = '',
    actor = undefined,
    onclick = undefined
  }: {
    variant: Variant;
    colorIndex: number;
    title: string;
    id: string;
    showId?: boolean;
    done?: boolean;
    pic?: string;
    picColor?: string;
    actor?: Actor;
    onclick?: (() => void) | undefined;
  } = $props();

  let picColorClass = $derived(picColor ? (PIC_COLORS[picColor]?.textClass ?? '') : '');

  /* Rotation: only stories rotate, matching original CSS nth-child pattern */
  const rotationValues = [-0.5, 0.35, -0.2];
  let rotation = $derived(variant === 'story' ? rotationValues[colorIndex % 3] : 0);

  /* Story yellow shade cycling */
  const storyColors = STICKY_GRADIENTS;
</script>

<button
  type="button"
  class="relative h-20 w-35 shrink-0 overflow-visible rounded-sm outline-none select-none
		{variant === 'story'
    ? 'cursor-pointer transition-transform duration-150 hover:scale-105'
    : 'cursor-default'}"
  style="
		transform: rotate({rotation}deg);
		background: linear-gradient(170deg,
			{variant === 'activity'
    ? '#9ee4b4, #6dcf8c'
    : variant === 'task'
      ? '#d6eaf8, #aed6f1'
      : `${storyColors[colorIndex % 3].from}, ${storyColors[colorIndex % 3].to}`});
		box-shadow: 1px 2px 4px rgba(0,0,0,.1), 0 1px 1px rgba(0,0,0,.06);
	"
  {onclick}
>
  {#if variant === 'story'}
    <!-- Story layout -->
    <div class="flex h-full flex-col px-2.5 pt-2.5 pb-1.5 font-sans text-cork-800">
      {#if showId || pic || actor}
        <div
          class="flex items-center justify-between gap-1 text-[9px] leading-tight font-semibold tracking-wide"
        >
          <span class="inline-flex min-w-0 items-center gap-1">
            {#if actor}
              <span
                class="pointer-events-none text-xs leading-none opacity-30 mix-blend-multiply saturate-50"
                aria-hidden="true">{actor.emoji}</span
              >
              <span class="sr-only">Actor: {actor.label}</span>
            {/if}
            {#if showId}<span class="opacity-50">{id}</span>{/if}
          </span>
          {#if pic}
            <span class="{picColorClass} font-semibold opacity-50">{pic}</span>
          {/if}
        </div>
      {/if}
      <p class="mt-0.5 line-clamp-2 text-left text-[11px] leading-snug font-semibold">
        {title}
      </p>
    </div>

    {#if done}
      <span
        class="absolute -top-1 -right-1 z-0 flex h-3 w-3 items-center justify-center rounded-sm border border-green-700 bg-green-500"
      >
        <span class="text-[8px] leading-none font-bold text-white">&#10003;</span>
      </span>
    {/if}
  {:else}
    <!-- Activity / Task layout -->
    <div class="flex h-full flex-col items-center justify-center px-2 font-display text-cork-800">
      {#if showId}
        <span class="font-sans text-[9px] font-medium tracking-wide opacity-50">{id}</span>
      {/if}
      <p class="mt-0.5 text-center text-lg leading-none font-bold break-words">{title}</p>
    </div>
  {/if}

  <!-- Folded corner -->
  <span
    class="pointer-events-none absolute right-0 bottom-0 h-3 w-3"
    style="background: linear-gradient(135deg, transparent 50%, rgba(0,0,0,.04) 50%);"
  ></span>
</button>
