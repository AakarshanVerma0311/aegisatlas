import { io } from 'socket.io-client';

export function createDashboardSocket(token) {
  return io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', {
    transports: ['websocket'],
    auth: { token },
  });
}
