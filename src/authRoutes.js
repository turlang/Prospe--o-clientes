/**
 * @fileoverview Rotas de autenticação, registro, sessão e recuperação segura de senha.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/authRoutes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./models/User');
const { createToken, requireAuth } = require('./middleware/auth');
const { hasMongoUri } = require('./db');
const { findUserByEmail, findUserById, findUserByDeviceId, countRecentLocalRegistrationsByIp, createLocalUser } = require('./localUserStore');
const { getPlan } = require('./planConfig');
const TrialGuard = require('./models/TrialGuard');
const PasswordReset = require('./models/PasswordReset');
const { sendPasswordResetEmail } = require('./services/emailService');
const { simpleRateLimit } = require('./middleware/rateLimit');

const router = express.Router();
const registerLimiter = simpleRateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const loginLimiter = simpleRateLimit({ windowMs: 15 * 60 * 1000, max: 25 });
const recoveryLimiter = simpleRateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateEmail(email) {
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

function validatePassword(password) {
  return password.length >= 8 && password.length <= 128;
}

function sanitizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 120);
}

function isDuplicateKeyError(error) {
  return error?.code === 11000 || String(error?.message || '').includes('E11000');
}

function getRegistrationIpLimit() {
  const configured = Number(process.env.REGISTER_IP_DAILY_LIMIT || 3);
  return Number.isInteger(configured) && configured >= 1 && configured <= 100 ? configured : 3;
}

const TEMP_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'mailinator.com',
  'yopmail.com',
  'throwawaymail.com',
  'fakeinbox.com',
  'getnada.com',
  'trashmail.com',
  'dispostable.com'
]);

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.ip || req.socket?.remoteAddress || 'unknown';
}

function normalizeDeviceId(value) {
  return String(value || '').trim().slice(0, 160);
}

function getEmailDomain(email) {
  return String(email || '').split('@').pop().toLowerCase();
}

async function registerTrialAttempt({ email, ip, deviceId, userAgent, status, reason }) {
  try {
    await TrialGuard.create({
      email,
      emailDomain: getEmailDomain(email),
      ip,
      deviceId,
      userAgent,
      status,
      reason
    });
  } catch {}
}

async function validateTrialRegistration({ email, ip, deviceId, userAgent }) {
  if (!email) return { allowed: false, reason: 'Informe um e-mail válido.' };

  const existingAdmin = await User.findOne({ email: String(email).toLowerCase(), role: 'admin' });
  if (existingAdmin) return { allowed: true, adminBypass: true };

  const domain = getEmailDomain(email);
  if (TEMP_EMAIL_DOMAINS.has(domain)) {
    return { allowed: false, reason: 'Use um e-mail permanente para criar sua conta.' };
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const ipLimit = getRegistrationIpLimit();

  const ipCount = await TrialGuard.countDocuments({
    ip,
    status: 'allowed',
    createdAt: { $gte: dayAgo }
  });

  if (ipCount >= ipLimit) {
    return { allowed: false, reason: 'Limite de cadastros por rede atingido. Tente novamente amanhã.' };
  }

  if (deviceId) {
    const existingDeviceUser = await User.findOne({ deviceId });
    if (existingDeviceUser) {
      return { allowed: false, reason: 'Este dispositivo já utilizou o teste gratuito.' };
    }

    const deviceAttempt = await TrialGuard.findOne({
      deviceId,
      status: 'allowed'
    });

    if (deviceAttempt) {
      return { allowed: false, reason: 'Este dispositivo já iniciou um teste gratuito.' };
    }
  }

  return { allowed: true };
}




function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function publicAppUrl(req) {
  return process.env.PUBLIC_APP_URL || `${req.protocol}://${req.get('host')}`;
}

router.post('/register', registerLimiter, async (req, res) => {
  try {
    const name = sanitizeName(req.body.name);
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254);
    const password = String(req.body.password || '');
    const ip = getClientIp(req);
    const deviceId = normalizeDeviceId(req.body.deviceId || req.headers['x-device-id']);
    const userAgent = String(req.headers['user-agent'] || '').slice(0, 500);

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Informe nome, e-mail e senha.' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'A senha deve ter entre 8 e 128 caracteres.' });
    }

    if (TEMP_EMAIL_DOMAINS.has(getEmailDomain(email))) {
      return res.status(400).json({ error: 'Use um e-mail permanente para criar sua conta.' });
    }

    if (hasMongoUri()) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

      const trialCheck = await validateTrialRegistration({ email, ip, deviceId, userAgent });

      if (!trialCheck.allowed) {
        await registerTrialAttempt({
          email,
          ip,
          deviceId,
          userAgent,
          status: 'blocked',
          reason: trialCheck.reason
        });

        return res.status(429).json({ error: trialCheck.reason });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        name,
        email,
        passwordHash,
        deviceId,
        registrationIp: ip
      });

      await registerTrialAttempt({
        email,
        ip,
        deviceId,
        userAgent,
        status: 'allowed',
        reason: 'trial_created'
      });

      return res.status(201).json({ token: createToken(user), user: publicUser(user) });
    }

    const exists = await findUserByEmail(email);
    if (exists) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

    if (deviceId && await findUserByDeviceId(deviceId)) {
      return res.status(429).json({ error: 'Este dispositivo já utilizou o teste gratuito.' });
    }

    const ipLimit = getRegistrationIpLimit();
    if (await countRecentLocalRegistrationsByIp(ip, 24 * 60 * 60 * 1000) >= ipLimit) {
      return res.status(429).json({ error: 'Limite de cadastros por rede atingido. Tente novamente amanhã.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createLocalUser({ name, email, passwordHash, deviceId, registrationIp: ip });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (isDuplicateKeyError(error)) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    res.status(500).json({ error: 'Não foi possível criar a conta.' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254);
    const password = String(req.body.password || '');

    if (!validateEmail(email) || !password || password.length > 128) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const user = hasMongoUri()
      ? await User.findOne({ email })
      : await findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ error: 'Usuário inativo.' });
    }

    res.json({ token: createToken(user), user: publicUser(user) });
  } catch {
    res.status(500).json({ error: 'Não foi possível entrar agora.' });
  }
});


router.post('/forgot-password', recoveryLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254);

    // Resposta genérica para evitar enumeração de usuários.
    const generic = {
      ok: true,
      message: 'Se o e-mail existir, enviaremos instruções para redefinir a senha.'
    };

    if (!validateEmail(email)) return res.json(generic);

    const user = hasMongoUri()
      ? await User.findOne({ email })
      : await findUserByEmail(email);

    if (!user) return res.json(generic);

    if (!hasMongoUri()) return res.json(generic);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const resetUrl = `${publicAppUrl(req)}/reset-password.html?token=${token}`;

    await PasswordReset.create({
      userId: user._id,
      email,
      tokenHash,
      expiresAt,
      requestedIp: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '')
    });

    await sendPasswordResetEmail({ email, resetUrl });

    return res.json(generic);
  } catch {
    res.status(500).json({ error: 'Não foi possível iniciar a recuperação de senha.' });
  }
});

router.post('/reset-password', recoveryLimiter, async (req, res) => {
  try {
    const token = String(req.body.token || '').trim().slice(0, 256);
    const password = String(req.body.password || '');

    if (!token || !password) {
      return res.status(400).json({ error: 'Informe o token e a nova senha.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'A senha deve ter entre 8 e 128 caracteres.' });
    }

    if (!hasMongoUri()) {
      return res.status(400).json({ error: 'Redefinição de senha requer MongoDB ativo.' });
    }

    const tokenHash = hashResetToken(token);
    const reset = await PasswordReset.findOneAndUpdate(
      { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { usedAt: new Date() } },
      { new: true }
    );

    if (!reset) {
      return res.status(400).json({ error: 'Link inválido ou expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(reset.userId, { passwordHash, passwordChangedAt: new Date() });

    return res.json({
      ok: true,
      message: 'Senha redefinida com sucesso. Faça login novamente.'
    });
  } catch {
    res.status(500).json({ error: 'Não foi possível redefinir a senha.' });
  }
});


router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({ user: publicUser(req.currentUser) });
  } catch {
    res.status(500).json({ error: 'Não foi possível carregar o usuário.' });
  }
});

function publicUser(user) {
  const plan = getPlan(user.plan || 'trial');
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    plan: plan.id,
    planName: plan.name,
    priceLabel: plan.priceLabel,
    dailyLeadLimit: Number(user.dailyLeadLimit ?? plan.dailyLeadLimit),
    totalLeadLimit: user.totalLeadLimit ?? plan.totalLeadLimit ?? null,
    subscriptionStatus: user.subscriptionStatus || 'local',
    role: user.role || 'user',
    isActive: user.isActive !== false
  };
}

module.exports = router;
