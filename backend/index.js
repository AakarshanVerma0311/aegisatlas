// AegisAtlas — backend/index.js | Owner: Part 3 | Build day: 1
// Purpose: Express + Socket.IO server with auth, API routes, real-time updates
// Key deps: express, socket.io, firebase-admin, jsonwebtoken, bcryptjs, helmet, cors, rate-limit

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Routes
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';
import { verifyToken, requireRole } from './middleware/auth.js';
import { setupSocketIO } from './socket.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware — Security Headers
app.use(helmet()); // X-Frame-Options, HSTS, X-Content-Type-Options, etc. — prevents clickjacking, SSL stripping

// Middleware — CORS (prevents CSRF via cross-origin requests)
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Middleware — Body Parser
app.use(express.json());

// Middleware — Global Rate Limiting (DDoS protection)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Middleware — Auth Rate Limiting (brute-force attack mitigation)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 attempts per 15 min — enough for humans, too slow for automated attacks
  message: { error: 'Too many login attempts, account locked for 15 minutes' },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Middleware — Ping Rate Limiting (reconnect tolerance)
const pingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Tourists ping every 30s = 2/min max; 5 gives headroom for reconnects
  message: { error: 'Ping rate limit exceeded' },
});

// Routes
app.use('/auth', authLimiter, authRoutes);
app.use('/api/ping', verifyToken, requireRole('tourist'), pingLimiter, apiRoutes);
app.use('/api', verifyToken, apiRoutes);

// AI Engine internal endpoint (INTERNAL_SECRET auth)
app.post('/ai/ingest', (req, res) => {
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret !== process.env.INTERNAL_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — invalid internal secret' });
    // Blocks unauthorized callers from injecting fake alerts
  }
  // TODO: Handle alert ingestion from AI engine
  res.json({ ok: true });
});

// Socket.IO setup
setupSocketIO(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🛡️ AegisAtlas backend running on port ${PORT}`);
  console.log(`✓ HTTPS redirect enabled (see nginx config)`);
  console.log(`✓ Rate limiting: global 300/15min, auth 10/15min, ping 5/min`);
});

export { app, io, admin };
