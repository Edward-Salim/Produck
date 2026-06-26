import tailwindcss from '@tailwindcss/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit()],
  optimizeDeps: {
    exclude: ['@huggingface/transformers']
  },
  ssr: {
    noExternal: ['layerchart', 'layercake', 'svelte-ux', '@layerstack/svelte-actions']
  }
});
