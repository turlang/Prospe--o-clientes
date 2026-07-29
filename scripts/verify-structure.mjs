import { access } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Verificação estrutural simples.
 * O objetivo é detectar arquivos críticos ausentes antes de instalar dependências.
 */
const requiredFiles = [
  "apps/api/prisma/schema.prisma",
  "apps/api/src/app.js",
  "apps/api/src/server.js",
  "apps/api/src/modules/auth/auth.controller.js",
  "apps/api/src/modules/products/product.controller.js",
  "apps/api/src/modules/orders/order.controller.js",
  "apps/web/src/App.jsx",
  "apps/web/src/contexts/CartContext.jsx",
  "apps/web/src/pages/MenuPage.jsx",
  "apps/web/src/pages/CartPage.jsx"
];

const missing = [];

for (const relativePath of requiredFiles) {
  try {
    await access(resolve(relativePath));
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length > 0) {
  console.error("Arquivos críticos ausentes:");
  for (const file of missing) console.error(`- ${file}`);
  process.exit(1);
}

console.log(`Estrutura validada: ${requiredFiles.length} arquivos críticos encontrados.`);
