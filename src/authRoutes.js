const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./models/User');
const { createToken, requireAuth } = require('./middleware/auth');
const { hasMongoUri } = require('./db');
const { findUserByEmail, findUserById, createLocalUser } = require('./localUserStore');
const { getPlan } = require('./planConfig');
const TrialGuard = require('./models/TrialGuard');
const PasswordReset = require('./models/PasswordReset');

const router = express.Router();

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
  const ipLimit = Number(process.env.REGISTER_IP_DAILY_LIMIT || 3);

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

async function sendPasswordResetEmail({ email, resetUrl }) {
  // Integração pronta para provedor transacional futuro.
  // Por enquanto registra o link no log do Render para validação segura.
  console.log('[PASSWORD_RESET_LINK]', email, resetUrl);
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Informe nome, e-mail e senha.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    if (hasMongoUri()) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });

      const ip = getClientIp(req);
      const deviceId = normalizeDeviceId(req.body.deviceId || req.headers['x-device-id']);
      const userAgent = String(req.headers['user-agent'] || '');

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

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createLocalUser({ name, email, passwordHash });
    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.post('/forgot-password', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();

    // Resposta genérica para evitar enumeração de usuários.
    const generic = {
      ok: true,
      message: 'Se o e-mail existir, enviaremos instruções para redefinir a senha.'
    };

    if (!email) return res.json(generic);

    const user = hasMongoUri()
      ? await User.findOne({ email })
      : await findUserByEmail(email);

    if (!user) return res.json(generic);

    if (!hasMongoUri()) {
      return res.json({
        ...generic,
        devMessage: 'Recuperação de senha requer MongoDB ativo.'
      });
    }

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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const token = String(req.body.token || '').trim();
    const password = String(req.body.password || '');

    if (!token || !password) {
      return res.status(400).json({ error: 'Informe o token e a nova senha.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    if (!hasMongoUri()) {
      return res.status(400).json({ error: 'Redefinição de senha requer MongoDB ativo.' });
    }

    const tokenHash = hashResetToken(token);
    const reset = await PasswordReset.findOne({
      tokenHash,
      usedAt: null,
      expiresAt: { $gt: new Date() }
    });

    if (!reset) {
      return res.status(400).json({ error: 'Link inválido ou expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await User.findByIdAndUpdate(reset.userId, { passwordHash });
    reset.usedAt = new Date();
    await reset.save();

    return res.json({
      ok: true,
      message: 'Senha redefinida com sucesso. Faça login novamente.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = hasMongoUri()
      ? await User.findById(req.user.sub)
      : await findUserById(req.user.sub);

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    dailyLeadLimit: Number(user.dailyLeadLimit || plan.dailyLeadLimit),
    totalLeadLimit: user.totalLeadLimit ?? plan.totalLeadLimit ?? null,
    subscriptionStatus: user.subscriptionStatus || 'local',
    role: user.role || 'user',
    isActive: user.isActive !== false
  };
}

module.exports = router;
