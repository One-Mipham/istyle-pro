import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { QuotaBadge } from '../../components/QuotaBadge';
import { useQuota } from '../../lib/quota';

export default function Home() {
  const { fetchQuota } = useQuota();
  useEffect(() => { fetchQuota(); }, []);

  return (
    <View style={s.container}>
      <QuotaBadge />
      <Text style={s.greeting}>iStyle Pro</Text>
      <Text style={s.subtitle}>你的私人 AI 形象顾问</Text>

      <Pressable style={s.primaryButton} onPress={() => router.push('/camera?mode=quick')}>
        <Text style={s.primaryIcon}>📸</Text>
        <Text style={s.primaryText}>快速试穿</Text>
        <Text style={s.primaryHint}>拍照 → AI 推荐搭配</Text>
      </Pressable>

      <Pressable style={s.secondaryButton} onPress={() => router.push('/explore')}>
        <Text style={s.secondaryIcon}>🎨</Text>
        <Text style={s.secondaryText}>风格探索</Text>
        <Text style={s.secondaryHint}>浏览模板 → 选择生成</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0F172A', gap: 20 },
  greeting: { fontSize: 32, fontWeight: '700', color: '#F8FAFC' },
  subtitle: { fontSize: 16, color: '#94A3B8' },
  primaryButton: { width: '100%', backgroundColor: '#6366F1', borderRadius: 16, padding: 24, alignItems: 'center', gap: 6 },
  primaryIcon: { fontSize: 32 },
  primaryText: { fontSize: 20, fontWeight: '600', color: '#fff' },
  primaryHint: { fontSize: 14, color: '#C7D2FE' },
  secondaryButton: { width: '100%', backgroundColor: '#1E293B', borderRadius: 16, padding: 24, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#334155' },
  secondaryIcon: { fontSize: 32 },
  secondaryText: { fontSize: 20, fontWeight: '600', color: '#F8FAFC' },
  secondaryHint: { fontSize: 14, color: '#94A3B8' },
});
