import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// Change this to your real domain once you pick one.
export default defineConfig({
  site: 'https://krishna.dev',
  integrations: [mdx(), sitemap()],
});
