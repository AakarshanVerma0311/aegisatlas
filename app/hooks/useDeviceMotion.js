import { useMemo } from 'react';

export function useDeviceMotion(dx = 0, dy = 0) {
  return useMemo(() => {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const headTurn = Math.max(-45, Math.min(45, angle || 0));
    const headTilt = Math.max(-8, Math.min(8, (dy || 0) * 8));
    return { headTurn, headTilt };
  }, [dx, dy]);
}
