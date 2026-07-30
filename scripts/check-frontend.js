/**
 * @fileoverview Verifica contratos estáticos do frontend React e do painel legado.
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
for (const marker of ['<Header ', '<LandingExperience', '<BottomNavigation']) {
  if (!landingApp.includes(marker)) failures.push(`Composição da landing sem ${marker}`);
}
if (landingApp.includes('<Footer />')) failures.push('A landing sem rolagem não deve renderizar rodapé vertical.');

const experience = fs.readFileSync(path.join(ROOT, 'frontend', 'landing', 'src', 'features', 'presentation', 'LandingExperience.jsx'), 'utf8');
for (const marker of ['OverviewPanel', 'WorkflowPanel', 'ToolsPanel', 'AudiencePanel', 'PricingPanel']) {
  if (!experience.includes(marker)) failures.push(`Experiência sem painel ${marker}`);
}

const styles = fs.readFileSync(path.join(ROOT, 'frontend', 'landing', 'src', 'styles', 'index.css'), 'utf8');
if (!/html, body, #root \{[^}]*overflow: hidden;/.test(styles)) failures.push('Landing React não bloqueia o scroll do documento.');
if (!styles.includes('height: 100dvh')) failures.push('Landing React não usa altura dinâmica da viewport.');

const publicApp = fs.readFileSync(path.join(ROOT, 'public', 'pages', 'app.html'), 'utf8');

const dashboardStyles = fs.readFileSync(path.join(ROOT, 'public', 'assets', 'dashboard', 'styles.css'), 'utf8');
for (const moduleName of ['00-tokens.css', '10-base.css', '20-layout.css', '30-components.css', '40-views.css', '50-depth.css', '90-responsive.css']) {
  if (!dashboardStyles.includes(moduleName)) failures.push(`Entry CSS sem módulo ${moduleName}`);
}

const adminHtml = fs.readFileSync(path.join(ROOT, 'public', 'pages', 'admin.html'), 'utf8');
if (adminHtml.includes('adminAiStatus') || adminHtml.includes('IA Comercial')) {
  failures.push('Admin ainda renderiza o bloco visual redundante de IA Comercial.');
}

const historyIndex = publicApp.indexOf('id="view-historico"');
const timelineIndex = publicApp.indexOf('id="v23Timeline"');
if (!(historyIndex >= 0 && timelineIndex > historyIndex)) failures.push('Timeline global não está centralizada no Histórico.');
if (!publicApp.includes('id="authCard"') || !publicApp.includes('id="sessionBar" hidden')) {
  failures.push('A interface autenticada perdeu os contratos de login/sessão.');
}

if (failures.length) {
  console.error('Falhas do frontend:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Frontend validado: ${jsxFiles.length} componentes JSX, landing sem scroll e painel preservado.`);
