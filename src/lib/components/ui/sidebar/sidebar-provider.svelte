<script lang="ts">
  import * as Tooltip from '$lib/components/ui/tooltip/index.js';
  import { cn, type WithElementRef } from '$lib/utils.js';
  import type { HTMLAttributes } from 'svelte/elements';
  import {
    SIDEBAR_COOKIE_MAX_AGE,
    SIDEBAR_COOKIE_NAME,
    SIDEBAR_WIDTH,
    SIDEBAR_WIDTH_ICON
  } from './constants.js';
  import { setSidebar } from './context.svelte.js';

  let {
    ref = $bindable(null),
    open = $bindable(true),
    onOpenChange = () => {},
    class: className,
    style,
    children,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  } = $props();

  const sidebar = setSidebar({
    open: () => open,
    setOpen: (value: boolean) => {
      open = value;
      onOpenChange(value);

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${open}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }
  });

  const SWIPE_EDGE_WIDTH = 32;
  const SWIPE_THRESHOLD = 56;
  const SWIPE_VERTICAL_LIMIT = 72;

  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipeLastX = 0;
  let swipeLastY = 0;
  let swipeMode: 'open' | 'close' | null = null;

  function handleTouchStart(e: TouchEvent) {
    if (!sidebar.isMobile || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const startsAtEdge = touch.clientX <= SWIPE_EDGE_WIDTH;

    if (!sidebar.openMobile && !startsAtEdge) {
      swipeMode = null;
      return;
    }

    swipeMode = sidebar.openMobile ? 'close' : 'open';
    swipeStartX = touch.clientX;
    swipeStartY = touch.clientY;
    swipeLastX = touch.clientX;
    swipeLastY = touch.clientY;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!swipeMode || e.touches.length !== 1) return;

    const touch = e.touches[0];
    swipeLastX = touch.clientX;
    swipeLastY = touch.clientY;
  }

  function handleTouchEnd() {
    if (!swipeMode) return;

    const deltaX = swipeLastX - swipeStartX;
    const deltaY = Math.abs(swipeLastY - swipeStartY);
    const horizontalEnough = Math.abs(deltaX) >= SWIPE_THRESHOLD && Math.abs(deltaX) > deltaY * 1.25;
    const verticalEnough = deltaY > SWIPE_VERTICAL_LIMIT && deltaY > Math.abs(deltaX);

    if (!verticalEnough && horizontalEnough) {
      if (swipeMode === 'open' && deltaX > 0) {
        sidebar.setOpenMobile(true);
      } else if (swipeMode === 'close' && deltaX < 0) {
        sidebar.setOpenMobile(false);
      }
    }

    swipeMode = null;
  }
</script>

<svelte:window
  onkeydown={sidebar.handleShortcutKeydown}
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
  ontouchcancel={() => (swipeMode = null)}
/>

<Tooltip.Provider delayDuration={0}>
  <div
    data-slot="sidebar-wrapper"
    style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
    class={cn(
      'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
      className
    )}
    bind:this={ref}
    {...restProps}
  >
    {@render children?.()}
  </div>
</Tooltip.Provider>
