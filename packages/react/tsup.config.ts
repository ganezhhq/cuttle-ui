import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  // Keeps these components usable from Next.js server components.
  banner: { js: "'use client';" },
});
