<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { MapPinned, Users, Map, ClipboardList, Egg, Scissors, ArrowUpFromLine } from '@lucide/svelte';

	let { children, data } = $props();
	let sidebarOpen = $state(false);

	let selectedProjectId = $derived(
		page.url.searchParams.get('project') ?? String(data.projects[0]?.id ?? '')
	);

	function switchProject(id: string | undefined) {
		if (!id) return;
		const url = new URL(page.url);
		url.searchParams.set('project', id);
		goto(url.toString());
	}

	let selectedProjectName = $derived(
		data.projects.find((p) => String(p.id) === selectedProjectId)?.name ?? 'Select project'
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Sidebar.Provider
	bind:open={sidebarOpen}
	style="--sidebar-width: 14rem;"
>
	<Sidebar.Root collapsible="icon">
		<Sidebar.Header>
			<div class="flex items-center gap-2 px-2 py-1">
				<Egg class="size-5 shrink-0" />
				<span class="font-display text-xl group-data-[collapsible=icon]:hidden">Produck</span>
			</div>
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
							<Sidebar.MenuButton size="sm" aria-disabled="true" class="pointer-events-none opacity-40" tooltipContent="Roadmap">
								<Map /><span>Roadmap</span>
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>

						<Sidebar.MenuItem>
							<Sidebar.MenuButton size="sm" aria-disabled="true" class="pointer-events-none opacity-40" tooltipContent="Backlog">
								<ClipboardList /><span>Backlog</span>
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
								isActive={page.url.pathname.startsWith('/tools/upscale')}
								tooltipContent="Upscaler"
							>
								{#snippet child({ props })}
									<a href="/tools/upscale" {...props}>
										<ArrowUpFromLine />
										<span>Upscaler</span>
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

	<Sidebar.Inset class="bg-cork-100 overflow-hidden">
		<header class="flex items-center gap-3 px-4 py-1.5 border-b border-cork-200">
			<Sidebar.Trigger class="text-cork-500 hover:text-cork-800" />
			<div class="flex-1"></div>
			<Select.Root type="single" value={selectedProjectId} onValueChange={switchProject}>
				<Select.Trigger class="h-7 max-w-64 bg-cork-200/50 text-cork-700 border-cork-300 text-sm">
					<span class="truncate">{selectedProjectName}</span>
				</Select.Trigger>
				<Select.Content class="bg-cork-50 border-cork-300">
					{#each data.projects as proj (proj.id)}
						<Select.Item value={String(proj.id)} class="text-cork-700 focus:bg-cork-200/50">
							{proj.name}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</header>
		<div class="flex-1 overflow-y-auto px-6 pb-6 pt-4">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
