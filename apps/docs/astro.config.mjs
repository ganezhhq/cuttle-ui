import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// Add @astrojs/vue and @astrojs/svelte here when those adapters arrive.
export default defineConfig({
  site: 'https://ganezhhq.github.io',
  base: '/cuttle-ui',
  integrations: [react()],
});
