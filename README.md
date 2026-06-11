# AegisAtlas — Tourist Safety Platform

Gamified, real-time civic safety platform where tourists earn XP while silently streaming GPS to authorities. Police watch a live heatmap. AI engine fires escalating alerts ending in one-click E-FIR.

## Quick Start

See `/README.md` in each directory for setup instructions.

## Project Structure

```
/aegisatlas
  /app          → React Native (Expo) tourist app
  /dashboard    → React 18 + react-leaflet authority dashboard
  /backend      → Node.js + Express + Socket.IO server
  /ai-engine    → Python 3.11 + FastAPI anomaly engine
  /shared       → zones.geojson, constants.js, constants.py
  /nginx        → nginx.conf + certbot-setup.sh
```

---

Hackathon Mentoring Round 1 Build
