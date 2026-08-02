/**
 * @fileoverview Fundação omnichannel do LeadHunter: módulo src/models/_omnichannelScope.
 *
 * Responsabilidade isolada para conversas, integrações, agente SDR,
 * segurança ou validação deste domínio.
 * @module src/models/_omnichannelScope
 */

const mongoose = require('mongoose');

function scopedFields() {
  return {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true }
  };
}

module.exports = { mongoose, scopedFields };
