<script lang="ts">
  import { page } from '$app/state';
  import { ArrowLeft } from '@lucide/svelte';

  let status = $derived(page.status);

  let label = $derived.by(() => {
    if (status === 404) return 'Not found';
    if (status === 403) return 'Forbidden';
    if (status === 401) return 'Sign in needed';
    if (status >= 500) return 'Server error';
    return 'Error';
  });

  let detail = $derived.by(() => {
    if (status === 404) return 'Page not found.';
    if (status === 403) return 'Access denied.';
    if (status === 401) return 'Sign in to continue.';
    if (status === 500) return 'Try refreshing.';
    if (status >= 500) return 'Try again in a moment.';
    if (status >= 400) return 'Request failed.';
    return 'Try again.';
  });
</script>

<svelte:head>
  <title>{status} &middot; {label}</title>
</svelte:head>

<div class="flex min-h-svh items-center justify-center bg-cork-100 px-5">
  <div class="flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
    <img src="/assets/produck-dead.png" alt="" class="h-28 w-auto shrink-0" />

    <div>
      <div class="flex items-baseline justify-center gap-2 sm:justify-start">
        <p class="text-5xl font-black tracking-tight text-cork-800">{status}</p>
        <p class="text-sm font-semibold text-cork-600">{label}</p>
      </div>
      <p class="mt-2 max-w-64 text-[13px] leading-relaxed text-cork-500">{detail}</p>
      <button
        onclick={() => {
          if (window.history.length > 1) {
            history.back();
          } else {
            location.href = '/';
          }
        }}
        class="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-cork-400 transition-colors hover:text-cork-600"
      >
        <ArrowLeft class="size-3" />
        Go back
      </button>
    </div>
  </div>
</div>
