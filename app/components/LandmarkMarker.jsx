import { Text, View, StyleSheet } from 'react-native';

export default function LandmarkMarker({ emoji, name }) {
  return (
    <View style={styles.marker}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.name}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: { alignItems: 'center', padding: 8 },
  emoji: { fontSize: 20 },
  name: { color: '#CBD5E1', fontSize: 12 },
});
