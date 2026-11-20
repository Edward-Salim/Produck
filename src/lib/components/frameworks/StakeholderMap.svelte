<script lang="ts">
  import { ID, SG } from 'country-flag-icons/string/3x2';
  import type { FrameworkInstance } from './types.js';

  const flags = {
    ID: { label: 'Indonesia', src: 'data:image/svg+xml,' + encodeURIComponent(ID) },
    SG: { label: 'Singapore', src: 'data:image/svg+xml,' + encodeURIComponent(SG) }
  };
  type Stakeholder = {
    name: string;
    title: string;
    department: string;
    responsibility?: string;
    location?: string;
    countryCode?: keyof typeof flags;
    countryCodes?: (keyof typeof flags)[];
    photo?: string;
  };

  let { instance }: { instance: FrameworkInstance } = $props();

  let departments = $derived.by(() => {
    const groups: Record<string, Stakeholder[]> = Object.create(null);
    const stakeholders: Stakeholder[] = JSON.parse(instance.values.stakeholders ?? '[]');
    for (const stakeholder of stakeholders) {
      (groups[stakeholder.department] ??= []).push(stakeholder);
    }
    return Object.entries(groups);
  });
</script>

<div class="mx-auto max-w-4xl space-y-5">
  {#each departments as [name, people] (name)}
    {@const hasResponsibilities = people.some((person) => person.responsibility?.trim())}
    <section>
      <h2 class="mb-2 font-display text-lg text-cork-800">{name}</h2>
      <div class="overflow-x-auto rounded-lg">
        <table
          class="w-full table-fixed text-left text-sm {hasResponsibilities
            ? 'min-w-[34rem]'
            : 'min-w-[22rem]'}"
          aria-label={name}
        >
          <colgroup>
            <col class="w-14 sm:w-16" />
            <col class="w-1/3" />
            <col />
            {#if hasResponsibilities}
              <col class="w-1/4" />
            {/if}
            <col class="w-16 sm:w-20" />
          </colgroup>
          <thead class="bg-cork-100 text-xs text-cork-700">
            <tr>
              <th scope="col" class="py-2.5 pl-3 sm:pl-4">Photo</th>
              <th scope="col" class="px-2 py-2.5">Name</th>
              <th scope="col" class="px-2 py-2.5">Job title</th>
              {#if hasResponsibilities}
                <th scope="col" class="px-2 py-2.5">Responsibility</th>
              {/if}
              <th scope="col" class="px-2 py-2.5 text-center">Location</th>
            </tr>
          </thead>
          <tbody>
            {#each people as person (person.name)}
              {@const nameParts = person.name.split(' ')}
              {@const countryCodes =
                person.countryCodes ?? (person.countryCode ? [person.countryCode] : [])}
              <tr>
                <td class="py-2 pr-2 pl-3 sm:pl-4">
                  {#if person.photo}
                    <img
                      class="size-8 rounded-full object-cover"
                      src={person.photo}
                      alt=""
                      width="32"
                      height="32"
                    />
                  {:else}
                    <span
                      class="grid size-8 place-items-center rounded-full bg-cork-200 text-xs font-semibold text-cork-800"
                      aria-hidden="true"
                    >
                      {nameParts[0]?.[0]}{nameParts.length > 1 ? nameParts.at(-1)?.[0] : ''}
                    </span>
                  {/if}
                </td>
                <th scope="row" class="px-2 py-2 font-semibold text-cork-800">{person.name}</th>
                <td class="px-2 py-2 text-cork-700">{person.title}</td>
                {#if hasResponsibilities}
                  <td class="px-2 py-2 text-cork-700">{person.responsibility}</td>
                {/if}
                <td class="px-2 py-2 text-center">
                  <div class="flex flex-wrap justify-center gap-1">
                    {#each countryCodes as countryCode (countryCode)}
                      {@const flag = flags[countryCode]}
                      <img
                        class="max-w-none rounded-[2px]"
                        src={flag.src}
                        alt={flag.label}
                        title={countryCodes.length === 1
                          ? (person.location ?? flag.label)
                          : flag.label}
                        width="18"
                        height="12"
                      />
                    {/each}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {:else}
    <p class="text-sm text-cork-600">No stakeholders added yet.</p>
  {/each}
</div>
