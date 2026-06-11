from __future__ import annotations

from collections import Counter
from datetime import datetime, timedelta, timezone
from math import radians, sin, cos, sqrt, asin
from typing import Iterable


def _distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius = 6_371_000
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * earth_radius * asin(sqrt(a))


def no_movement_rule(pings: list[dict]) -> bool:
    if len(pings) < 5:
        return False

    latest_five = pings[-5:]
    times = [datetime.fromisoformat(item["at"].replace("Z", "+00:00")) for item in latest_five]
    if max(times) - min(times) < timedelta(minutes=120):
        return False

    seed = latest_five[0]
    return all(
        _distance_meters(seed["lat"], seed["lng"], ping["lat"], ping["lng"]) < 20 for ping in latest_five[1:]
    )


def geofence_breach_rule(current_lat: float, current_lng: float, restricted_zones: Iterable[dict]) -> bool:
    for zone in restricted_zones:
        center = zone.get("center")
        radius_m = float(zone.get("radius_m", 0))
        if not center or radius_m <= 0:
            continue
        if _distance_meters(current_lat, current_lng, center[0], center[1]) <= radius_m:
            return True
    return False


def missed_checkin_rule(missed_checkins: int) -> bool:
    return missed_checkins >= 3


def zone_density_rule(zones: list[str], area_km2: float) -> bool:
    if area_km2 <= 0:
        return False
    counts = Counter(zones)
    return any((count / area_km2) > 50 for count in counts.values())


def evaluate_anomaly(payload: dict) -> dict:
    pings = payload.get("pings", [])
    restricted_zones = payload.get("restricted_zones", [])
    missed_checkins = int(payload.get("missed_checkins", 0))
    zone_samples = payload.get("zone_samples", [])
    zone_area_km2 = float(payload.get("zone_area_km2", 1.0))

    latest = pings[-1] if pings else {"lat": 0.0, "lng": 0.0}

    findings = {
        "NO_MOVEMENT": no_movement_rule(pings),
        "GEOFENCE_BREACH": geofence_breach_rule(latest.get("lat", 0.0), latest.get("lng", 0.0), restricted_zones),
        "MISSED_CHECKIN": missed_checkin_rule(missed_checkins),
        "ZONE_DENSITY": zone_density_rule(zone_samples, zone_area_km2),
    }

    active_rules = [name for name, active in findings.items() if active]
    return {
        "detected": bool(active_rules),
        "active_rules": active_rules,
        "evaluated_at": datetime.now(timezone.utc).isoformat(),
    }
