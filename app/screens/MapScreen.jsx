import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { io } from 'socket.io-client';
import PlayerCharacter from '../components/PlayerCharacter.jsx';
import HUD from '../components/HUD.jsx';
import ZoneOverlay from '../components/ZoneOverlay.jsx';
import { useDeviceMotion } from '../hooks/useDeviceMotion.js';

export default function MapScreen({ token, tourist }) {
  const [xp, setXp] = useState(0);
  const [danger, setDanger] = useState(false);
  const [state, setState] = useState('STANDING');
  const motion = useDeviceMotion(0.25, 0.1);
  const backendUrl = useMemo(() => process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000', []);

  useEffect(() => {
    const socket = io(backendUrl, { transports: ['websocket'], auth: { token } });
    socket.on('panic_alert', () => setState('PANIC'));
    socket.on('anomaly_alert', () => {
      setDanger(true);
      setState('IN_DANGER');
    });

    let interval;
    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }

      interval = setInterval(async () => {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const response = await fetch(`${backendUrl}/api/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
          body: JSON.stringify({ lat: location.coords.latitude, lng: location.coords.longitude, accuracy: location.coords.accuracy }),
        });

        const payload = await response.json();
        if (response.ok && typeof payload.xp === 'number') {
          setXp(payload.xp);
          setState('WALKING');
        }
      }, 30_000);
    })();

    return () => {
      socket.disconnect();
      if (interval) clearInterval(interval);
    };
  }, [backendUrl, token]);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Hi {tourist?.name || 'Traveller'}</Text>
      <PlayerCharacter state={state} headTurn={motion.headTurn} headTilt={motion.headTilt} />
      <HUD xp={xp} state={state} zone={danger ? 'DANGER_ZONE' : 'SAFE_ZONE'} />
      <ZoneOverlay inDanger={danger} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16 },
  title: { color: '#E2E8F0', fontSize: 22, fontWeight: '700' },
});
