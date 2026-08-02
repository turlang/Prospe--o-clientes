/**
 * @fileoverview Rotas de autenticação, registro, sessão e recuperação segura de senha.
 *
 * Responsabilidade delimitada conforme a arquitetura descrita em
 * `docs/ARQUITETURA.md`. Alterações neste arquivo devem preservar os contratos
 * documentados e ser acompanhadas por testes quando afetarem regras de negócio.
 *
 * @module src/routes/authRoutes
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { createToken, requireAuth } = require('../middleware/auth');
const { hasMongoUri } = require('../infrastructure/database/mongoConnection');
const { findUserByEmail, findUserById, findUserByDeviceId, countRecentLocalRegistrationsByIp, createLocalUser, updateLocalUserPassword } = require('../repositories/local/userRepository');
const { getPlan } = require('../domain/plans/planCatalog');
const TrialGuard = require('../models/TrialGuard');
const PasswordReset = require('../models/PasswordReset');
const { getPasswordResetEmailStatus, sendPasswordResetEmail } = require('../services/emailService');
const { resolvePublicAppUrl, shouldExposeDevelopmentResetLink } = require('../services/passwordRecoveryService');
const {
  createLocalPasswordReset,
  invalidateOtherLocalPasswordResets,
  consumeLocalPasswordReset,
  releaseLocalPasswordReset,
  deleteLocalPasswordReset
} = require('../repositories/local/passwordResetRepository');
const { simpleRateLimit } = require('../middleware/rateLimit');

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
  const generic = {
    ok: true,
    message: 'Se o e-mail existir, enviaremos instruções para redefinir a senha.'
  };

  let createdReset = null;
  let localMode = false;
  let emailSent = false;

  try {
    const email = String(req.body.email || '').trim().toLowerCase().slice(0, 254);
    if (!validateEmail(email)) return res.json(generic);

    // A configuração é verificada antes de consultar o usuário para que a
    // indisponibilidade do provedor não revele se o e-mail está cadastrado.
    const emailStatus = getPasswordResetEmailStatus();
    if (!emailStatus.available) {
      console.error('[PASSWORD_RECOVERY_CONFIG]', emailStatus.reason);
      return res.status(503).json({
        error: 'A recuperação por e-mail está temporariamente indisponível. Tente novamente mais tarde.'
      });
    }

    const mongoMode = hasMongoUri();
    const user = mongoMode
      ? await User.findOne({ email })
      : await findUserByEmail(email);

    if (!user || user.isActive === false) return res.json(generic);

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
    const resetUrl = `${resolvePublicAppUrl(req)}/reset-password.html?token=${encodeURIComponent(token)}`;
    const resetInput = {
      userId: user._id || user.id,
      email,
      tokenHash,
      expiresAt,
      requestedIp: getClientIp(req),
      userAgent: String(req.headers['user-agent'] || '').slice(0, 500)
    };

    localMode = !mongoMode;
    createdReset = mongoMode
      ? await PasswordReset.create(resetInput)
      : await createLocalPasswordReset(resetInput);

    await sendPasswordResetEmail({
      email,
      resetUrl,
      requestId: `password-reset-${createdReset._id || createdReset.id}`
    });
    emailSent = true;

    try {
      const usedAt = new Date();
      if (mongoMode) {
        await PasswordReset.updateMany(
          { userId: user._id, _id: { $ne: createdReset._id }, usedAt: null },
          { $set: { usedAt } }
        );
      } else {
        await invalidateOtherLocalPasswordResets(user.id, createdReset.id);
      }
    } catch (error) {
      // O novo link já foi enviado e deve continuar válido mesmo se a limpeza
      // de links antigos falhar. A falha fica visível no log operacional.
      console.error('[PASSWORD_RECOVERY_INVALIDATION_FAILED]', error?.message || error);
    }

    if (shouldExposeDevelopmentResetLink()) {
      return res.json({
        ...generic,
        message: 'Link de recuperação gerado para desenvolvimento.',
        developmentResetUrl: resetUrl
      });
    }

    return res.json(generic);
  } catch (error) {
    if (createdReset && !emailSent) {
      try {
        if (localMode) await deleteLocalPasswordReset(createdReset.id);
        else await PasswordReset.deleteOne({ _id: createdReset._id });
      } catch {}
    }

    console.error('[PASSWORD_RECOVERY_FAILED]', error?.message || error);
    return res.status(error?.code === 'EMAIL_NOT_CONFIGURED' ? 503 : 502).json({
      error: 'Não foi possível enviar o e-mail de recuperação agora. Tente novamente mais tarde.'
    });
  }
});

router.post('/reset-password', recoveryLimiter, async (req, res) => {
  let reset = null;
  let localMode = false;
  let passwordUpdated = false;

  try {
    const token = String(req.body.token || '').trim().slice(0, 256);
    const password = String(req.body.password || '');

    if (!token || !password) {
      return res.status(400).json({ error: 'Informe o token e a nova senha.' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'A senha deve ter entre 8 e 128 caracteres.' });
    }

    const tokenHash = hashResetToken(token);
    const passwordChangedAt = new Date();
    const passwordHash = await bcrypt.hash(password, 12);
    localMode = !hasMongoUri();

    if (localMode) {
      reset = await consumeLocalPasswordReset(tokenHash);
      if (!reset) return res.status(400).json({ error: 'Link inválido ou expirado.' });

      const updatedUser = await updateLocalUserPassword(reset.userId, passwordHash, passwordChangedAt);
      if (!updatedUser) {
        await releaseLocalPasswordReset(reset.id);
        return res.status(400).json({ error: 'Link inválido ou expirado.' });
      }
      passwordUpdated = true;
    } else {
      reset = await PasswordReset.findOneAndUpdate(
        { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
        { $set: { usedAt: passwordChangedAt } },
        { new: true }
      );

      if (!reset) return res.status(400).json({ error: 'Link inválido ou expirado.' });

      const updatedUser = await User.findByIdAndUpdate(
        reset.userId,
        { passwordHash, passwordChangedAt },
        { new: true }
      );

      if (!updatedUser) {
        await PasswordReset.updateOne(
          { _id: reset._id, usedAt: passwordChangedAt },
          { $set: { usedAt: null } }
        );
        return res.status(400).json({ error: 'Link inválido ou expirado.' });
      }
      passwordUpdated = true;
    }

    return res.json({
      ok: true,
      message: 'Senha redefinida com sucesso. Faça login novamente.'
    });
  } catch (error) {
    if (reset && !passwordUpdated) {
      try {
        if (localMode) await releaseLocalPasswordReset(reset.id);
        else await PasswordReset.updateOne({ _id: reset._id }, { $set: { usedAt: null } });
      } catch {}
    }
    console.error('[PASSWORD_RESET_FAILED]', error?.message || error);
    return res.status(500).json({ error: 'Não foi possível redefinir a senha.' });
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
