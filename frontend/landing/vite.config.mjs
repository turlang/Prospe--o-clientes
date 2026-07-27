/**
 * @fileoverview Configuração de build da landing page React.
 * A saída fica isolada em public/landing-react para preservar o painel legado.
 */
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: '/landing-react/',
  build: {
    outDir: fileURLToPath(new URL('../../public/landing-react', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    target: 'es2020'
  }
});
