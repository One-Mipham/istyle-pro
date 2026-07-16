import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';
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
  badge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2, // 6
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { color: colors.textSecondary, fontSize: fontSize.sm },
});
