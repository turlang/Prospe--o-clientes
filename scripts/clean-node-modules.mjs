import { rm } from "node:fs/promises";
import { resolve } from "node:path";

const targets = [
  "node_modules",
  "apps/web/node_modules",
  "apps/api/node_modules",
  "package-lock.json"
];

async function removeWithRetry(relativePath, attempts = 6) {
  const absolutePath = resolve(relativePath);

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rm(absolutePath, {
        recursive: true,
        force: true,
        maxRetries: 3,
        retryDelay: 500
      });
      console.log(`[clean] removido: ${relativePath}`);
      return;
    }
    catch (error) {
      const retryable = ["EBUSY", "EPERM", "ENOTEMPTY"].includes(error.code);
      if (!retryable || attempt === attempts) throw error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 1000));
    }
  }
}

for (const target of targets) {
  await removeWithRetry(target);
}
