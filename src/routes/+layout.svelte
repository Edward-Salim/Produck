<script lang="ts">
  import './(app)/layout.css';
  import { navigating } from '$app/stores';

  let { children } = $props();
</script>

{#if $navigating}
  <div class="loading-bar">
    <div class="loading-bar-inner"></div>
  </div>
{/if}

{@render children()}

<style>
  .loading-bar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    width: 100%;
    height: 2px;
    overflow: hidden;
    background: transparent;
  }
  .loading-bar-inner {
    height: 100%;
    width: 30%;
    border-radius: 1px;
    background: hsl(33 22% 50%);
    animation: loading-slide 1.2s ease-in-out infinite;
  }
  @keyframes loading-slide {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(400%);
    }
  }
</style>
