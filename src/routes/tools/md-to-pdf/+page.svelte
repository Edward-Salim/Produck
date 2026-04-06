<script lang="ts">
  import { marked } from 'marked';
  import { Download, LoaderCircle } from '@lucide/svelte';
  import { MD_ALERT_COLORS } from '$lib/constants/colors.js';

  marked.setOptions({
    gfm: true,
    breaks: true
  });

  const DEFAULT_MARKDOWN = `# Document Title

A brief introduction paragraph demonstrating the markdown preview.

## Features

- **Bold text** and *italic text*
- [Links](https://example.com)
- Inline \`code\` snippets

### Code Block

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Preview | \u2713 |
| Export  | \u2713 |

> Blockquotes are styled nicely too.

> [!NOTE]
> This is a note with useful information.

> [!WARNING]
> Be careful with this action.

---

*Edit this content or paste your own markdown.*`;

  const PAGE_SIZES = ['a4', 'letter', 'legal'] as const;
  const FONT_SIZES = [12, 14, 16] as const;

  let markdown = $state(DEFAULT_MARKDOWN);
  let pageSize = $state<'a4' | 'letter' | 'legal'>('a4');
  let fontSize = $state<12 | 14 | 16>(14);
  let generating = $state(false);

  const ALERT_TYPES = MD_ALERT_COLORS;

  function processAlerts(html: string): string {
    return html.replace(
      /<blockquote>\s*<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]([\s\S]*?)<\/blockquote>/gi,
      (_, type: string, content: string) => {
        const key = type.toUpperCase();
        const a = ALERT_TYPES[key];
        return `<div class="gh-alert" style="border-left-color:${a.color};background:${a.bg}"><p><strong style="color:${a.color}">${a.label}</strong>${content}</div>`;
      }
    );
  }

  let rawHtml = $derived(marked.parse(markdown) as string);
  let htmlContent = $derived(processAlerts(rawHtml));

  const pageSizeLabels: Record<string, string> = {
    a4: 'A4',
    letter: 'Letter',
    legal: 'Legal'
  };

  const pageSizeCss: Record<string, string> = {
    a4: 'A4',
    letter: 'letter',
    legal: 'legal'
  };

  function handleTextareaKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      markdown = markdown.substring(0, start) + '\t' + markdown.substring(end);
      // Restore cursor position after the inserted tab
      requestAnimationFrame(() => {
        target.selectionStart = start + 1;
        target.selectionEnd = start + 1;
      });
    }
  }

  function downloadPdf() {
    generating = true;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const printCss = `
			@page {
				size: ${pageSizeCss[pageSize]};
				margin: 20mm;
				margin-top: 15mm;
				margin-bottom: 15mm;
			}
			@page :first { margin-top: 20mm; }
			* { box-sizing: border-box; }
			body {
				font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Noto Sans, Helvetica, Arial, sans-serif;
				font-size: ${fontSize}px;
				line-height: 1.6;
				color: #3d3529;
				word-wrap: break-word;
				max-width: 100%;
				padding: 0;
				margin: 0;
			}
			h1, h2, h3, h4, h5, h6 { margin-top: 24px; margin-bottom: 16px; font-weight: 600; line-height: 1.25; color: #3d3529; }
			h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid #ddd4c2; }
			h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid #ddd4c2; }
			h3 { font-size: 1.25em; }
			h4 { font-size: 1em; }
			h5 { font-size: 0.875em; }
			h6 { font-size: 0.85em; color: #8a7e6b; }
			p { margin-top: 0; margin-bottom: 16px; }
			ul, ol { margin-top: 0; margin-bottom: 16px; padding-left: 2em; }
			li { margin-top: 0.25em; }
			li + li { margin-top: 0.25em; }
			li > p { margin-top: 16px; }
			li > ul, li > ol { margin-top: 0; margin-bottom: 0; }
			pre {
				background: #f0f1f3;
				border-radius: 6px;
				padding: 16px;
				overflow: auto;
				font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
				font-size: 85%;
				line-height: 1.45;
				margin-top: 0;
				margin-bottom: 16px;
			}
			pre code { background: transparent; padding: 0; border: none; border-radius: 0; font-size: 100%; }
			code {
				background: rgba(140, 145, 155, 0.15);
				padding: 0.2em 0.4em;
				border-radius: 6px;
				font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
				font-size: 85%;
			}
			blockquote {
				border-left: 0.25em solid #cdc3ae;
				margin: 0 0 16px;
				padding: 0 1em;
				color: #8a7e6b;
			}
			blockquote > :first-child { margin-top: 0; }
			blockquote > :last-child { margin-bottom: 0; }
			table { border-collapse: collapse; border-spacing: 0; width: auto; max-width: 100%; margin-top: 0; margin-bottom: 16px; display: block; overflow: auto; }
			th, td { border: 1px solid #ddd4c2; padding: 6px 13px; }
			th { font-weight: 600; background: #ece5d8; }
			tr:nth-child(2n) { background: #f5f0e8; }
			hr { border: 0; height: 1px; background: #ddd4c2; margin: 24px 0; padding: 0; }
			img { max-width: 100%; height: auto; }
			a { color: #5a7a8a; text-decoration: underline; text-underline-offset: 2px; }
			a:hover { color: #4a6a7a; }
			strong { font-weight: 600; }
			.gh-alert {
				border-left: 0.25em solid;
				margin: 0 0 16px;
				padding: 8px 16px;
				border-radius: 0 6px 6px 0;
			}
			.gh-alert p { margin-bottom: 0; }
			.gh-alert strong { display: block; margin-bottom: 4px; }
			@media print {
				body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
				pre { white-space: pre-wrap; word-wrap: break-word; }
				a[href]::after { content: none; }
			}
		`;

    const htmlDoc = `<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title> </title>
	<style>${printCss}</style>
</head>
<body>${htmlContent}</body>
</html>`;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlDoc);
      iframeDoc.close();

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            if (iframe.parentNode) {
              document.body.removeChild(iframe);
            }
            generating = false;
          }, 1000);
        }, 250);
      };
    } else {
      document.body.removeChild(iframe);
      generating = false;
    }
  }
</script>

<svelte:head><title>Markdown to PDF - Produck</title></svelte:head>

<div>
  <header class="mb-6">
    <h1 class="font-display text-4xl text-cork-800">Markdown to PDF</h1>
    <p class="mt-0.5 text-sm text-cork-500">
      Write or paste Markdown, preview it live, and export as PDF
    </p>
  </header>

  <!-- Toolbar -->
  <div class="mb-4 flex flex-wrap items-center gap-4">
    <!-- Page Size -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold tracking-wider text-cork-500 uppercase">Page</span>
      <div class="flex gap-1.5">
        {#each PAGE_SIZES as size (size)}
          <button
            type="button"
            class={pageSize === size
              ? 'rounded-md bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50'
              : 'cursor-pointer rounded-md border border-cork-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-cork-600'}
            onclick={() => (pageSize = size)}
          >
            {pageSizeLabels[size]}
          </button>
        {/each}
      </div>
    </div>

    <!-- Font Size -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold tracking-wider text-cork-500 uppercase">Font</span>
      <div class="flex gap-1.5">
        {#each FONT_SIZES as size (size)}
          <button
            type="button"
            class={fontSize === size
              ? 'rounded-md bg-cork-700 px-3 py-1.5 text-xs font-medium text-cork-50'
              : 'cursor-pointer rounded-md border border-cork-200 bg-white/60 px-3 py-1.5 text-xs font-medium text-cork-600'}
            onclick={() => (fontSize = size)}
          >
            {size}px
          </button>
        {/each}
      </div>
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Download PDF Button -->
    <button
      type="button"
      class="flex cursor-pointer items-center gap-2 rounded-lg bg-cork-700 px-4 py-2 text-sm font-medium text-cork-50 transition-colors hover:bg-cork-800"
      onclick={downloadPdf}
      disabled={generating}
    >
      {#if generating}
        <LoaderCircle class="size-4 animate-spin" />
        Generating...
      {:else}
        <Download class="size-4" />
        Download PDF
      {/if}
    </button>
  </div>

  <!-- Editor and Preview Panes -->
  <div class="flex gap-4" style="height: calc(100vh - 240px)">
    <!-- Editor Pane -->
    <div class="min-w-0 flex-1">
      <textarea
        class="h-full w-full resize-none rounded-xl border border-cork-300 bg-cork-50 p-4 font-mono text-sm text-cork-800 placeholder:text-cork-400 focus:ring-2 focus:ring-cork-400/50 focus:outline-none"
        placeholder="# Start writing markdown here..."
        bind:value={markdown}
        onkeydown={handleTextareaKeydown}
      ></textarea>
    </div>

    <!-- Preview Pane -->
    <div class="min-w-0 flex-1">
      <div
        class="preview-scroll h-full overflow-y-auto rounded-xl border border-cork-200 bg-white p-8 shadow-sm"
      >
        <div class="gh-markdown" style="font-size: {fontSize}px">
          {@html htmlContent}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  textarea,
  .preview-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.15) transparent;
  }
  textarea::-webkit-scrollbar,
  .preview-scroll::-webkit-scrollbar {
    width: 6px;
  }
  textarea::-webkit-scrollbar-track,
  .preview-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb,
  .preview-scroll::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
  textarea::-webkit-scrollbar-thumb:hover,
  .preview-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.25);
  }

  /* Cork-flavored GitHub markdown preview */
  .gh-markdown {
    font-family:
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Noto Sans,
      Helvetica,
      Arial,
      sans-serif;
    line-height: 1.6;
    color: #3d3529;
    word-wrap: break-word;
  }
  .gh-markdown :global(h1),
  .gh-markdown :global(h2),
  .gh-markdown :global(h3),
  .gh-markdown :global(h4),
  .gh-markdown :global(h5),
  .gh-markdown :global(h6) {
    margin-top: 24px;
    margin-bottom: 16px;
    font-weight: 600;
    line-height: 1.25;
    color: #3d3529;
  }
  .gh-markdown :global(h1) {
    font-size: 2em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #ddd4c2;
  }
  .gh-markdown :global(h2) {
    font-size: 1.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #ddd4c2;
  }
  .gh-markdown :global(h3) {
    font-size: 1.25em;
  }
  .gh-markdown :global(h4) {
    font-size: 1em;
  }
  .gh-markdown :global(h5) {
    font-size: 0.875em;
  }
  .gh-markdown :global(h6) {
    font-size: 0.85em;
    color: #8a7e6b;
  }
  .gh-markdown :global(p) {
    margin-top: 0;
    margin-bottom: 16px;
  }
  .gh-markdown :global(ul) {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 2em;
    list-style: disc;
  }
  .gh-markdown :global(ol) {
    margin-top: 0;
    margin-bottom: 16px;
    padding-left: 2em;
    list-style: decimal;
  }
  .gh-markdown :global(li) {
    margin-top: 0.25em;
  }
  .gh-markdown :global(li > p) {
    margin-top: 16px;
  }
  .gh-markdown :global(li > ul),
  .gh-markdown :global(li > ol) {
    margin-top: 0;
    margin-bottom: 0;
  }
  .gh-markdown :global(pre) {
    background: #f0f1f3;
    border-radius: 6px;
    padding: 16px;
    overflow: auto;
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    font-size: 85%;
    line-height: 1.45;
    margin-top: 0;
    margin-bottom: 16px;
  }
  .gh-markdown :global(pre code) {
    background: transparent;
    padding: 0;
    border: none;
    font-size: 100%;
  }
  .gh-markdown :global(code) {
    background: rgba(140, 145, 155, 0.15);
    padding: 0.2em 0.4em;
    border-radius: 6px;
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    font-size: 85%;
  }
  .gh-markdown :global(blockquote) {
    border-left: 0.25em solid #cdc3ae;
    margin: 0 0 16px;
    padding: 0 1em;
    color: #8a7e6b;
  }
  .gh-markdown :global(blockquote > :first-child) {
    margin-top: 0;
  }
  .gh-markdown :global(blockquote > :last-child) {
    margin-bottom: 0;
  }
  .gh-markdown :global(table) {
    border-collapse: collapse;
    width: auto;
    max-width: 100%;
    margin-bottom: 16px;
  }
  .gh-markdown :global(th),
  .gh-markdown :global(td) {
    border: 1px solid #ddd4c2;
    padding: 6px 13px;
  }
  .gh-markdown :global(th) {
    font-weight: 600;
    background: #ece5d8;
  }
  .gh-markdown :global(tr:nth-child(2n)) {
    background: #f5f0e8;
  }
  .gh-markdown :global(hr) {
    border: 0;
    height: 1px;
    background: #ddd4c2;
    margin: 24px 0;
  }
  .gh-markdown :global(img) {
    max-width: 100%;
    height: auto;
  }
  .gh-markdown :global(a) {
    color: #5a7a8a;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .gh-markdown :global(a:hover) {
    color: #4a6a7a;
  }
  .gh-markdown :global(strong) {
    font-weight: 600;
  }
  .gh-markdown :global(:first-child) {
    margin-top: 0 !important;
  }
  .gh-markdown :global(.gh-alert) {
    border-left: 0.25em solid;
    margin: 0 0 16px;
    padding: 8px 16px;
    border-radius: 0 6px 6px 0;
  }
  .gh-markdown :global(.gh-alert p) {
    margin-bottom: 0;
  }
  .gh-markdown :global(.gh-alert strong) {
    display: block;
    margin-bottom: 4px;
  }
</style>
