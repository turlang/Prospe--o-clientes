const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    plan: { type: String, enum: ['pro', 'agency'], required: true },
    status: { type: String, default: 'created', index: true },
    provider: { type: String, default: 'mercado_pago' },
    preferenceId: { type: String, index: true, default: '' },
    paymentId: { type: String, index: true, default: '' },
    externalReference: { type: String, index: true, default: '' },
    checkoutUrl: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    raw: { type: Object, default: {} }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
