import { resolve } from 'node:path';
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import dts from 'vite-plugin-dts'

const isDocs = process.env.NODE_ENV == 'docs';

export default defineConfig({
  build:!isDocs &&  {
    lib: {
			entry: resolve(__dirname, 'src/main.ts'),
			name: 'Privcy',
			fileName: 'privcy',
      formats: [
        'iife',
        'es',
      ]
		}
  },
  plugins: [
    svelte(),
    !isDocs && dts({ rollupTypes: true })
  ],
})
