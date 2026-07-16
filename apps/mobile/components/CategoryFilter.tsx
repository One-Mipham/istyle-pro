import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSize } from '@istyle/shared';

interface CategoryFilterProps {
  selected: string | null;
  onSelect: (category: string | null) => void;
}

const FILTERS = [
  { key: null, label: '全部' },
  { key: 'hair', label: '发型' },
  { key: 'clothing', label: '服装' },
];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {FILTERS.map(f => (
        <Pressable key={String(f.key)} style={[styles.chip, selected === f.key && styles.chipActive]} onPress={() => onSelect(f.key)}>
          <Text style={selected === f.key ? styles.chipTextActive : styles.chipText}>{f.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: fontSize.base },
  chipTextActive: { color: colors.white, fontSize: fontSize.base },
});
