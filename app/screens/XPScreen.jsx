import { View, Text, StyleSheet } from 'react-native';

export default function XPScreen({ xp = 0 }) {
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  return (
    <View style={styles.root}>
      <Text style={styles.text}>XP: {xp}</Text>
      <Text style={styles.text}>Level: {level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 16, borderRadius: 12, backgroundColor: '#1E293B', gap: 4 },
  text: { color: '#E2E8F0', fontWeight: '700' },
});
