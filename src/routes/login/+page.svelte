<script lang="ts">
  import { goto } from '$app/navigation';
  import { LoaderCircle, LogIn } from '@lucide/svelte';
  import logoProduck from '$lib/assets/logo-produck.png';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state('');

  async function handleLogin(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (res.ok) {
      goto('/', { invalidateAll: true });
    } else {
      const data = await res.json();
      error = data.error || 'Invalid credentials';
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign In - Produck</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-cork-100">
  <div class="w-full max-w-sm">
    <!-- Logo + Title -->
    <div class="mb-8 text-center">
      <img src={logoProduck} alt="Produck" class="mx-auto mb-3 size-12" />
      <h1 class="font-display text-3xl text-cork-800">Produck</h1>
      <p class="mt-1 text-sm text-cork-500">Sign in to your workspace</p>
    </div>

    <!-- Card -->
    <div
      class="rounded-xl p-6"
      style="background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.25) 0%, transparent 60%), #ece5d8;
				box-shadow: inset 0 1px 4px rgba(255,255,255,.2), inset 0 -2px 6px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.08);"
    >
      <form onsubmit={handleLogin}>
        <div class="space-y-4">
          <div>
            <label
              for="email"
              class="mb-1 block text-xs font-semibold tracking-wider text-cork-500 uppercase"
              >Email</label
            >
            <input
              id="email"
              type="email"
              bind:value={email}
              required
              class="h-10 w-full rounded-lg border border-cork-300 bg-white/80 px-3 text-sm text-cork-800 placeholder:text-cork-400 focus:ring-2 focus:ring-cork-400/50 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              for="password"
              class="mb-1 block text-xs font-semibold tracking-wider text-cork-500 uppercase"
              >Password</label
            >
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              class="h-10 w-full rounded-lg border border-cork-300 bg-white/80 px-3 text-sm text-cork-800 placeholder:text-cork-400 focus:ring-2 focus:ring-cork-400/50 focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        {#if error}
          <p class="mt-3 text-sm text-red-600">{error}</p>
        {/if}

        <button
          type="submit"
          disabled={loading}
          class="mt-6 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cork-700 text-sm font-medium text-cork-50 transition-colors hover:bg-cork-800 disabled:opacity-50"
        >
          {#if loading}
            <LoaderCircle class="size-4 animate-spin" />
            Signing in...
          {:else}
            <LogIn class="size-4" />
            Sign In
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
