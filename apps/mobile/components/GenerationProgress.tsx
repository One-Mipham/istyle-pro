import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '@istyle/shared';

interface GenerationProgressProps {
  stage: 'uploading' | 'analyzing' | 'generating' | 'completed';
}

const STAGES: Array<{ key: GenerationProgressProps['stage']; label: string }> = [
  { key: 'uploading', label: '上传照片' },
  { key: 'analyzing', label: '分析体型特征' },
  { key: 'generating', label: 'AI 生成你的新形象' },
  { key: 'completed', label: '完成' },
];

export function GenerationProgress({ stage }: GenerationProgressProps) {
  return (
    <View style={styles.container}>
      {STAGES.map((s, i) => {
        const isCurrent = s.key === stage;
        const isDone = STAGES.findIndex(x => x.key === stage) > i;
        return (
          <View key={s.key} style={styles.row}>
            <View style={[styles.dot, isDone && styles.dotDone, isCurrent && styles.dotCurrent]} />
            <Text style={[styles.label, (isDone || isCurrent) && styles.labelActive]}>{s.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl - 2 }, // 14 → use spacing.lg - 2 equivalent
  dot: {
    width: spacing.xl - 2,
    height: spacing.xl - 2,
    borderRadius: (spacing.xl - 2) / 2,
    backgroundColor: colors.border,
  },
  dotDone: { backgroundColor: colors.success },
  dotCurrent: { backgroundColor: colors.primary },
  label: { fontSize: fontSize.lg, color: colors.textTertiary },
  labelActive: { color: colors.text },
});
