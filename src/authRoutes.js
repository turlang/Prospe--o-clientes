const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { createToken, requireAuth } = require('./middleware/auth');
const { hasMongoUri } = require('./db');
const { findUserByEmail, findUserById, createLocalUser } = require('./localUserStore');
const { getPlan } = require('./planConfig');

const router = express.Router();

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

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });
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
    subscriptionStatus: user.subscriptionStatus || 'local'
  };
}

module.exports = router;
