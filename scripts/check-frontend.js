/**
 * @fileoverview Verifica contratos estáticos do frontend React e do painel legado.
 *
 * O build Vite realiza a validação sintática completa do JSX quando as
 * dependências estão instaladas. Este script cobre invariantes de segurança,
 * acessibilidade e estrutura mesmo em ambientes sem registro npm disponível.
 *
 * @module scripts/check-frontend
 */

const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const failures = [];
const jsxFiles = [];

function collect(entry) {
  for (const item of fs.readdirSync(entry, { withFileTypes: true })) {
    const fullPath = path.join(entry, item.name);
    if (item.isDirectory()) collect(fullPath);
    else if (item.name.endsWith('.jsx')) jsxFiles.push(fullPath);
  }
}

collect(path.join(ROOT, 'frontend', 'landing', 'src'));

for (const file of jsxFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const relative = path.relative(ROOT, file);
  if (!source.slice(0, 1200).includes('@fileoverview')) failures.push(`JSX sem @fileoverview: ${relative}`);
  if (source.includes('dangerouslySetInnerHTML')) failures.push(`Uso proibido de dangerouslySetInnerHTML: ${relative}`);
  if (/\bonclick\s*=/.test(source)) failures.push(`Handler HTML inline encontrado em React: ${relative}`);
}

const landingApp = fs.readFileSync(path.join(ROOT, 'frontend', 'landing', 'src', 'app', 'App.jsx'), 'utf8');
for (const marker of ['<Header />', '<HeroSection />', '<ToolsSection />', '<PricingSection', '<Footer />']) {
  if (!landingApp.includes(marker)) failures.push(`Composição da landing sem ${marker}`);
}

const publicApp = fs.readFileSync(path.join(ROOT, 'public', 'pages', 'app.html'), 'utf8');
if (!publicApp.includes('id="authCard"') || !publicApp.includes('id="sessionBar" hidden')) {
  failures.push('A interface autenticada perdeu os contratos de login/sessão.');
}

if (failures.length) {
  console.error('Falhas do frontend:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Frontend validado: ${jsxFiles.length} componentes JSX e contratos do painel preservados.`);
