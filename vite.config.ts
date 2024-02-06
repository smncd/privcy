import { resolve } from 'node:path';
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  build: {
    lib: {
			entry: resolve(__dirname, 'src/main.ts'),
			name: 'PrivacyConsentBanner',
			fileName: 'privacy-consent-banner',
      formats: [
        'iife',
        'es',
      ]
		}
  },
  plugins: [svelte()],
})
