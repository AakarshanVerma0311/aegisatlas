import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { body, validationResult } from 'express-validator';
import {
  BCRYPT_COST,
  JWT_EXPIRY_AUTHORITY,
  JWT_EXPIRY_TOURIST,
  LOGIN_LOCKOUT_ATTEMPTS_AUTHORITY,
  LOGIN_LOCKOUT_ATTEMPTS_TOURIST,
  LOGIN_LOCKOUT_DURATION_MS,
} from '../../shared/constants.js';
import {
  tourists,
  authorities,
  loginAttempts,
  nowIso,
} from '../store.js';

const router = express.Router();

const defaultAuthorityPassword = process.env.DEFAULT_AUTHORITY_PASSWORD || 'ChangeMe@123';
if (!authorities.size) {
  const seedHash = bcrypt.hashSync(defaultAuthorityPassword, BCRYPT_COST);
  authorities.set('AAT-0001', {
    id: 'AAT-0001',
    badgeNumber: 'AAT-0001',
    name: 'Control Room 1',
    passwordHash: seedHash,
    role: 'authority',
    createdAt: nowIso(),
  });
}

function isLocked(key, maxAttempts) {
  const entry = loginAttempts.get(key);
  if (!entry) return false;

  if (Date.now() > entry.lockedUntil) {
    loginAttempts.delete(key);
    return false;
  }

  return entry.attempts >= maxAttempts;
}

function recordFailedAttempt(key) {
  const current = loginAttempts.get(key) || { attempts: 0, lockedUntil: 0 };
  const attempts = current.attempts + 1;
  loginAttempts.set(key, {
    attempts,
    lockedUntil: Date.now() + LOGIN_LOCKOUT_DURATION_MS,
  });
}

function clearAttempts(key) {
  loginAttempts.delete(key);
}

function signAccessToken(user) {
  const expiresIn = user.role === 'authority' ? JWT_EXPIRY_AUTHORITY : JWT_EXPIRY_TOURIST;
  return jwt.sign(
    { sub: user.id, role: user.role, name: user.name, email: user.email || null },
    process.env.JWT_SECRET,
    { expiresIn },
  );
}

router.post(
  '/tourist/register',
  [body('name').isString().isLength({ min: 2 }), body('email').isEmail(), body('password').isLength({ min: 8 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();

    if ([...tourists.values()].find((user) => user.email === normalizedEmail)) {
      return res.status(409).json({ error: 'Tourist account already exists' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const id = `tourist-${randomUUID()}`;
    const user = {
      id,
      role: 'tourist',
      name,
      email: normalizedEmail,
      passwordHash,
      createdAt: nowIso(),
      status: 'SAFE',
    };

    tourists.set(id, user);

    const token = signAccessToken(user);
    return res.status(201).json({
      token,
      tourist: { id: user.id, name: user.name, email: user.email },
      qrToken: `qr:${user.id}`,
    });
  },
);

router.post(
  '/tourist/login',
  [body('email').isEmail(), body('password').isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const email = req.body.email.toLowerCase();
    const lockKey = `tourist:${email}`;
    if (isLocked(lockKey, LOGIN_LOCKOUT_ATTEMPTS_TOURIST)) {
      return res.status(423).json({ error: 'Account temporarily locked' });
    }

    const user = [...tourists.values()].find((u) => u.email === email);
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      recordFailedAttempt(lockKey);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearAttempts(lockKey);
    return res.json({ token: signAccessToken(user), tourist: { id: user.id, name: user.name, email: user.email } });
  },
);

router.post('/tourist/oauth', [body('email').isEmail(), body('provider').isString().notEmpty()], (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase();
  let user = [...tourists.values()].find((u) => u.email === normalizedEmail);

  if (!user) {
    user = {
      id: `tourist-${randomUUID()}`,
      role: 'tourist',
      name: req.body.name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash: '',
      createdAt: nowIso(),
      status: 'SAFE',
    };
    tourists.set(user.id, user);
  }

  return res.json({ token: signAccessToken(user), tourist: { id: user.id, name: user.name, email: user.email } });
});

router.post(
  '/authority/login',
  [body('badgeNumber').isString().notEmpty(), body('password').isString().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const badgeNumber = req.body.badgeNumber.trim();
    const lockKey = `authority:${badgeNumber}`;
    if (isLocked(lockKey, LOGIN_LOCKOUT_ATTEMPTS_AUTHORITY)) {
      return res.status(423).json({ error: 'Authority account temporarily locked' });
    }

    const user = authorities.get(badgeNumber);
    if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      recordFailedAttempt(lockKey);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearAttempts(lockKey);
    return res.json({ token: signAccessToken(user), authority: { id: user.id, name: user.name, badgeNumber: user.badgeNumber } });
  },
);

router.post('/refresh', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const expiredForMs = Date.now() - (payload.exp || 0) * 1000;
    if (expiredForMs > 60 * 60 * 1000) {
      return res.status(401).json({ error: 'Refresh window expired' });
    }

    const role = payload.role;
    const user = role === 'authority' ? authorities.get(payload.sub) : tourists.get(payload.sub);
    if (!user) {
      return res.status(404).json({ error: 'Account not found' });
    }

    return res.json({ token: signAccessToken(user) });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
