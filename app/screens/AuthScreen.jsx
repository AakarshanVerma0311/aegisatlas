import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

export default function AuthScreen({ onAuthenticated }) {
  const [email, setEmail] = useState('tourist@example.com');
  const [password, setPassword] = useState('SafePass123');
  const [name, setName] = useState('Tourist');
  const [error, setError] = useState('');

  async function register() {
    setError('');
    const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:4000'}/auth/tourist/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'Registration failed');
      return;
    }

    onAuthenticated(payload.token, payload.tourist);
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Tourist Auth</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" placeholderTextColor="#64748B" />
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#64748B" autoCapitalize="none" />
      <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#64748B" secureTextEntry />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.cta} onPress={register}>
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0F172A', gap: 10 },
  title: { color: '#F8FAFC', fontSize: 26, fontWeight: '700' },
  input: { backgroundColor: '#1E293B', color: '#E2E8F0', borderRadius: 10, padding: 12 },
  error: { color: '#FB7185' },
  cta: { marginTop: 4, backgroundColor: '#D45080', borderRadius: 10, padding: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700' },
});
