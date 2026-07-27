const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const queues = new Map();

async function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error?.code === 'ENOENT') return structuredClone(fallbackValue);
    throw error;
  }
}

async function writeJsonFileAtomic(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), { encoding: 'utf8', mode: 0o600 });
  await fs.rename(tempPath, filePath);
}

function withJsonFileLock(filePath, operation) {
  const previous = queues.get(filePath) || Promise.resolve();
  const current = previous.catch(() => undefined).then(operation);
  queues.set(filePath, current);
  return current.finally(() => {
    if (queues.get(filePath) === current) queues.delete(filePath);
  });
}

module.exports = { readJsonFile, writeJsonFileAtomic, withJsonFileLock };
