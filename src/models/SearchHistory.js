const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
    segmento: { type: String, trim: true, required: true },
    regiao: { type: String, trim: true, required: true },
    limite: { type: Number, default: 10 },
    total: { type: Number, default: 0 },
    auditarSites: { type: Boolean, default: true },
    createdAtIso: { type: String, default: () => new Date().toISOString() }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SearchHistory', searchHistorySchema);
