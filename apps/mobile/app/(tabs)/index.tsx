import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { colors, spacing, radius, fontSize, fontWeight, common } from '@istyle/shared';
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
  container: { ...common.screenCentered, gap: spacing.xl },
  greeting: { fontSize: fontSize['6xl'], fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.lg, color: colors.textSecondary },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  primaryIcon: { fontSize: fontSize['6xl'] },
  primaryText: { fontSize: fontSize['2xl'], fontWeight: fontWeight.semibold, color: colors.white },
  primaryHint: { fontSize: fontSize.base, color: colors.primaryLight },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius['2xl'],
    padding: spacing['2xl'],
    alignItems: 'center',
    gap: spacing.xs + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryIcon: { fontSize: fontSize['6xl'] },
  secondaryText: { fontSize: fontSize['2xl'], fontWeight: fontWeight.semibold, color: colors.text },
  secondaryHint: { fontSize: fontSize.base, color: colors.textSecondary },
});
