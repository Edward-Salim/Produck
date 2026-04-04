<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';
	import logoProduck from '$lib/assets/logo-produck.png';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { MapPinned, Users, FishSymbol, Route, Target, Map, ClipboardList, Scissors, WandSparkles } from '@lucide/svelte';

	let { children, data } = $props();
	let sidebarOpen = $state(false);

	// ── Workspace ──
	let selectedWorkspaceId = $derived(
		data.activeWorkspaceId ?? String(data.workspaces[0]?.id ?? '')
	);

	let selectedWorkspaceName = $derived(
		data.workspaces.find((w) => String(w.id) === selectedWorkspaceId)?.name ?? 'Workspace'
	);

	$effect(() => {
		if (selectedWorkspaceId) {
			document.cookie = `active_workspace=${selectedWorkspaceId};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
		}
	});

	function switchWorkspace(id: string | undefined) {
		if (!id || id === selectedWorkspaceId) return;
		document.cookie = `active_workspace=${id};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
		// Clear project context and reload
		const url = new URL(page.url);
		url.searchParams.delete('project');
		goto(url.toString(), { invalidateAll: true });
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
	let selectedProjectLabel = $derived(selectedProject?.shortName ?? selectedProject?.name ?? 'Select project');

	// Main page routes for Ctrl+Tab navigation (no tools)
	const NAV_PAGES = [
		'/story-map',
		'/personas',
		'/root-cause',
		'/experience-map',
		'/outcomes'
	];

	function getCurrentPageIndex(): number {
		return NAV_PAGES.findIndex((p) => page.url.pathname.startsWith(p));
	}

	function buildUrl(path: string): string {
		// Carry the current project param from the URL if available, otherwise use selected
		const currentProject = page.url.searchParams.get('project') ?? selectedProjectId;
		if (path === '/root-cause' || path === '/outcomes') return path;
		return `${path}?project=${currentProject}`;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!e.altKey || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
		// Don't intercept if user is typing in an input
		if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;
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

<Sidebar.Provider
	bind:open={sidebarOpen}
	style="--sidebar-width: 14rem;"
>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<div class="flex items-center gap-2 px-2 py-1">
				<img src={logoProduck} alt="Produck" class="size-5 shrink-0 object-contain" />
				<span class="font-display text-xl group-data-[collapsible=icon]:hidden">Produck</span>
			</div>
			{#if data.workspaces.length > 0}
				<div class="group-data-[collapsible=icon]:hidden px-2 pb-1">
					<Select.Root type="single" value={selectedWorkspaceId} onValueChange={switchWorkspace}>
						<Select.Trigger class="h-7 w-full bg-sidebar-accent/20 text-sidebar-foreground border-sidebar-border text-xs">
							<span class="truncate">{selectedWorkspaceName}</span>
						</Select.Trigger>
						<Select.Content class="bg-cork-50 border-cork-300" preventScroll={false}>
							{#each data.workspaces as ws (ws.id)}
								<Select.Item value={String(ws.id)} class="text-cork-700 focus:bg-cork-200/50 text-sm">
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
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								size="sm"
								isActive={page.url.pathname.startsWith('/story-map')}
								tooltipContent="Story Map"
							>
								{#snippet child({ props })}
									<a href="/story-map?project={selectedProjectId}" {...props}>
										<MapPinned />
										<span>Story Map</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								size="sm"
								isActive={page.url.pathname.startsWith('/personas')}
								tooltipContent="Personas"
							>
								{#snippet child({ props })}
									<a href="/personas?project={selectedProjectId}" {...props}>
										<Users />
										<span>Personas</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								size="sm"
								isActive={page.url.pathname.startsWith('/root-cause')}
								tooltipContent="Root Cause"
							>
								{#snippet child({ props })}
									<a href="/root-cause" {...props}>
										<FishSymbol />
										<span>Root Cause</span>
									</a>
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
									<a href="/experience-map?project={selectedProjectId}" {...props}>
										<Route />
										<span>Experience Map</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								size="sm"
								isActive={page.url.pathname.startsWith('/outcomes')}
								tooltipContent="Outcomes"
							>
								{#snippet child({ props })}
									<a href="/outcomes" {...props}>
										<Target />
										<span>Outcomes</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="sm" aria-disabled="true" class="pointer-events-none opacity-40" tooltipContent="Roadmap">
								<Map /><span>Roadmap</span>
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
									<a href="/tools/bg-remove" {...props}>
										<Scissors />
										<span>BG Remover</span>
									</a>
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
									<a href="/tools/image-enhance" {...props}>
										<WandSparkles />
										<span>Image Enhancer</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</Sidebar.Content>

		<Sidebar.Rail />
	</Sidebar.Root>

	<Sidebar.Inset class="bg-cork-100 h-svh overflow-y-auto">
		<header class="sticky top-0 z-10 flex items-center gap-3 px-4 py-1.5 border-b border-cork-200 bg-cork-100">
			<Sidebar.Trigger class="text-cork-500 hover:text-cork-800" />
			<div class="flex-1"></div>
			<Select.Root type="single" value={selectedProjectId} onValueChange={switchProject}>
				<Select.Trigger class="h-7 max-w-64 bg-cork-200/50 text-cork-700 border-cork-300 text-sm">
					<span class="truncate">{selectedProjectLabel}</span>
				</Select.Trigger>
				<Select.Content class="bg-cork-50 border-cork-300" preventScroll={false} align="end">
					{#each data.projects as proj (proj.id)}
						<Select.Item value={String(proj.id)} class="text-cork-700 focus:bg-cork-200/50">
							{proj.shortName ?? proj.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</header>
		<div class="px-6 pb-6 pt-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
