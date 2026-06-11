import express from 'express';
import rateLimit from 'express-rate-limit';
import { body, param, validationResult } from 'express-validator';
import { randomUUID } from 'node:crypto';
import {
  XP_PER_CHECKIN,
  XP_PER_MISSION,
  XP_PER_PING,
} from '../../shared/constants.js';
import {
  alerts,
  getTouristPublicView,
  missionsByTourist,
  nowIso,
  pingsByTourist,
  pushPing,
  tourists,
} from '../store.js';

const router = express.Router();

const pingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Ping rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
});

const panicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 2,
  message: { error: 'Panic endpoint rate limit exceeded' },
});

function emitToAuthorities(req, event, payload) {
  const io = req.app.get('io');
  if (io) {
    io.to('authorities').emit(event, payload);
  }
}

router.post(
  '/ping',
  pingLimiter,
  [body('lat').isFloat({ min: -90, max: 90 }), body('lng').isFloat({ min: -180, max: 180 }), body('accuracy').optional().isFloat({ min: 0 })],
  (req, res) => {
    if (req.user.role !== 'tourist') {
      return res.status(403).json({ error: 'Only tourists can send pings' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const tourist = tourists.get(req.user.sub);
    if (!tourist) {
      return res.status(404).json({ error: 'Tourist not found' });
    }

    const ping = {
      touristId: tourist.id,
      lat: Number(req.body.lat),
      lng: Number(req.body.lng),
      accuracy: Number(req.body.accuracy ?? 0),
      at: nowIso(),
    };

    pushPing(tourist.id, ping);
    tourist.lastPing = ping;
    tourist.xp = (tourist.xp || 0) + XP_PER_PING;

    emitToAuthorities(req, 'tourist_update', {
      tourist: getTouristPublicView(tourist),
      ping,
    });

    return res.json({ ok: true, xp: tourist.xp });
  },
);

router.post('/panic', panicLimiter, (req, res) => {
  if (req.user.role !== 'tourist') {
    return res.status(403).json({ error: 'Only tourists can trigger panic' });
  }

  const tourist = tourists.get(req.user.sub);
  if (!tourist) {
    return res.status(404).json({ error: 'Tourist not found' });
  }

  tourist.status = 'PANIC';
  const alert = {
    id: `alert-${randomUUID()}`,
    touristId: tourist.id,
    type: 'PANIC',
    status: 'OPEN',
    createdAt: nowIso(),
  };

  alerts.set(alert.id, alert);
  emitToAuthorities(req, 'panic_alert', { alert, tourist: getTouristPublicView(tourist) });

  return res.status(202).json({ ok: true, alertId: alert.id });
});

router.post('/checkin', [body('landmarkId').isString().notEmpty()], (req, res) => {
  if (req.user.role !== 'tourist') {
    return res.status(403).json({ error: 'Only tourists can check in' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const tourist = tourists.get(req.user.sub);
  if (!tourist) {
    return res.status(404).json({ error: 'Tourist not found' });
  }

  tourist.xp = (tourist.xp || 0) + XP_PER_CHECKIN;
  tourist.lastCheckin = {
    landmarkId: req.body.landmarkId,
    at: nowIso(),
  };

  return res.json({ ok: true, xp: tourist.xp });
});

router.get('/missions', (req, res) => {
  if (req.user.role !== 'tourist') {
    return res.status(403).json({ error: 'Only tourists can view missions' });
  }

  const tourist = tourists.get(req.user.sub);
  if (!tourist) {
    return res.status(404).json({ error: 'Tourist not found' });
  }

  if (!missionsByTourist.has(tourist.id)) {
    missionsByTourist.set(tourist.id, [
      { id: 'mission-safe-ping', title: 'Stay connected', rewardXp: XP_PER_MISSION, completed: false },
    ]);
  }

  return res.json({ missions: missionsByTourist.get(tourist.id) });
});

router.post('/efir', [body('touristId').isString().notEmpty(), body('narrative').optional().isString()], (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Only authorities can generate E-FIR' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }

  const tourist = tourists.get(req.body.touristId);
  if (!tourist) {
    return res.status(404).json({ error: 'Tourist not found' });
  }

  const lastPings = (pingsByTourist.get(tourist.id) || []).slice(-5);
  const efir = {
    id: `efir-${randomUUID()}`,
    touristId: tourist.id,
    touristName: tourist.name,
    generatedAt: nowIso(),
    summary: req.body.narrative || `Potential incident involving ${tourist.name}.`,
    breadcrumb: lastPings,
  };

  return res.status(201).json({ efir });
});

router.post('/alert/resolve', [body('alertId').isString().notEmpty()], (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Only authorities can resolve alerts' });
  }

  const alert = alerts.get(req.body.alertId);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  alert.status = 'RESOLVED';
  alert.resolvedAt = nowIso();
  emitToAuthorities(req, 'alert_resolved', alert);

  return res.json({ ok: true, alert });
});

router.get('/pings/:touristId', [param('touristId').isString().notEmpty()], (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Only authorities can access pings breadcrumb' });
  }

  const tourist = tourists.get(req.params.touristId);
  if (!tourist) {
    return res.status(404).json({ error: 'Tourist not found' });
  }

  const breadcrumb = (pingsByTourist.get(tourist.id) || []).slice(-5);
  return res.json({ tourist: getTouristPublicView(tourist), breadcrumb });
});

router.get('/tourists', (req, res) => {
  if (req.user.role !== 'authority') {
    return res.status(403).json({ error: 'Only authorities can list tourists' });
  }

  const list = [...tourists.values()].map(getTouristPublicView);
  return res.json({ tourists: list });
});

export default router;
