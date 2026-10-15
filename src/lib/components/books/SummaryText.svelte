<script lang="ts">
  let { text, label = false }: { text: string; label?: boolean } = $props();

  const segments = $derived.by(() => {
    const result = text
      .split(/(\*\*[^*]+\*\*)/g)
      .filter(Boolean)
      .map((part) => {
        const bold = /^\*\*[^*]+\*\*$/.test(part);
        return { text: bold ? part.slice(2, -2) : part, bold };
      });

    if (label && result.length && !result[0].bold) {
      const match = result[0].text.match(/^([^:\n]+:)(\s+[\s\S]*)$/);
      if (match) {
        result.splice(0, 1, { text: match[1], bold: true }, { text: match[2], bold: false });
      }
    }

    return result;
  });
</script>

{#each segments as segment}
  {#if segment.bold}
    <strong class="font-semibold">{segment.text}</strong>
  {:else}
    {segment.text}
  {/if}
{/each}
