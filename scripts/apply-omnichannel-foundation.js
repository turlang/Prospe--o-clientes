/**
 * @fileoverview Aplica de forma idempotente o registro do domínio omnichannel
 * na composição HTTP existente do LeadHunter Pro.
 */
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const appPath = path.join(root, 'src', 'app.js');
const envPath = path.join(root, '.env.example');

let source = fs.readFileSync(appPath, 'utf8');
const importAnchor = "const { registerCommercialRoutes } = require('./routes/commercialRoutes');";
const importLine = "const { createOmnichannelRoutes } = require('./routes/omnichannelRoutes');";
if (!source.includes(importLine)) {
  if (!source.includes(importAnchor)) throw new Error('Âncora de importação não encontrada em src/app.js.');
  source = source.replace(importAnchor, `${importAnchor}\n${importLine}`);
}

const routeAnchor = '  registerCommercialRoutes(app, routeContext);';
const routeLine = "  app.use('/api/omnichannel', createOmnichannelRoutes({ requireAuth, simpleRateLimit }));";
if (!source.includes(routeLine)) {
  if (!source.includes(routeAnchor)) throw new Error('Âncora de rotas não encontrada em src/app.js.');
  source = source.replace(routeAnchor, `${routeAnchor}\n${routeLine}`);
}

fs.writeFileSync(appPath, source);

if (fs.existsSync(envPath)) {
  let env = fs.readFileSync(envPath, 'utf8');
  if (!env.includes('INTEGRATION_ENCRYPTION_KEY=')) {
    env += '\n# Criptografia de credenciais das integrações omnichannel\nINTEGRATION_ENCRYPTION_KEY=\n';
    fs.writeFileSync(envPath, env);
  }
}

console.log('Fundação omnichannel registrada com sucesso.');
