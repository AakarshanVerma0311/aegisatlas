# AegisAtlas AI Engine

## Run

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export INTERNAL_SECRET=replace-me
uvicorn main:app --reload --port 8001
```

## API

- `GET /health`
- `POST /analyze` (requires `x-internal-secret`)

The analyzer evaluates four anomaly rules:
1. No movement for 5 pings across >=120 minutes within <20m radius
2. Geofence breach into restricted zone
3. 3+ consecutive missed check-ins
4. Zone density >50 tourists/km²
