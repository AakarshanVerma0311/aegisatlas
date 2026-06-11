from dataclasses import dataclass
from datetime import datetime, timedelta, timezone


@dataclass
class AlertState:
    tourist_id: str
    stage: str = "SAFE"
    last_transition_at: datetime = datetime.now(timezone.utc)


class EscalationStateMachine:
    def __init__(self) -> None:
        self._states: dict[str, AlertState] = {}

    def transition(self, tourist_id: str, has_anomaly: bool) -> AlertState:
        state = self._states.get(tourist_id) or AlertState(tourist_id=tourist_id)
        now = datetime.now(timezone.utc)

        if not has_anomaly:
            state.stage = "SAFE"
            state.last_transition_at = now
            self._states[tourist_id] = state
            return state

        elapsed = now - state.last_transition_at
        if state.stage == "SAFE":
            state.stage = "NUDGE"
            state.last_transition_at = now
        elif state.stage == "NUDGE" and elapsed >= timedelta(minutes=30):
            state.stage = "FAMILY_ALERT"
            state.last_transition_at = now
        elif state.stage == "FAMILY_ALERT" and elapsed >= timedelta(minutes=60):
            state.stage = "POLICE_ALERT"
            state.last_transition_at = now

        self._states[tourist_id] = state
        return state
