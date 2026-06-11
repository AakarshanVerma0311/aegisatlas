import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { verifyToken } from './middleware/auth.js';
import { setupSocketIO } from './socket.js';

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.INTERNAL_SECRET) {
  throw new Error('JWT_SECRET and INTERNAL_SECRET must be set');
}

const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (serviceAccountRaw) {
  try {
    const serviceAccount = JSON.parse(serviceAccountRaw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } catch (error) {
    console.warn('Skipping Firebase init due to invalid FIREBASE_SERVICE_ACCOUNT_JSON');
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
app.set('io', io);

app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-internal-secret'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth requests. Please retry later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'aegisatlas-backend' }));
app.use('/auth', authLimiter, authRoutes);
app.use('/api', verifyToken, apiRoutes);

app.post('/ai/analyze', (req, res) => {
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized internal request' });
  }

  const ioRef = req.app.get('io');
  ioRef.to('authorities').emit('anomaly_alert', req.body);
  return res.status(202).json({ accepted: true });
});

setupSocketIO(io);

app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`AegisAtlas backend listening on ${PORT}`);
});

export { app, io };
