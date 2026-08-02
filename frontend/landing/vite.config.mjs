/**
 * @fileoverview Configuração de build da landing page React + Tailwind CSS.
 */
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/landing-react/',
  plugins: [tailwindcss()],
  build: {
    outDir: fileURLToPath(new URL('../../public/landing-react', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020'
  }
});
