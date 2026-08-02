/**
 * @fileoverview Ponto de entrada da aplicação LeadHunter Pro.
 *
 * Responsabilidades exclusivas deste arquivo:
 * 1. carregar as variáveis de ambiente;
 * 2. estabelecer a conexão com o mecanismo de persistência;
 * 3. iniciar o servidor HTTP;
 * 4. encerrar o processo quando uma dependência obrigatória falhar.
 *
 * A composição da aplicação está em `app.js`, conforme o princípio de
 * responsabilidade única e o padrão Application Factory.
 *
 * @module server
 */

const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env') });

const { createApp } = require('./app');
const PlanConfiguration = require('./models/PlanConfiguration');
const { initializePlanCatalog } = require('./domain/plans/planCatalog');
const { connectDatabase, hasMongoUri, mustRequireMongo } = require('./infrastructure/database/mongoConnection');

const DEFAULT_PORT = 3000;

/**
 * Inicia a infraestrutura e abre a porta HTTP.
 *
 * @param {object} [options] Opções de inicialização usadas principalmente em testes.
 * @param {number|string} [options.port=process.env.PORT] Porta de escuta.
 * @returns {Promise<import('http').Server>} Servidor HTTP iniciado.
 */
async function startServer({ port = process.env.PORT || DEFAULT_PORT } = {}) {
  let storageLabel = 'MongoDB';

  try {
    await connectDatabase();
  } catch (error) {
    console.error('[DB] Falha ao iniciar banco:', error.message);

    if (mustRequireMongo()) {
      throw new Error('MongoDB é obrigatório e a conexão não pôde ser estabelecida.', { cause: error });
    }

    storageLabel = 'JSON local';
  }

  await initializePlanCatalog({
    mongoAvailable: hasMongoUri(),
    PlanConfigurationModel: PlanConfiguration
  });

  const app = createApp();

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`[HTTP] LeadHunter Pro ativo na porta ${port} com ${storageLabel}.`);
      resolve(server);
    });

    server.once('error', reject);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('[BOOT] Não foi possível iniciar a aplicação:', error);
    process.exitCode = 1;
  });
}

module.exports = { DEFAULT_PORT, startServer };
