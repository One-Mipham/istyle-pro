import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';

interface StyleCardProps {
  name: string;
  category: string;
  scene: string;
  selected: boolean;
  onToggle: () => void;
}

const SCENE_LABELS: Record<string, string> = { work: '职业', sport: '运动', casual: '休闲' };
const CAT_LABELS: Record<string, string> = { hair: '发型', clothing: '服装' };

export function StyleCard({ name, category, scene, selected, onToggle }: StyleCardProps) {
  const sceneLabel = SCENE_LABELS[scene] ?? scene;
  const catLabel = CAT_LABELS[category] ?? category;

  return (
    <Pressable style={[styles.card, selected && styles.cardSelected]} onPress={onToggle}>
      <View style={styles.preview}>
        <Text style={styles.previewText}>{name[0]}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.meta}>{catLabel} · {sceneLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: { borderColor: colors.primary },
  preview: {
    height: 120,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: { fontSize: fontSize['7xl'], color: colors.textSecondary },
  name: { color: colors.text, fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginTop: spacing.sm },
  meta: { color: colors.textTertiary, fontSize: fontSize.sm, marginTop: spacing.xs },
});
