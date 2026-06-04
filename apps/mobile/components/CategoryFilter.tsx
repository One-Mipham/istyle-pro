import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

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
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  chipText: { color: '#94A3B8', fontSize: 14 },
  chipTextActive: { color: '#fff', fontSize: 14 },
});
