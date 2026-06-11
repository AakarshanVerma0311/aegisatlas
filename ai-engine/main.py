from __future__ import annotations

import os
from datetime import datetime, timezone

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from nudge_messages import NUDGE_MESSAGES
from rules import evaluate_anomaly
from state_machine import EscalationStateMachine

app = FastAPI(title="AegisAtlas AI Engine", version="1.0.0")
state_machine = EscalationStateMachine()


class AnalyzePayload(BaseModel):
    tourist_id: str = Field(min_length=1)
    pings: list[dict] = Field(default_factory=list)
    restricted_zones: list[dict] = Field(default_factory=list)
    missed_checkins: int = 0
    zone_samples: list[str] = Field(default_factory=list)
    zone_area_km2: float = 1.0


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "aegisatlas-ai", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/analyze")
def analyze(payload: AnalyzePayload, x_internal_secret: str = Header(default="")) -> dict:
    internal_secret = os.getenv("INTERNAL_SECRET")
    if not internal_secret:
        raise HTTPException(status_code=500, detail="INTERNAL_SECRET is not configured")

    if x_internal_secret != internal_secret:
        raise HTTPException(status_code=401, detail="Unauthorized internal request")

    result = evaluate_anomaly(payload.model_dump())
    state = state_machine.transition(payload.tourist_id, result["detected"])

    return {
        "tourist_id": payload.tourist_id,
        "detected": result["detected"],
        "active_rules": result["active_rules"],
        "state": state.stage,
        "nudge_messages": [NUDGE_MESSAGES[rule] for rule in result["active_rules"] if rule in NUDGE_MESSAGES],
    }
