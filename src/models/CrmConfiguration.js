/**
 * @fileoverview Configuração persistente do CRM avançado por usuário.
 * @module models/CrmConfiguration
 */

const mongoose = require('mongoose');

const crmConfigurationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    data: { type: Object, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CrmConfiguration', crmConfigurationSchema);
