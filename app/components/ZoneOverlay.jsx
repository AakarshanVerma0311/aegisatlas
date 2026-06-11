import { View, Text, StyleSheet } from 'react-native';

export default function ZoneOverlay({ inDanger }) {
  if (!inDanger) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠ Danger zone nearby. Move to safety.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FF4757CC',
  },
  text: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
