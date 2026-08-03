/**
 * @fileoverview Garante que onboarding, sanitização e documentação central permaneçam disponíveis.
 * @module tests/projectDocumentation
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = (file) => fs.readFileSync(file, 'utf8');

test('README contém as seções necessárias para operar e manter o projeto', () => {
  const readme = read('README.md');
  const requiredSections = [
    '## Visão geral',
    '## Estado dos módulos',
    '## Arquitetura',
    '## Instalação local',
    '## Variáveis de ambiente',
    '## Comandos',
    '## Rotas principais',
    '## Banco de dados',
    '## Qualidade e testes',
    '## Segurança',
    '## Deploy no Render',
    '## Diagnóstico e solução de problemas',
    '## Limitações atuais',
    '## Documentação',
    '## Contribuição'
  ];

  requiredSections.forEach((section) => assert.ok(readme.includes(section), `Seção ausente: ${section}`));
  assert.match(readme, /Versão:\*\* 27\.0\.0/);
  assert.match(readme, /Central de Conversas em modo demonstrativo/i);
});

test('documentação de onboarding e mapa do código são obrigatórios', () => {
  const checker = read('scripts/check-documentation.js');
  [
    'docs/GUIA_DO_DESENVOLVEDOR.md',
    'docs/MAPA_DO_CODIGO.md',
    'docs/SEGURANCA_E_HIGIENE.md'
  ].forEach((document) => {
    assert.ok(fs.existsSync(document), `Documento ausente: ${document}`);
    assert.ok(checker.includes(`'${document}'`), `Documento fora do gate: ${document}`);
  });
});

test('pipeline de qualidade executa higiene antes dos demais gates', () => {
  const packageJson = JSON.parse(read('package.json'));
  assert.equal(packageJson.scripts['check:hygiene'], 'node scripts/check-repository-hygiene.js');
  assert.ok(packageJson.scripts.quality.startsWith('npm run check:hygiene &&'));
});

test('gitignore protege segredos, dados, logs, backups e pacotes locais', () => {
  const ignore = read('.gitignore');
  ['.env.*', 'data/*.json', '*.log', '*.bak', '*.zip', '*.sqlite', 'node_modules/'].forEach((entry) => {
    assert.ok(ignore.includes(entry), `Proteção ausente no .gitignore: ${entry}`);
  });
});

test('padrão de comentários documenta intenção e rejeita narração linha a linha', () => {
  const standards = read('docs/CODING_STANDARDS.md');
  const contributing = read('CONTRIBUTING.md');
  const codeMap = read('docs/MAPA_DO_CODIGO.md');

  assert.match(standards, /comentários de intenção/i);
  assert.match(contributing, /Não comente linha por linha/i);
  assert.match(codeMap, /documenta intenção, contratos e decisões/i);
});
