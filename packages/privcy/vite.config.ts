import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Privcy',
      fileName: 'privcy',
    },
    rollupOptions: {
      output: [
        {
          format: 'iife',
          entryFileNames: 'privcy.js',
          name: 'Privcy',
        },
        {
          format: 'es',
          entryFileNames: 'privcy.mjs',
        },
      ],
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
