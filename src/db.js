/**
 * db.js
 * -----------------------------------------------------------------------------
 * Conexão opcional com MongoDB.
 *
 * Para facilitar o desenvolvimento local, o projeto agora roda em dois modos:
 * - MongoDB ativo: quando MONGODB_URI está configurado e a conexão funciona.
 * - JSON local: quando MONGODB_URI está vazio ou quando o MongoDB não conecta.
 */
const dns = require('dns');

if (process.env.DNS_SERVERS) {
  dns.setServers(
    process.env.DNS_SERVERS
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean)
  );

  console.log('[DNS] Usando servidores:', dns.getServers());
}

const mongoose = require('mongoose');

let connectionPromise = null;
let mongoConnected = false;
let mongoDisabledReason = '';

function getMongoUri() {
  return String(process.env.MONGODB_URI || '').trim();
}

function mustRequireMongo() {
  return String(process.env.REQUIRE_MONGODB || '').toLowerCase() === 'true';
}

function hasMongoUri() {
  return Boolean(getMongoUri() && mongoConnected);
}

function hasConfiguredMongoUri() {
  return Boolean(getMongoUri());
}

function getMongoStatus() {
  return {
    configured: hasConfiguredMongoUri(),
    connected: mongoConnected,
    disabledReason: mongoDisabledReason
  };
}

async function connectDatabase() {
  const uri = getMongoUri();

  if (!uri) {
    mongoConnected = false;
    mongoDisabledReason = 'MONGODB_URI não definido. Usando JSON local.';

    if (mustRequireMongo()) {
      throw new Error('REQUIRE_MONGODB=true, mas MONGODB_URI não foi definido.');
    }

    console.warn(`[DB] ${mongoDisabledReason}`);
    return null;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(uri, { autoIndex: true, serverSelectionTimeoutMS: 5000 })
      .then((connection) => {
        mongoConnected = true;
        mongoDisabledReason = '';
        console.log('[DB] MongoDB conectado.');
        return connection;
      })
      .catch((error) => {
        mongoConnected = false;
        mongoDisabledReason = `MongoDB indisponível (${error.message}).`;

        if (mustRequireMongo()) {
          connectionPromise = null;
          throw new Error(`${mongoDisabledReason} REQUIRE_MONGODB=true impede fallback em JSON local.`);
        }

        mongoDisabledReason += ' Usando JSON local.';
        console.warn(`[DB] ${mongoDisabledReason}`);
        connectionPromise = null;
        return null;
      });
  }

  return connectionPromise;
}

module.exports = {
  connectDatabase,
  hasMongoUri,
  hasConfiguredMongoUri,
  getMongoStatus,
  mustRequireMongo
};
