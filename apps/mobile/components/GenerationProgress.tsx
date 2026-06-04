import { View, Text, StyleSheet } from 'react-native';

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
  container: { gap: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#334155' },
  dotDone: { backgroundColor: '#22C55E' },
  dotCurrent: { backgroundColor: '#6366F1' },
  label: { fontSize: 16, color: '#64748B' },
  labelActive: { color: '#F8FAFC' },
});
