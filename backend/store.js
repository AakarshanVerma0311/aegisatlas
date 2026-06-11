export const tourists = new Map();
export const authorities = new Map();
export const pingsByTourist = new Map();
export const missionsByTourist = new Map();
export const alerts = new Map();

export const loginAttempts = new Map();

export function nowIso() {
  return new Date().toISOString();
}

export function getTouristPublicView(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    lastPing: user.lastPing || null,
    status: user.status || 'SAFE',
    isAuthenticated: true,
  };
}

export function pushPing(touristId, ping) {
  const existing = pingsByTourist.get(touristId) || [];
  existing.push(ping);
  pingsByTourist.set(touristId, existing.slice(-50));
}
