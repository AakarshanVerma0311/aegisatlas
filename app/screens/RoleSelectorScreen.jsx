import { View, Text, Pressable, StyleSheet } from 'react-native';

export default function RoleSelectorScreen({ onSelect }) {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>AegisAtlas</Text>
      <Pressable style={styles.btn} onPress={() => onSelect('tourist')}>
        <Text style={styles.btnText}>Tourist</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={() => onSelect('authority')}>
        <Text style={styles.btnText}>Authority (view only)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0F172A' },
  title: { color: '#E2E8F0', fontSize: 28, fontWeight: '700' },
  btn: { backgroundColor: '#334155', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  btnText: { color: '#F8FAFC', fontWeight: '700' },
});
