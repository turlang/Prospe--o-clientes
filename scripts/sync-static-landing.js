/**
 * @fileoverview Sincroniza a landing estática de contingência com a pasta pública.
 *
 * A versão estática é intencionalmente mantida junto do React: ela impede que
 * uma falha de build reative uma landing antiga. O script copia uma única fonte
 * para os dois destinos públicos, evitando divergência manual.
 *
 * @module scripts/sync-static-landing
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'frontend', 'landing', 'static');
const PUBLIC_DIR = path.join(ROOT, 'public');
const PREBUILT_DIR = path.join(PUBLIC_DIR, 'landing-react');

function copyFile(sourceName, targetPath) {
  const sourcePath = path.join(SOURCE_DIR, sourceName);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Arquivo de landing ausente: ${sourcePath}`);
  }
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.copyFileSync(sourcePath, targetPath);
}

copyFile('index.html', path.join(PREBUILT_DIR, 'index.html'));
copyFile('index.html', path.join(PUBLIC_DIR, 'landing-fallback.html'));
copyFile('landing.css', path.join(PUBLIC_DIR, 'landing-static.css'));
copyFile('landing.js', path.join(PUBLIC_DIR, 'landing-static.js'));

console.log('Landing estática v25.9.0 sincronizada com os destinos públicos.');
