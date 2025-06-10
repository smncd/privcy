import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

const preamble = `/**
 * Privcy.
 * Consent banner script.
 *
 * @author ${packageJson.author}
 * @license ${packageJson.license}
 * @copyright 2024 - present Simon Lagerlöf
 * @version ${packageJson.version}
 */`;

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'Privcy',
      fileName: 'privcy',
    },
    minify: 'terser',
    terserOptions:{
      format: {
        comments: false,
        preamble,
      },
      compress: {
        booleans_as_integers: true,
        keep_fargs: false,
      },
      mangle: {
        keep_classnames: false,
        reserved: [],
      },
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
