import { View, Text, StyleSheet } from 'react-native';

export default function QRScreen({ touristId }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>Emergency QR</Text>
      <Text style={styles.code}>qr:{touristId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, borderRadius: 12, backgroundColor: '#1E293B', gap: 6 },
  title: { color: '#E2E8F0', fontWeight: '700' },
  code: { color: '#F472B6' },
});
