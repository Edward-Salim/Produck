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
    if (status === 404) return "The page you're looking for doesn't exist or was moved.";
    if (status === 403) return "You don't have permission to access this page.";
    if (status === 401) return 'Sign in to continue.';
    if (status === 500) return 'Something unexpected happened. Try refreshing.';
    if (status >= 500) return 'The server hit a problem. Try again in a moment.';
    if (status >= 400) return 'The request could not be completed.';
    return 'Something went wrong. Try again.';
  });
</script>

<svelte:head>
  <title>{status} &middot; {label}</title>
</svelte:head>

<div class="flex min-h-svh items-center justify-center bg-cork-100 px-5">
  <div class="flex items-center gap-6">
    <img src="/assets/produck-dead.png" alt="" class="h-28 w-auto shrink-0" />

    <div>
      <p class="text-5xl font-black tracking-tight text-cork-800">{status}</p>
      <p class="mt-0.5 text-sm font-semibold text-cork-600">{label}</p>
      <p class="mt-2 max-w-64 text-[13px] leading-relaxed text-cork-500">{detail}</p>
      <a
        href="/"
        class="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cork-400 transition-colors hover:text-cork-600"
      >
        <ArrowLeft class="size-3" />
        Back to Produck
      </a>
    </div>
  </div>
</div>
