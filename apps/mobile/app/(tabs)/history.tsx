import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';
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
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  emptyText: { color: colors.textSecondary, fontSize: fontSize.xl },
  emptyHint: { color: colors.textTertiary, fontSize: fontSize.base },
  list: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  thumb: { width: 64, height: 96, borderRadius: radius.sm },
  info: { justifyContent: 'center' },
  date: { color: colors.text, fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  status: { color: colors.textSecondary, fontSize: fontSize.sm, marginTop: spacing.xs },
});
