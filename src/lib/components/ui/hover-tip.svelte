<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    text,
    position = 'bottom',
    children
  }: {
    text: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children: Snippet;
  } = $props();

  let show = $state(false);
  let anchor = $state<HTMLElement | null>(null);
  let tipStyle = $state('');

  function updatePosition() {
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    if (position === 'bottom') {
      tipStyle = `top: ${rect.bottom + 6}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`;
    } else if (position === 'top') {
      tipStyle = `bottom: ${window.innerHeight - rect.top + 6}px; left: ${rect.left + rect.width / 2}px; transform: translateX(-50%);`;
    } else if (position === 'right') {
      tipStyle = `top: ${rect.top + rect.height / 2}px; left: ${rect.right + 6}px; transform: translateY(-50%);`;
    } else {
      tipStyle = `top: ${rect.top + rect.height / 2}px; right: ${window.innerWidth - rect.left + 6}px; transform: translateY(-50%);`;
    }
  }

  function onEnter() {
    updatePosition();
    show = true;
  }
</script>

<span
  bind:this={anchor}
  role="presentation"
  onmouseenter={onEnter}
  onmouseleave={() => (show = false)}
>
  {@render children()}
</span>

{#if show}
  <span
    class="pointer-events-none fixed z-[9999] max-w-64 rounded bg-cork-800 px-2.5 py-1 text-center text-[10px] font-medium text-wrap text-cork-50"
    style={tipStyle}
  >
    {text}
  </span>
{/if}
