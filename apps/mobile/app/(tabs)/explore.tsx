import { useState, useEffect } from 'react';
import { View, FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';
import { api } from '../../lib/api';
import { StyleCard } from '../../components/StyleCard';
import { CategoryFilter } from '../../components/CategoryFilter';
import type { StyleTemplate } from '@istyle/shared';

export default function Explore() {
  const [styles_, setStyles] = useState<StyleTemplate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<string | null>(null);

  useEffect(() => {
    api<{ styles: StyleTemplate[] }>('/api/styles').then(res => setStyles(res.styles));
  }, []);

  const filteredStyles = filter ? styles_.filter(s => s.category === filter) : styles_;

  const toggleStyle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <View style={s.container}>
      <CategoryFilter selected={filter} onSelect={setFilter} />
      <FlatList
        data={filteredStyles}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={s.grid}
        renderItem={({ item }) => (
          <StyleCard {...item} selected={selected.has(item.id)} onToggle={() => toggleStyle(item.id)} />
        )}
      />
      {selected.size > 0 && (
        <Pressable style={s.fab} onPress={() => router.push({ pathname: '/camera', params: { mode: 'explore', styles: Array.from(selected).join(',') } })}>
          <Text style={s.fabText}>已选 {selected.size} 项 · 去拍照</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  grid: { paddingHorizontal: spacing.md },
  fab: {
    position: 'absolute',
    bottom: spacing['2xl'],
    left: spacing['2xl'],
    right: spacing['2xl'],
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  fabText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
});
