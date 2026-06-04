import { useState, useEffect } from 'react';
import { View, FlatList, Pressable, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
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
  container: { flex: 1, backgroundColor: '#0F172A' },
  grid: { paddingHorizontal: 12 },
  fab: { position: 'absolute', bottom: 24, left: 24, right: 24, backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
