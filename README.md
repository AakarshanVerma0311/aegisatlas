# AegisAtlas — Tourist Safety Platform

AegisAtlas is a hackathon-ready monorepo combining a tourist mobile app, authority dashboard, backend APIs, AI anomaly detection, and HTTPS deployment config.

## Monorepo Layout

```text
/backend      Express + Socket.IO APIs and auth
/ai-engine    FastAPI anomaly evaluator + escalation state machine
/dashboard    React 18 authority dashboard
/app          React Native Expo tourist app
/nginx        TLS reverse proxy and certbot helper
/shared       Cross-platform constants + zones
```

## Security Defaults

- JWT expiries: tourist 8h, authority 12h
- bcrypt cost: 12
- Account lockout + auth rate limiting (10 requests/15 min)
- Ping limiter (5/min) and global limiter
- Helmet + CORS allowlist
- Internal AI route guard via `x-internal-secret`
- Expo `SecureStore` JWT storage
- TLS 1.2/1.3 in nginx

## Demo Sequence

1. Start backend (`/backend`) with secure env values.
2. Start AI engine (`/ai-engine`) and set matching `INTERNAL_SECRET`.
3. Run dashboard (`/dashboard`) and login with `AAT-0001 / ChangeMe@123` (replace in production).
4. Run tourist app (`/app`), register tourist, and grant GPS permission.
5. Observe live pings on dashboard, click tourist name for 5-point breadcrumb zoom.
6. Trigger panic in app to see real-time alert and auto draft E-FIR flow.
7. Validate nginx TLS using `nginx/nginx.conf` + `certbot-setup.sh`.

## Component Setup

Refer to each component README for environment variables and local startup commands.
