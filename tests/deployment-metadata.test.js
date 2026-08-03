/**
 * @fileoverview Valida rastreabilidade de deploy e configuração segura do Render.
 * @module tests/deployment-metadata.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { getDeploymentMetadata } = require('../src/routes/systemRoutes');

const TRACKED_ENV = [
  'RENDER',
  'RENDER_GIT_COMMIT',
  'RENDER_GIT_BRANCH',
  'RENDER_GIT_REPO_SLUG',
  'RENDER_SERVICE_NAME',
  'GIT_COMMIT',
  'GIT_BRANCH',
  'APP_NAME'
];

function withEnvironment(values, callback) {
  const previous = Object.fromEntries(TRACKED_ENV.map((key) => [key, process.env[key]]));
  try {
    for (const key of TRACKED_ENV) delete process.env[key];
    for (const [key, value] of Object.entries(values)) process.env[key] = value;
    return callback();
  } finally {
    for (const key of TRACKED_ENV) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}

test('identifica desenvolvimento local sem inventar uma implantação', () => {
  withEnvironment({}, () => {
    assert.deepEqual(getDeploymentMetadata(), {
      provider: 'local',
      branch: 'local',
      commit: 'development',
      shortCommit: 'local',
      repository: null,
      service: 'LeadHunter Pro'
    });
  });
});

test('expõe branch e commit reais fornecidos pelo Render', () => {
  withEnvironment({
    RENDER: 'true',
    RENDER_GIT_COMMIT: '7f560663dff6de4e187f9b98aa7b861c579f7710',
    RENDER_GIT_BRANCH: 'main',
    RENDER_GIT_REPO_SLUG: 'turlang/Prospe--o-clientes',
    RENDER_SERVICE_NAME: 'prospeccao-leads'
  }, () => {
    assert.deepEqual(getDeploymentMetadata(), {
      provider: 'render',
      branch: 'main',
      commit: '7f560663dff6de4e187f9b98aa7b861c579f7710',
      shortCommit: '7f56066',
      repository: 'turlang/Prospe--o-clientes',
      service: 'prospeccao-leads'
    });
  });
});

test('blueprint gera uma chave permanente para credenciais omnichannel', () => {
  const blueprint = fs.readFileSync('render.yaml', 'utf8');
  assert.match(blueprint, /key: INTEGRATION_ENCRYPTION_KEY\s+generateValue: true/);
  assert.match(blueprint, /healthCheckPath: \/api\/health/);
  assert.match(blueprint, /autoDeploy: true/);
});

test('health check publica metadados do artefato sem cache', () => {
  const routes = fs.readFileSync('src/routes/systemRoutes.js', 'utf8');
  assert.match(routes, /deploy: getDeploymentMetadata\(\)|const deploy = getDeploymentMetadata\(\)/);
  assert.match(routes, /X-Deploy-Commit/);
  assert.match(routes, /no-store, no-cache, must-revalidate/);
});
