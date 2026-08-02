/**
 * @fileoverview Testes automatizados de regressão para o componente `jsonFileStore.test`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module tests/jsonFileStore.test
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { readJsonFile, writeJsonFileAtomic, withJsonFileLock } = require('../src/utils/jsonFileStore');

test('grava JSON atomicamente e preserva atualizações concorrentes', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'leadhunter-json-'));
  const file = path.join(dir, 'counter.json');

  try {
    await writeJsonFileAtomic(file, { count: 0 });

    await Promise.all(Array.from({ length: 30 }, () => withJsonFileLock(file, async () => {
      const current = await readJsonFile(file, { count: 0 });
      await writeJsonFileAtomic(file, { count: current.count + 1 });
    })));

    assert.deepEqual(await readJsonFile(file, null), { count: 30 });
    const names = await fs.readdir(dir);
    assert.deepEqual(names, ['counter.json']);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('não mascara JSON corrompido como arquivo vazio', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'leadhunter-json-invalid-'));
  const file = path.join(dir, 'invalid.json');

  try {
    await fs.writeFile(file, '{invalido', 'utf8');
    await assert.rejects(() => readJsonFile(file, []), SyntaxError);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});
