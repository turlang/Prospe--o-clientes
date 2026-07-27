const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    passwordHash: { type: String, required: true },
    passwordChangedAt: { type: Date, default: null },
    plan: { type: String, enum: ['trial', 'pro', 'agency'], default: 'trial' },
    dailyLeadLimit: { type: Number, default: 10 },
    totalLeadLimit: { type: Number, default: 10 },
    trialStartedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    subscriptionStatus: { type: String, default: 'trial' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    deviceId: { type: String, default: '', index: true },
    registrationIp: { type: String, default: '' },
    mercadoPagoCustomerId: { type: String, default: '' },
    mercadoPagoSubscriptionId: { type: String, default: '' },
    mercadoPagoLastPaymentId: { type: String, default: '' },
    planActivatedAt: { type: Date, default: null },
    planExpiresAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
