# AegisAtlas — Backend Setup & API Documentation

## Quick Start

```bash
npm install
export FIREBASE_PROJECT_ID=your-project
export FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
export JWT_SECRET=$(openssl rand -base64 32)
export INTERNAL_SECRET=$(openssl rand -base64 32)
npm start
```

Backend runs on `http://localhost:4000`

## API Endpoints

### Auth (No JWT required)

- `POST /auth/tourist/register` — Create account, returns JWT + QR token
- `POST /auth/tourist/login` — Email + password, returns JWT
- `POST /auth/tourist/oauth` — OAuth verification (Google/Facebook)
- `POST /auth/authority/login` — Badge number + password, returns JWT
- `POST /auth/refresh` — Renew token within 1h of expiry

### Protected Routes (JWT required)

**Tourist only:**
- `POST /api/ping` — Submit GPS location
- `POST /api/panic` — Trigger SOS
- `POST /api/checkin` — Check-in at landmark
- `GET /api/missions` — List active missions

**Authority only:**
- `POST /api/efir` — Generate E-FIR draft
- `POST /api/alert/resolve` — Mark alert resolved
- `GET /api/pings/:touristId` — Get last 20 pings (breadcrumb)
- `GET /api/tourists` — List authenticated tourists

### Internal (INTERNAL_SECRET required)

- `POST /ai/ingest` — Receive alert from AI engine

## WebSocket Events

**From Backend (to clients):**
- `tourist_update` — Live GPS position
- `panic_alert` — SOS triggered
- `anomaly_alert` — AI detected anomaly
- `alert_resolved` — Alert marked safe

**From Clients (to backend):**
- (events handled server-side only)

## Security

- HTTPS + TLS 1.2/1.3
- JWT tokens (8h tourist, 12h authority)
- bcrypt password hashing (cost 12)
- Rate limiting: auth 10/15min, API 300/15min, ping 5/min
- Account lockout after failed attempts
- CORS whitelist
- Helmet security headers
- INTERNAL_SECRET for AI engine authentication

## Environment Variables

See `.env.example` in backend root.
