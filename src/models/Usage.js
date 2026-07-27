/**
 * @fileoverview Esquema Mongoose e modelo de persistência `Usage`.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/models/Usage
 */

const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    day: { type: String, index: true, required: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

usageSchema.index({ userId: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Usage', usageSchema);
