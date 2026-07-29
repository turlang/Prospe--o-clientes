import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Configuração do Vite para a interface web.
 *
 * `resolve.dedupe` é essencial em um monorepo npm workspaces: garante que
 * React, React DOM e todas as bibliotecas de interface compartilhem a mesma
 * instância do runtime. Isso evita o erro de Hooks causado por cópias
 * duplicadas do React em `node_modules` diferentes.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"]
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true
      }
    }
  }
});
