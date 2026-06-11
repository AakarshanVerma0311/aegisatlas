import { useState } from 'react';
import { View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import RoleSelectorScreen from './screens/RoleSelectorScreen.jsx';
import AuthScreen from './screens/AuthScreen.jsx';
import MapScreen from './screens/MapScreen.jsx';

export default function App() {
  const [role, setRole] = useState('');
  const [token, setToken] = useState('');
  const [tourist, setTourist] = useState(null);

  async function onAuthenticated(nextToken, profile) {
    setToken(nextToken);
    setTourist(profile);
    await SecureStore.setItemAsync('aegisatlas.jwt', nextToken);
  }

  if (!role) return <RoleSelectorScreen onSelect={setRole} />;
  if (role !== 'tourist') return <View />;
  if (!token) return <AuthScreen onAuthenticated={onAuthenticated} />;
  return <MapScreen token={token} tourist={tourist} />;
}
