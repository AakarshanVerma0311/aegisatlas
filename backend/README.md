# AegisAtlas Backend

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Required environment variables

- `JWT_SECRET`
- `INTERNAL_SECRET`
- `ALLOWED_ORIGINS`
- `PORT`

## Auth endpoints (rate limited to 10 / 15 min)

- `POST /auth/tourist/register`
- `POST /auth/tourist/login`
- `POST /auth/tourist/oauth`
- `POST /auth/authority/login`
- `POST /auth/refresh`

## Tourist endpoints

- `POST /api/ping` (5/min)
- `POST /api/panic`
- `POST /api/checkin`
- `GET /api/missions`

## Authority endpoints

- `POST /api/efir`
- `POST /api/alert/resolve`
- `GET /api/pings/:touristId` (last 5 breadcrumb points)
- `GET /api/tourists`

## Internal endpoint

- `POST /ai/analyze` (`x-internal-secret` required)

## Socket events

- `tourist_update`
- `panic_alert`
- `anomaly_alert`
- `alert_resolved`
