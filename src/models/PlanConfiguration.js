/**
 * @fileoverview Documento persistente da configuração comercial dos planos.
 *
 * O painel administrativo altera este documento no MongoDB. O catálogo em
 * memória é hidratado no bootstrap para preservar leituras síncronas nas
 * regras de cobrança, enquanto esta coleção garante persistência entre deploys
 * e reinicializações no Render.
 *
 * @module models/PlanConfiguration
 */

const mongoose = require('mongoose');

const planConfigurationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
    default: 'commercial-plans'
  },
  plans: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  revision: {
    type: Number,
    min: 1,
    default: 1
  },
  updatedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'plan_configurations'
});

module.exports = mongoose.models.PlanConfiguration
  || mongoose.model('PlanConfiguration', planConfigurationSchema);
