import { View, Text, StyleSheet } from 'react-native';
import { useQuota } from '../lib/quota';

export function QuotaBadge() {
  const remaining = useQuota(s => s.remaining);
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>今日剩余 {remaining} 次</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { position: 'absolute', top: 8, right: 16, backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  text: { color: '#94A3B8', fontSize: 12 },
});
