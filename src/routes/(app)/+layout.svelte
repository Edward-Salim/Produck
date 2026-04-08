<script lang="ts">
  import favicon from '$lib/assets/favicon.ico';
  import logoProduck from '$lib/assets/logo-produck.png';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import {
    Lightbulb,
    Route,
    Target,
    Scissors,
    WandSparkles,
    BookOpen,
    Landmark,
    NotebookPen,
    GaugeCircle,
    FileText,
    Rss,
    LogOut,
    Shield,
    Check,
    X,
    Database
  } from '@lucide/svelte';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { progressColor } from '$lib/constants/colors.js';
  import { invalidateAll } from '$app/navigation';

  let { children, data } = $props();
  let sidebarOpen = $state(false);

  // ── Access management (admin only) ──
  let accessDialogOpen = $state(false);
  let accessUsers = $state<
    { id: number; email: string; displayName: string; role: string; projectIds: number[] }[]
  >([]);

  async function loadAccess() {
    const res = await fetch('/api/access');
    if (res.ok) {
      const json = await res.json();
      accessUsers = json.users;
    }
  }

  async function toggleProjectAccess(userId: number, projectId: number, hasAccess: boolean) {
    if (hasAccess) {
      await fetch(`/api/access?userId=${userId}&projectId=${projectId}`, { method: 'DELETE' });
    } else {
      await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId })
      });
    }
    await loadAccess();
    await invalidateAll();
  }

  // ── OKR mini panel ──
  let okrPanelOpen = $state(false);

  $effect(() => {
    okrPanelOpen = localStorage.getItem('okr_panel') === 'true';
  });

  function toggleOkrPanel() {
    okrPanelOpen = !okrPanelOpen;
    localStorage.setItem('okr_panel', String(okrPanelOpen));
  }

  let gaugeKRs = $derived(
    data.gaugeKRs as {
      description: string;
      targetValue: number;
      currentValue: number;
      unit: string;
    }[]
  );
  let gaugeYear = $derived(data.gaugeYear as number);
  let gaugeQuarter = $derived(data.gaugeQuarter as number);

  function okrProgress(targetValue: number, currentValue: number, unit: string): number {
    if (targetValue === 0) return 0;
    if (unit === 'min' || unit === 'hrs')
      return Math.max(0, Math.min(100, (targetValue / Math.max(currentValue, 0.1)) * 100));
    return Math.max(0, Math.min(100, (currentValue / targetValue) * 100));
  }

  const okrColor = progressColor;

  // ── Workspace ──
  let selectedWorkspaceId = $derived(
    data.activeWorkspaceId ?? String(data.workspaces[0]?.id ?? '')
  );

  let selectedWorkspaceName = $derived(
    data.workspaces.find((w) => String(w.id) === selectedWorkspaceId)?.name ?? 'Workspace'
  );

  async function switchWorkspace(id: string | undefined) {
    if (!id || id === selectedWorkspaceId) return;
    await fetch('/api/workspace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: id })
    });
    window.location.reload();
  }

  // ── Project ──
  let selectedProjectId = $derived(
    page.url.searchParams.get('project') ?? data.lastProject ?? String(data.projects[0]?.id ?? '')
  );

  $effect(() => {
    if (selectedProjectId) {
      document.cookie = `active_project=${selectedProjectId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    }
  });

  function switchProject(id: string | undefined) {
    if (!id) return;
    const url = new URL(page.url);
    url.searchParams.set('project', id);
    goto(url.toString());
  }

  let selectedProject = $derived(data.projects.find((p) => String(p.id) === selectedProjectId));
  let selectedProjectLabel = $derived(
    selectedProject?.shortName ?? selectedProject?.name ?? 'Select project'
  );

  // Main page routes for Ctrl+Tab navigation (no tools)
  const NAV_PAGES = ['/outcomes', '/experience-map', '/ideas'];

  function getCurrentPageIndex(): number {
    return NAV_PAGES.findIndex((p) => page.url.pathname.startsWith(p));
  }

  function buildUrl(path: string): string {
    // Carry the current project param from the URL if available, otherwise use selected
    const currentProject = page.url.searchParams.get('project') ?? selectedProjectId;
    if (path === '/outcomes') return path;
    return `${path}?project=${currentProject}`;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!e.altKey || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    // Don't intercept if user is typing in an input
    if (
      (e.target as HTMLElement)?.tagName === 'INPUT' ||
      (e.target as HTMLElement)?.tagName === 'TEXTAREA'
    )
      return;
    e.preventDefault();

    const current = getCurrentPageIndex();
    let next: number;

    if (e.key === 'ArrowLeft') {
      next = current <= 0 ? NAV_PAGES.length - 1 : current - 1;
    } else {
      next = current >= NAV_PAGES.length - 1 ? 0 : current + 1;
    }

    goto(buildUrl(NAV_PAGES[next]));
  }
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window onkeydown={handleKeydown} />

<Sidebar.Provider bind:open={sidebarOpen} style="--sidebar-width: 14rem;">
  <Sidebar.Root collapsible="icon">
    <Sidebar.Header>
      <div class="flex items-center gap-2 px-2 py-1">
        <img src={logoProduck} alt="Produck" class="size-5 shrink-0 object-contain" />
        <span class="font-display text-xl group-data-[collapsible=icon]:hidden">Produck</span>
      </div>
      {#if data.workspaces.length > 0}
        <div class="px-2 pb-1 group-data-[collapsible=icon]:hidden">
          <Select.Root type="single" value={selectedWorkspaceId} onValueChange={switchWorkspace}>
            <Select.Trigger
              class="h-7 w-full border-sidebar-border bg-sidebar-accent/20 text-xs text-sidebar-foreground"
            >
              <span class="truncate">{selectedWorkspaceName}</span>
            </Select.Trigger>
            <Select.Content class="border-cork-300 bg-cork-50" preventScroll={false}>
              {#each data.workspaces as ws (ws.id)}
                <Select.Item
                  value={String(ws.id)}
                  class="text-sm text-cork-700 focus:bg-cork-200/50"
                >
                  {ws.name}
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      {/if}
    </Sidebar.Header>

    <Sidebar.Content>
      <Sidebar.Group>
        <Sidebar.GroupLabel>Work</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/outcomes')}
                tooltipContent="Outcomes"
              >
                {#snippet child({ props })}
                  <a href="/outcomes" {...props}><Target /><span>Outcomes</span></a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/interview-snapshots')}
                tooltipContent="Interviews"
              >
                {#snippet child({ props })}
                  <a href="/interview-snapshots" {...props}
                    ><NotebookPen /><span>Interviews</span></a
                  >
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/experience-map')}
                tooltipContent="Experience Map"
              >
                {#snippet child({ props })}
                  <a href="/experience-map?project={selectedProjectId}" {...props}
                    ><Route /><span>Experience Map</span></a
                  >
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/ideas') ||
                  page.url.pathname.startsWith('/story-map')}
                tooltipContent="Idea Bank"
              >
                {#snippet child({ props })}
                  <a href="/ideas?project={selectedProjectId}" {...props}
                    ><Lightbulb /><span>Idea Bank</span></a
                  >
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>

      <Sidebar.Separator />

      <Sidebar.Group>
        <Sidebar.GroupLabel>Research</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/artifacts')}
                tooltipContent="PM Toolkit"
              >
                {#snippet child({ props })}
                  <a href="/artifacts" {...props}><BookOpen /><span>PM Toolkit</span></a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/landscape')}
                tooltipContent="Fintech Map"
              >
                {#snippet child({ props })}
                  <a href="/landscape" {...props}><Landmark /><span>Fintech Map</span></a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/trends')}
                tooltipContent="Trends"
              >
                {#snippet child({ props })}
                  <a href="/trends" {...props}><Rss /><span>Trends</span></a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>

      <Sidebar.Separator />

      <Sidebar.Group>
        <Sidebar.GroupLabel>Tools</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/tools/bg-remove')}
                tooltipContent="BG Remover"
              >
                {#snippet child({ props })}
                  <a href="/tools/bg-remove" {...props}><Scissors /><span>BG Remover</span></a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/tools/image-enhance')}
                tooltipContent="Image Enhancer"
              >
                {#snippet child({ props })}
                  <a href="/tools/image-enhance" {...props}
                    ><WandSparkles /><span>Image Enhancer</span></a
                  >
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                size="sm"
                isActive={page.url.pathname.startsWith('/tools/md-to-pdf')}
                tooltipContent="MD to PDF"
              >
                {#snippet child({ props })}
                  <a href="/tools/md-to-pdf" {...props}><FileText /><span>MD to PDF</span></a>
                {/snippet}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Content>

    <Sidebar.Footer class="border-t border-cork-300/40 pt-2">
      <div class="px-2 pb-1 group-data-[collapsible=icon]:hidden">
        <p class="truncate text-xs font-medium text-cork-700">
          {data.currentUser?.displayName ?? 'User'}
        </p>
        <p class="truncate text-[10px] text-cork-400">{data.currentUser?.email ?? ''}</p>
      </div>
      {#if data.isAdmin}
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              size="sm"
              isActive={page.url.pathname.startsWith('/admin')}
              tooltipContent="Admin Data"
            >
              {#snippet child({ props })}
                <a href="/admin" {...props}>
                  <Database />
                  <span>Admin Data</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton size="sm" tooltipContent="Manage Access">
              {#snippet child({ props })}
                <button
                  {...props}
                  onclick={() => {
                    loadAccess();
                    accessDialogOpen = true;
                  }}
                >
                  <Shield />
                  <span>Manage Access</span>
                </button>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      {/if}
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton size="sm" tooltipContent="Sign Out">
            {#snippet child({ props })}
              <button
                {...props}
                onclick={async () => {
                  await fetch('/api/auth', { method: 'DELETE' });
                  goto('/login');
                }}
              >
                <LogOut />
                <span>Sign Out</span>
              </button>
            {/snippet}
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Sidebar.Footer>
  </Sidebar.Root>

  <Sidebar.Inset class="h-svh overflow-y-auto bg-cork-100">
    <header class="sticky top-0 z-10 border-b border-cork-200 bg-cork-100">
      <div class="flex items-center gap-3 px-4 py-1.5">
        <Sidebar.Trigger class="text-cork-500 hover:text-cork-800" />
        <button
          type="button"
          class="flex size-6 cursor-pointer items-center justify-center rounded transition-colors {okrPanelOpen
            ? 'bg-cork-700 text-cork-50'
            : 'text-cork-400 hover:text-cork-600'}"
          onclick={toggleOkrPanel}
          title="Toggle OKR panel"
        >
          <GaugeCircle class="size-4" />
        </button>
        <div class="flex-1"></div>
        <Select.Root type="single" value={selectedProjectId} onValueChange={switchProject}>
          <Select.Trigger class="h-7 max-w-64 border-cork-300 bg-cork-200/50 text-sm text-cork-700">
            <span class="truncate">{selectedProjectLabel}</span>
          </Select.Trigger>
          <Select.Content class="border-cork-300 bg-cork-50" preventScroll={false} align="end">
            {#each data.projects as proj (proj.id)}
              <Select.Item value={String(proj.id)} class="text-cork-700 focus:bg-cork-200/50">
                {proj.shortName ?? proj.name}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>

      {#if okrPanelOpen && gaugeKRs.length > 0}
        <a
          href="/outcomes"
          class="flex cursor-pointer items-center gap-3 border-t border-cork-200/50 px-4 py-1.5 transition-colors hover:bg-cork-200/30"
        >
          <span class="shrink-0 text-[9px] font-bold tracking-widest text-cork-400 uppercase"
            >Q{gaugeQuarter} FY{gaugeYear}</span
          >
          {#each gaugeKRs as kr}
            {@const pct = okrProgress(kr.targetValue, kr.currentValue, kr.unit)}
            <div class="flex min-w-0 flex-1 items-center gap-1.5" title={kr.description}>
              <span class="max-w-28 truncate text-[9px] text-cork-500">{kr.description}</span>
              <div class="h-1 w-12 overflow-hidden rounded-full bg-cork-300/40">
                <div
                  class="h-full rounded-full"
                  style="width: {pct}%; background: {okrColor(pct)};"
                ></div>
              </div>
              <span class="text-[9px] text-cork-400">{Math.round(pct)}%</span>
            </div>
          {/each}
        </a>
      {/if}
    </header>
    <div class="px-6 pt-4 pb-6">
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>

<!-- Access Management Dialog (admin only) -->
{#if data.isAdmin}
  <Dialog.Root bind:open={accessDialogOpen}>
    <Dialog.Content class="max-w-lg border-cork-300 bg-cork-50">
      <Dialog.Header>
        <Dialog.Title class="text-cork-800">Manage Access</Dialog.Title>
        <Dialog.Description class="text-cork-500"
          >Control which projects each user can see</Dialog.Description
        >
      </Dialog.Header>

      <div class="max-h-96 space-y-4 overflow-y-auto">
        {#each accessUsers.filter((u) => u.role !== 'admin') as user (user.id)}
          <div class="rounded-lg border border-cork-200 bg-white p-3">
            <div class="mb-2 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-cork-700">{user.displayName}</p>
                <p class="text-[10px] text-cork-400">{user.email}</p>
              </div>
              <span
                class="rounded-full bg-cork-200 px-2 py-0.5 text-[10px] font-medium text-cork-600"
                >{user.role}</span
              >
            </div>
            <div class="space-y-1">
              {#each data.projects as proj (proj.id)}
                {@const hasAccess = user.projectIds.includes(proj.id)}
                <button
                  type="button"
                  class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors {hasAccess
                    ? 'bg-cork-100 text-cork-700'
                    : 'text-cork-400 hover:bg-cork-50'}"
                  onclick={() => toggleProjectAccess(user.id, proj.id, hasAccess)}
                >
                  {#if hasAccess}
                    <Check class="size-3.5 text-green-600" />
                  {:else}
                    <X class="size-3.5 text-cork-300" />
                  {/if}
                  <span>{proj.shortName ?? proj.name}</span>
                </button>
              {/each}
            </div>
          </div>
        {/each}
        {#if accessUsers.filter((u) => u.role !== 'admin').length === 0}
          <p class="py-4 text-center text-sm text-cork-400">No member accounts yet</p>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}
