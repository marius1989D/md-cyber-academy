// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://md-cyber-academy.workers.dev',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
    build: { rollupOptions: { external: ['/pagefind/pagefind.js'] } },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
