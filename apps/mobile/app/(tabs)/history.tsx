import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import type { GenerationRecord } from '@istyle/shared';

export default function History() {
  const [items, setItems] = useState<GenerationRecord[]>([]);

  useEffect(() => {
    api<{ data: GenerationRecord[] }>('/api/generate/history').then(res => setItems(res.data)).catch(() => {});
  }, []);

  return (
    <View style={s.container}>
      {items.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>还没有生成记录</Text>
          <Text style={s.emptyHint}>去首页开始你的第一次试穿</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          renderItem={({ item }) => (
            <View style={s.card}>
              {item.resultImageUrl && <Image source={{ uri: item.resultImageUrl }} style={s.thumb} />}
              <View style={s.info}>
                <Text style={s.date}>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</Text>
                <Text style={s.status}>{item.status === 'completed' ? '✓ 完成' : item.status === 'failed' ? '✗ 失败' : '⏳ 处理中'}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { color: '#94A3B8', fontSize: 18 },
  emptyHint: { color: '#64748B', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 12, padding: 12, gap: 12 },
  thumb: { width: 64, height: 96, borderRadius: 8 },
  info: { justifyContent: 'center' },
  date: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  status: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
});
