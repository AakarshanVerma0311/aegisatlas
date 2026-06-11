import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../styles/theme.js';

export default function HUD({ xp = 0, state = 'SAFE', zone = 'SAFE_ZONE' }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>XP: {xp}</Text>
      <Text style={styles.label}>State: {state}</Text>
      <Text style={styles.label}>Zone: {zone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1E293BEE',
    width: '100%',
    gap: 4,
  },
  label: { color: palette.text, fontSize: 14, fontWeight: '600' },
});
