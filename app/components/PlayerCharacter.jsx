import { View, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { palette } from '../styles/theme.js';

function shirtColor(state, isNight) {
  if (state === 'PANIC') return palette.panic;
  if (state === 'IN_DANGER') return palette.danger;
  return isNight ? palette.accentNight : palette.accent;
}

export default function PlayerCharacter({ state = 'STANDING', isNight = false, headTurn = 0, headTilt = 0 }) {
  const color = useMemo(() => shirtColor(state, isNight), [state, isNight]);
  const walking = state === 'WALKING';

  return (
    <View style={styles.root}>
      <View style={styles.shadow} />
      <View style={[styles.legs, walking && styles.walkLegs]} />
      <View style={[styles.torso, { backgroundColor: color }]} />
      <View style={styles.backpack} />
      <View style={styles.arms} />
      <View style={[styles.head, { transform: [{ rotate: `${headTurn}deg` }, { skewY: `${headTilt}deg` }] }]} />
      <View style={styles.hair} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', width: 140, height: 160 },
  shadow: { position: 'absolute', bottom: 20, width: 72, height: 16, borderRadius: 20, backgroundColor: '#00000033' },
  legs: { position: 'absolute', bottom: 28, width: 36, height: 28, borderRadius: 8, backgroundColor: '#64748B' },
  walkLegs: { transform: [{ translateY: -2 }] },
  torso: { position: 'absolute', bottom: 52, width: 52, height: 44, borderRadius: 12 },
  backpack: { position: 'absolute', bottom: 58, width: 58, height: 34, borderRadius: 12, backgroundColor: '#7C3AED66' },
  arms: { position: 'absolute', bottom: 58, width: 68, height: 14, borderRadius: 8, backgroundColor: '#F8B4A4' },
  head: { position: 'absolute', bottom: 88, width: 42, height: 42, borderRadius: 21, backgroundColor: '#F8D4B3' },
  hair: { position: 'absolute', bottom: 108, width: 42, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#1E293B' },
});
