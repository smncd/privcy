import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Privcy',
      fileName: 'privcy',
      formats: ['iife', 'es'],
    },
  },
  plugins: [svelte(), dts({ rollupTypes: true })],
});
