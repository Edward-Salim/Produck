<script lang="ts">
  import logoProduck from '$lib/assets/brand/logo-produck.png';
  import edwardAvatar from '$lib/assets/profile/edward.jpg';
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import * as Select from '$lib/components/ui/select/index.js';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { saveLastAppPagePath, clearLastAppPagePath } from '$lib/client/last-app-page.js';
  import { getDeprecatedFeature } from '$lib/constants/deprecated-features.js';
  import { getFullscreen } from '$lib/stores/fullscreen.svelte.js';
  import { autoHideReaderTopbar } from '$lib/attachments/reader-topbar.js';

  let fullscreen = $derived(getFullscreen());
  import Layers3 from '@lucide/svelte/icons/layers';
  import PenLine from '@lucide/svelte/icons/pen-line';
  import Wrench from '@lucide/svelte/icons/wrench';
  import LibraryBig from '@lucide/svelte/icons/library-big';
  import WalletCards from '@lucide/svelte/icons/wallet-cards';
  import GaugeCircle from '@lucide/svelte/icons/circle-gauge';
  import Rss from '@lucide/svelte/icons/rss';
  import LogOut from '@lucide/svelte/icons/log-out';
  import EllipsisVertical from '@lucide/svelte/icons/ellipsis-vertical';
  import Shield from '@lucide/svelte/icons/shield';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import { DropdownMenu } from 'bits-ui';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { progressColor } from '$lib/constants/colors.js';
  import { invalidateAll } from '$app/navigation';

  let { children, data } = $props();
  let sidebarOpen = $state(false);
  let topbarHeight = $state(0);
  let temporaryPenActive = $state(false);
  let temporaryPenStrokes = $state<{ id: number; path: string; fading: boolean }[]>([]);
  let activePenPointerId: number | null = null;
  let activePenStrokeId: number | null = null;
  let pendingPenStart: { x: number; y: number } | null = null;
  let pendingPenClickTarget: HTMLElement | null = null;
  let nextPenStrokeId = 0;
  let dockedFrameworkSidebar = $derived(page.url.pathname === '/frameworks' && !fullscreen);

  function schedulePenStrokeFade(strokeId: number) {
    window.setTimeout(() => {
      const stroke = temporaryPenStrokes.find((item) => item.id === strokeId);
      if (!stroke) return;
      stroke.fading = true;
      window.setTimeout(() => {
        temporaryPenStrokes = temporaryPenStrokes.filter((item) => item.id !== strokeId);
      }, 400);
    }, 1400);
  }

  function toggleTemporaryPen() {
    temporaryPenActive = !temporaryPenActive;
    if (!temporaryPenActive) {
      if (activePenStrokeId !== null) schedulePenStrokeFade(activePenStrokeId);
      activePenStrokeId = null;
      activePenPointerId = null;
      pendingPenStart = null;
      pendingPenClickTarget = null;
    }
  }

  function findUnderlyingClickTarget(
    overlay: SVGSVGElement,
    clientX: number,
    clientY: number
  ): HTMLElement | null {
    const target = document
      .elementsFromPoint(clientX, clientY)
      .find((element) => !overlay.contains(element));
    if (!target) return null;

    const control = target.closest(
      'button, a[href], input, select, textarea, label, summary, [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
    );
    if (control instanceof HTMLElement) return control;
    if (target instanceof HTMLElement) return target;

    for (let parent = target.parentElement; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLElement) return parent;
    }
    return null;
  }

  function replayPenClick(target: HTMLElement) {
    if (!target.isConnected) return;
    if (
      target.matches(
        'button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
      )
    ) {
      target.focus({ preventScroll: true });
    }
    target.click();
  }

  function startPenStroke(event: PointerEvent) {
    if (!temporaryPenActive || event.button !== 0 || event.isPrimary === false) return;
    if (event.pointerType !== 'touch') event.preventDefault();
    if (!(event.currentTarget instanceof SVGSVGElement)) return;
    activePenPointerId = event.pointerId;
    activePenStrokeId = null;
    pendingPenStart = { x: event.clientX, y: event.clientY };
    pendingPenClickTarget = findUnderlyingClickTarget(
      event.currentTarget,
      event.clientX,
      event.clientY
    );
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function continuePenStroke(event: PointerEvent) {
    if (!temporaryPenActive || event.pointerId !== activePenPointerId || !pendingPenStart) {
      return;
    }
    if (event.pointerType !== 'touch') event.preventDefault();

    if (activePenStrokeId === null) {
      const distance = Math.hypot(
        event.clientX - pendingPenStart.x,
        event.clientY - pendingPenStart.y
      );
      if (distance < 6) return;

      activePenStrokeId = ++nextPenStrokeId;
      pendingPenClickTarget = null;
      temporaryPenStrokes.push({
        id: activePenStrokeId,
        path: `M ${pendingPenStart.x} ${pendingPenStart.y} L ${event.clientX} ${event.clientY}`,
        fading: false
      });
      return;
    }

    const stroke = temporaryPenStrokes.find((item) => item.id === activePenStrokeId);
    if (stroke) stroke.path += ` L ${event.clientX} ${event.clientY}`;
  }

  function finishPenStroke(event: PointerEvent) {
    if (event.pointerId !== activePenPointerId || !pendingPenStart) return;
    const cancelled = event.type === 'pointercancel';
    if (activePenStrokeId !== null) {
      if (cancelled && event.pointerType === 'touch') {
        temporaryPenStrokes = temporaryPenStrokes.filter((item) => item.id !== activePenStrokeId);
      } else {
        schedulePenStrokeFade(activePenStrokeId);
      }
    } else if (!cancelled && pendingPenClickTarget) {
      replayPenClick(pendingPenClickTarget);
    }
    activePenPointerId = null;
    activePenStrokeId = null;
    pendingPenStart = null;
    pendingPenClickTarget = null;
  }

  function forwardPenWheel(event: WheelEvent) {
    if (!temporaryPenActive || !(event.currentTarget instanceof SVGSVGElement)) return;

    const overlay = event.currentTarget;
    const target = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find((element) => !overlay.contains(element));
    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    if (event.shiftKey && deltaX === 0) {
      deltaX = deltaY;
      deltaY = 0;
    }

    const multiplier =
      event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
    deltaX *= multiplier;
    deltaY *= multiplier;

    for (let element: Element | null = target ?? null; element; element = element.parentElement) {
      if (!(element instanceof HTMLElement)) continue;
      const styles = window.getComputedStyle(element);
      const maxScrollX = element.scrollWidth - element.clientWidth;
      const maxScrollY = element.scrollHeight - element.clientHeight;
      const canScrollX =
        deltaX !== 0 &&
        ['auto', 'scroll', 'overlay'].includes(styles.overflowX) &&
        (deltaX > 0 ? element.scrollLeft < maxScrollX : element.scrollLeft > 0);
      const canScrollY =
        deltaY !== 0 &&
        ['auto', 'scroll', 'overlay'].includes(styles.overflowY) &&
        (deltaY > 0 ? element.scrollTop < maxScrollY : element.scrollTop > 0);

      if (canScrollX || canScrollY) {
        event.preventDefault();
        if (canScrollX) element.scrollLeft += deltaX;
        if (canScrollY) element.scrollTop += deltaY;
        return;
      }
    }

    const appScroller = document.querySelector<HTMLElement>('[data-slot="sidebar-inset"]');
    if (appScroller) {
      event.preventDefault();
      appScroller.scrollLeft += deltaX;
      appScroller.scrollTop += deltaY;
    }
  }

  // ── Access management (admin only) ──
  let accessDialogOpen = $state(false);
  let accessLoading = $state(false);
  let accessProjects = $state<
    {
      id: number;
      workspaceId: number;
      workspaceName: string;
      name: string;
      shortName: string | null;
    }[]
  >([]);
  let accessUsers = $state<
    {
      id: number;
      email: string;
      displayName: string;
      role: string;
      projectIds: number[];
      workspaceIds: number[];
    }[]
  >([]);

  async function loadAccess() {
    accessLoading = true;
    const res = await fetch('/api/access');
    if (res.ok) {
      const json = await res.json();
      accessProjects = json.projects;
      accessUsers = json.users;
    }
    accessLoading = false;
  }

  function projectsForWorkspace(workspaceId: number) {
    return accessProjects.filter((project) => project.workspaceId === workspaceId);
  }

  function formatRole(role: string) {
    return role ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() : '';
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

  async function toggleWorkspaceAccess(userId: number, workspaceId: number, hasAccess: boolean) {
    if (hasAccess) {
      await fetch(`/api/access?userId=${userId}&workspaceId=${workspaceId}`, { method: 'DELETE' });
    } else {
      await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, workspaceId })
      });
    }
    await loadAccess();
    await invalidateAll();
  }

  async function deleteUser(userId: number) {
    await fetch(`/api/access?userId=${userId}&deleteUser=1`, { method: 'DELETE' });
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

  function announceContextSwitch(state: 'start' | 'end') {
    window.dispatchEvent(new Event(`produck:context-switch-${state}`));
  }

  let switchingContext = false;

  async function switchWorkspace(id: string | undefined) {
    if (!id || id === selectedWorkspaceId || switchingContext) return;
    switchingContext = true;
    announceContextSwitch('start');
    try {
      const response = await fetch('/api/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: id })
      });
      if (!response.ok) throw new Error('Failed to switch workspace');
      const url = new URL(page.url);
      url.searchParams.delete('project');
      url.searchParams.delete('framework');
      await goto(url, { invalidateAll: true, replaceState: true });
    } catch (error) {
      console.error('Workspace switch failed:', error);
    } finally {
      switchingContext = false;
      announceContextSwitch('end');
    }
  }

  // ── Project ──
  let selectedProjectId = $derived(data.lastProject);

  $effect(() => {
    saveLastAppPagePath(page.url.pathname);
    sessionStorage.removeItem('produck_show_landing');
  });

  async function switchProject(id: string | undefined) {
    if (!id || id === selectedProjectId || switchingContext) return;
    switchingContext = true;
    announceContextSwitch('start');
    const url = new URL(page.url);
    url.searchParams.set('project', id);
    url.searchParams.delete('framework');
    try {
      await goto(url.toString(), { invalidateAll: true });
    } finally {
      switchingContext = false;
      announceContextSwitch('end');
    }
  }

  let selectedProject = $derived(data.projects.find((p) => String(p.id) === selectedProjectId));
  let selectedProjectLabel = $derived(
    selectedProject?.shortName ?? selectedProject?.name ?? 'Select project'
  );

  // Active main page routes for Alt+Arrow navigation (no tools).
  const NAV_PAGES = ['/frameworks', '/books'];
  const deprecatedFeature = $derived(getDeprecatedFeature(page.url.pathname));

  function getCurrentPageIndex(): number {
    return NAV_PAGES.findIndex((p) => page.url.pathname.startsWith(p));
  }

  function buildUrl(path: string): string {
    return selectedProjectId ? `${path}?project=${selectedProjectId}` : path;
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

  function showLandingPage() {
    sessionStorage.setItem('produck_show_landing', '1');
  }
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>
<svelte:window onkeydown={handleKeydown} />

<Sidebar.Provider bind:open={sidebarOpen} style="--sidebar-width: 14rem;">
  {#if !fullscreen}
    <Sidebar.Root collapsible="icon">
      <Sidebar.Header>
        <a
          href="/"
          onclick={showLandingPage}
          class="flex items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-sidebar-accent/40"
        >
          <img src={logoProduck} alt="Produck" class="size-5 shrink-0 object-contain" />
          <span class="font-display text-xl group-data-[collapsible=icon]:hidden">Produck</span>
        </a>
        {#if data.workspaces.length > 0}
          <div class="px-2 pb-1 group-data-[collapsible=icon]:hidden">
            <span
              class="mb-1 block text-[9px] font-semibold tracking-wider text-sidebar-foreground/40 uppercase"
              >Workspace</span
            >
            <Select.Root type="single" value={selectedWorkspaceId} onValueChange={switchWorkspace}>
              <Select.Trigger
                class="h-7 w-full cursor-pointer border-sidebar-border bg-sidebar-accent/20 text-xs text-sidebar-foreground transition-colors hover:bg-sidebar-accent/40"
              >
                <span class="truncate">{selectedWorkspaceName}</span>
              </Select.Trigger>
              <Select.Content class="border-cork-300 bg-cork-50" preventScroll={false}>
                {#each data.workspaces as ws (ws.id)}
                  <Select.Item
                    value={String(ws.id)}
                    class="cursor-pointer text-sm text-cork-700 hover:bg-cork-200/50 focus:bg-cork-200/50"
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
                  isActive={page.url.pathname.startsWith('/frameworks')}
                  tooltipContent="Frameworks"
                >
                  {#snippet child({ props })}
                    <a href="/frameworks" {...props}><Layers3 /><span>Frameworks</span></a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>

        <Sidebar.Separator />

        <Sidebar.Group>
          <Sidebar.GroupLabel>Knowledge</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  size="sm"
                  isActive={page.url.pathname.startsWith('/books')}
                  tooltipContent="Book Summaries"
                >
                  {#snippet child({ props })}
                    <a href="/books" {...props}><LibraryBig /><span>Book Summaries</span></a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
              {#if !data.restrictedSections.includes('trends')}
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
              {/if}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>

        <Sidebar.Separator />

        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {#if !data.restrictedSections.includes('financial-tracker')}
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton
                    size="sm"
                    isActive={page.url.pathname.startsWith('/financial-tracker')}
                    tooltipContent="Financial Tracker"
                  >
                    {#snippet child({ props })}
                      <a href="/financial-tracker" {...props}
                        ><WalletCards /><span>Financial Tracker</span></a
                      >
                    {/snippet}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              {/if}
              <Sidebar.MenuItem>
                <Sidebar.MenuButton
                  size="sm"
                  isActive={page.url.pathname.startsWith('/tools')}
                  tooltipContent="Tools"
                >
                  {#snippet child({ props })}
                    <a href="/tools" {...props}><Wrench /><span>Tools</span></a>
                  {/snippet}
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>

      <Sidebar.Footer class="border-t border-cork-300/40 pt-2">
        <div
          class="flex items-center gap-2 px-2 pb-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          {#if data.currentUser?.email === 'edward.salim@produck.fun'}
            <img
              src={edwardAvatar}
              alt="Avatar"
              class="size-7 shrink-0 rounded-full object-cover ring-2 ring-cork-400/40 group-data-[collapsible=icon]:hidden"
            />
          {:else}
            <span
              class="flex size-7 shrink-0 items-center justify-center rounded-full bg-cork-600 text-xs font-semibold text-cork-50 group-data-[collapsible=icon]:hidden"
            >
              {(data.currentUser?.displayName ?? 'U').charAt(0).toUpperCase()}
            </span>
          {/if}
          <div class="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p class="truncate text-xs font-medium text-sidebar-foreground">
              {data.currentUser?.displayName ?? 'User'}
            </p>
            <p class="truncate text-[10px] text-sidebar-foreground/50">
              {data.currentUser?.email ?? ''}
            </p>
          </div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded text-cork-400 transition-colors hover:bg-cork-200/50 hover:text-cork-600"
            >
              <EllipsisVertical class="size-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="top"
                align="end"
                sideOffset={8}
                class="z-50 min-w-40 rounded-lg border border-cork-300 bg-cork-50 p-1 shadow-md"
              >
                {#if data.isAdmin}
                  <DropdownMenu.Item
                    class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-cork-700 outline-none hover:bg-cork-200/50 data-highlighted:bg-cork-200/50"
                    onSelect={() => {
                      loadAccess();
                      accessDialogOpen = true;
                    }}
                  >
                    <Shield class="size-3.5" />
                    Manage Access
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator class="my-1 h-px bg-cork-300/40" />
                {/if}
                <DropdownMenu.Item
                  class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-cork-700 outline-none hover:bg-cork-200/50 data-highlighted:bg-cork-200/50"
                  onSelect={async () => {
                    await fetch('/api/auth', { method: 'DELETE' });
                    clearLastAppPagePath();
                    goto('/login');
                  }}
                >
                  <LogOut class="size-3.5" />
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </Sidebar.Footer>
    </Sidebar.Root>
  {/if}

  <Sidebar.Inset
    class={[
      'flex h-svh flex-col overflow-y-auto bg-cork-100 [scrollbar-gutter:stable]',
      dockedFrameworkSidebar && 'lg:overflow-hidden lg:[scrollbar-gutter:auto]'
    ]}
    style="--app-topbar-height: {fullscreen ? 0 : topbarHeight}px;"
  >
    {#if !fullscreen}
      <header
        class="reader-topbar sticky top-0 z-50 shrink-0 border-b border-cork-200 bg-cork-100"
        bind:offsetHeight={topbarHeight}
        {@attach autoHideReaderTopbar(page.url.pathname)}
      >
        <div class="flex items-center gap-2 px-4 py-1.5 md:gap-3">
          <Sidebar.Trigger class="cursor-pointer text-cork-500 hover:text-cork-800" />
          <button
            type="button"
            class="flex size-7 cursor-pointer items-center justify-center rounded transition-colors {temporaryPenActive
              ? 'bg-cork-700 text-cork-50 hover:bg-cork-800'
              : 'text-cork-400 hover:bg-cork-200/70 hover:text-cork-700'}"
            onclick={toggleTemporaryPen}
            aria-label={
              temporaryPenActive ? 'Turn temporary red pen off' : 'Turn temporary red pen on'
            }
            aria-pressed={temporaryPenActive}
            title={temporaryPenActive ? 'Turn temporary red pen off' : 'Draw temporarily over the screen'}
          >
            <PenLine class="size-4" />
          </button>
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
          {#if data.projects.length > 0}
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-semibold tracking-wider text-cork-400 uppercase"
                >Project</span
              >
              <Select.Root type="single" value={selectedProjectId} onValueChange={switchProject}>
                <Select.Trigger
                  class="h-7 max-w-64 cursor-pointer border-cork-300 bg-cork-200/50 text-sm text-cork-700 shadow-none"
                >
                  <span class="truncate">{selectedProjectLabel}</span>
                </Select.Trigger>
                <Select.Content
                  class="border-cork-300 bg-cork-50"
                  preventScroll={false}
                  align="end"
                >
                  {#each data.projects as proj (proj.id)}
                    <Select.Item
                      value={String(proj.id)}
                      class="cursor-pointer text-cork-700 hover:bg-cork-200/50 focus:bg-cork-200/50"
                    >
                      {proj.shortName ?? proj.name}
                    </Select.Item>
                  {/each}
                </Select.Content>
              </Select.Root>
            </div>
          {/if}
        </div>

        {#if okrPanelOpen && gaugeKRs.length > 0}
          <a
            href="/frameworks"
            class="flex cursor-pointer items-center gap-3 border-t border-cork-200/50 px-4 py-1.5 transition-colors hover:bg-cork-200/30 max-md:hidden"
          >
            <span class="shrink-0 text-[9px] font-bold tracking-widest text-cork-400 uppercase"
              >Q{gaugeQuarter} FY{gaugeYear}</span
            >
            {#each gaugeKRs as kr (kr.description)}
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
          <a
            href="/frameworks"
            class="block cursor-pointer border-t border-cork-200/50 py-2 pr-6 pl-8 transition-colors hover:bg-cork-200/30 md:hidden"
          >
            <span class="mb-1.5 block text-[9px] font-bold tracking-widest text-cork-400 uppercase"
              >Q{gaugeQuarter} FY{gaugeYear}</span
            >
            <div class="space-y-1.5">
              {#each gaugeKRs as kr (kr.description)}
                {@const pct = okrProgress(kr.targetValue, kr.currentValue, kr.unit)}
                <div class="flex items-center gap-2">
                  <span class="min-w-0 flex-1 truncate text-[10px] text-cork-500"
                    >{kr.description}</span
                  >
                  <div class="h-1 w-16 shrink-0 overflow-hidden rounded-full bg-cork-300/40">
                    <div
                      class="h-full rounded-full"
                      style="width: {pct}%; background: {okrColor(pct)};"
                    ></div>
                  </div>
                  <span class="w-9 shrink-0 text-right text-[9px] text-cork-400"
                    >{Math.round(pct)}%</span
                  >
                </div>
              {/each}
            </div>
          </a>
        {/if}
      </header>
    {/if}
    {@const noAccess = !data.isAdmin && data.workspaces.length === 0 && data.projects.length === 0}
    {@const isWorkRoute =
      !page.url.pathname.startsWith('/tools') &&
      !page.url.pathname.startsWith('/books') &&
      !page.url.pathname.startsWith('/artifacts') &&
      !page.url.pathname.startsWith('/jobs')}
    {#if noAccess && isWorkRoute}
      <div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p class="font-display text-lg text-cork-700">Can't access this page yet</p>
        <p class="mt-1 max-w-sm text-sm text-cork-400">
          You don't have a workspace or project assigned. Ask your admin to set you up, or browse
          the <a href="/tools" class="underline underline-offset-2 hover:text-cork-600">Tools</a> from
          the sidebar in the meantime.
        </p>
      </div>
    {:else}
      <div
        class={['px-4 pt-6 pb-6 md:px-6', dockedFrameworkSidebar && 'lg:min-h-0 lg:flex-1 lg:p-0']}
      >
        {#if deprecatedFeature}
          <p
            class="mb-6 rounded-lg border border-cork-300 bg-cork-100 px-4 py-3 text-sm text-cork-600"
          >
            {deprecatedFeature.name} is deprecated and no longer maintained.
          </p>
        {/if}
        {@render children()}
      </div>
    {/if}
    {#if temporaryPenActive || temporaryPenStrokes.length > 0}
      <svg
        class={['temporary-pen-overlay', { active: temporaryPenActive }]}
        aria-hidden="true"
        focusable="false"
        onpointerdown={startPenStroke}
        onpointermove={continuePenStroke}
        onpointerup={finishPenStroke}
        onpointercancel={finishPenStroke}
        onwheel={forwardPenWheel}
      >
        {#each temporaryPenStrokes as stroke (stroke.id)}
          <path
            d={stroke.path}
            class={['temporary-pen-stroke', { fading: stroke.fading }]}
            fill="none"
          />
        {/each}
      </svg>
    {/if}
  </Sidebar.Inset>
</Sidebar.Provider>

<!-- Access Management Dialog (admin only) -->
{#if data.isAdmin}
  <Dialog.Root bind:open={accessDialogOpen}>
    <Dialog.Content class="max-w-[calc(100%-3rem)] border-cork-300 bg-cork-50 sm:max-w-lg">
      <Dialog.Header>
        <Dialog.Title class="text-cork-800">Manage Access</Dialog.Title>
        <Dialog.Description class="text-cork-500"
          >Control which projects each user can see</Dialog.Description
        >
      </Dialog.Header>

      <div
        class="max-h-96 space-y-4 overflow-y-auto px-1 [scrollbar-color:theme(--color-cork-300/40)_transparent] [scrollbar-width:thin]"
      >
        {#if accessLoading}
          {#each [1, 2, 3] as _ (_)}
            <div class="animate-pulse rounded-lg border border-cork-200 bg-white p-3">
              <div class="mb-2 flex items-center justify-between">
                <div class="space-y-1.5">
                  <div class="h-3.5 w-24 rounded bg-cork-200"></div>
                  <div class="h-2.5 w-36 rounded bg-cork-100"></div>
                </div>
                <div class="h-5 w-14 rounded-full bg-cork-200"></div>
              </div>
              <div class="space-y-1.5">
                <div class="h-7 w-full rounded bg-cork-100"></div>
                <div class="h-7 w-full rounded bg-cork-100"></div>
              </div>
            </div>
          {/each}
        {:else}
          {#each accessUsers.filter((u) => u.role !== 'admin') as user (user.id)}
            <div class="rounded-lg border border-cork-200 bg-white p-3">
              <div class="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-medium text-cork-700">{user.displayName}</p>
                  <p class="text-[10px] text-cork-400">{user.email}</p>
                </div>
                <div class="flex shrink-0 items-center gap-1.5">
                  <span
                    class="rounded-full bg-cork-200 px-2 py-0.5 text-[10px] font-medium text-cork-600"
                    >{formatRole(user.role)}</span
                  >
                  <button
                    type="button"
                    class="flex size-7 cursor-pointer items-center justify-center rounded-md text-cork-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${user.displayName}`}
                    title="Remove account"
                    onclick={() => {
                      if (confirm(`Remove ${user.displayName} (${user.email})?`))
                        deleteUser(user.id);
                    }}
                  >
                    <Trash2 class="size-3.5" />
                  </button>
                </div>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="mb-1 text-[9px] font-semibold tracking-wider text-cork-400 uppercase">
                    Access Tree
                  </p>
                  <div class="space-y-2">
                    {#each data.workspaces as ws (ws.id)}
                      {@const hasWsAccess = user.workspaceIds.includes(ws.id)}
                      {@const workspaceProjects = projectsForWorkspace(ws.id)}
                      <div>
                        <button
                          type="button"
                          class="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors {hasWsAccess
                            ? 'text-cork-700'
                            : 'text-cork-400 hover:bg-cork-50'}"
                          onclick={() => toggleWorkspaceAccess(user.id, ws.id, hasWsAccess)}
                        >
                          <span
                            class="flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors {hasWsAccess
                              ? 'border-cork-700 bg-cork-700'
                              : 'border-cork-300 bg-white'}"
                          >
                            {#if hasWsAccess}
                              <svg class="size-2.5 text-white" viewBox="0 0 12 12" fill="none"
                                ><path
                                  d="M2.5 6l2.5 2.5 4.5-5"
                                  stroke="currentColor"
                                  stroke-width="1.5"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                /></svg
                              >
                            {/if}
                          </span>
                          <span>{ws.name}</span>
                        </button>

                        {#if workspaceProjects.length > 0}
                          <div class="ml-3 pl-3">
                            {#each workspaceProjects as proj, projectIndex (proj.id)}
                              {@const hasAccess = user.projectIds.includes(proj.id)}
                              <button
                                type="button"
                                class="relative flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors before:absolute before:top-1/2 before:-left-3 before:h-px before:w-3 before:bg-cork-200/80 after:absolute after:top-0 after:-left-3 after:w-px after:bg-cork-200/80 {projectIndex ===
                                workspaceProjects.length - 1
                                  ? 'after:bottom-1/2'
                                  : 'after:bottom-0'} {hasAccess
                                  ? 'text-cork-700'
                                  : 'text-cork-400 hover:bg-cork-50'}"
                                onclick={() => toggleProjectAccess(user.id, proj.id, hasAccess)}
                              >
                                <span
                                  class="flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors {hasAccess
                                    ? 'border-cork-700 bg-cork-700'
                                    : 'border-cork-300 bg-white'}"
                                >
                                  {#if hasAccess}
                                    <svg class="size-2.5 text-white" viewBox="0 0 12 12" fill="none"
                                      ><path
                                        d="M2.5 6l2.5 2.5 4.5-5"
                                        stroke="currentColor"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                      /></svg
                                    >
                                  {/if}
                                </span>
                                <span>{proj.shortName ?? proj.name}</span>
                              </button>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/each}
          {#if accessUsers.filter((u) => u.role !== 'admin').length === 0}
            <p class="py-4 text-center text-sm text-cork-400">No member accounts yet</p>
          {/if}
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{/if}

<style>
  .temporary-pen-overlay {
    position: fixed;
    z-index: 40;
    inset: 0;
    width: 100vw;
    height: 100dvh;
    overflow: hidden;
    pointer-events: none;
    touch-action: pan-x pan-y;
  }

  .temporary-pen-overlay.active {
    cursor: crosshair;
    pointer-events: auto;
  }

  .temporary-pen-stroke {
    stroke: #ff0000;
    stroke-width: 3.5px;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 1;
    transition: opacity 400ms ease-out;
  }

  .temporary-pen-stroke.fading {
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .temporary-pen-stroke {
      transition: none;
    }
  }

  @media (max-width: 767px) {
    .reader-topbar {
      transition: transform 180ms ease;
    }

    .reader-topbar[data-scroll-hidden] {
      transform: translateY(-100%);
      pointer-events: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .reader-topbar {
      transition: none;
    }
  }
</style>
