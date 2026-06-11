import { useEffect, useMemo, useState } from 'react';
import LoginScreen from './screens/LoginScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';
import { createDashboardSocket } from './socket.js';
import './theme.css';

export default function App() {
  const [token, setToken] = useState('');
  const [tourists, setTourists] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const backendUrl = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000', []);

  useEffect(() => {
    if (!token) return undefined;

    const socket = createDashboardSocket(token);

    socket.on('tourist_update', ({ tourist, ping }) => {
      setTourists((current) => {
        const next = current.filter((item) => item.id !== tourist.id);
        return [...next, { ...tourist, coords: [ping.lat, ping.lng], breadcrumb: [...(tourist.breadcrumb || []), [ping.lat, ping.lng]].slice(-5) }];
      });
    });

    socket.on('panic_alert', ({ alert }) => {
      setAlerts((current) => [alert, ...current.filter((item) => item.id !== alert.id)]);
    });

    socket.on('anomaly_alert', (alert) => {
      setAlerts((current) => [alert, ...current.filter((item) => item.id !== alert.id)]);
    });

    socket.on('alert_resolved', (alert) => {
      setAlerts((current) => current.filter((item) => item.id !== alert.id));
    });

    fetch(`${backendUrl}/api/tourists`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((response) => response.json())
      .then((payload) => setTourists(payload.tourists || []))
      .catch(() => setTourists([]));

    return () => socket.disconnect();
  }, [backendUrl, token]);

  async function resolveAlert(alertId) {
    await fetch(`${backendUrl}/api/alert/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ alertId }),
    });
  }

  async function generateEFIR({ touristId, narrative }) {
    await fetch(`${backendUrl}/api/efir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ touristId, narrative }),
    });
  }

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  return <MapScreen tourists={tourists} alerts={alerts} onResolve={resolveAlert} onGenerateEFIR={generateEFIR} />;
}
