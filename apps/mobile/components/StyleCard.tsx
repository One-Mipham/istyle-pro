import { View, Text, Pressable, StyleSheet } from 'react-native';

interface StyleCardProps {
  name: string;
  category: string;
  scene: string;
  selected: boolean;
  onToggle: () => void;
}

export function StyleCard({ name, category, scene, selected, onToggle }: StyleCardProps) {
  const sceneLabel = { work: '职业', sport: '运动', casual: '休闲' }[scene] ?? scene;
  const catLabel = { hair: '发型', clothing: '服装' }[category] ?? category;

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
  card: { width: '47%', backgroundColor: '#1E293B', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  cardSelected: { borderColor: '#6366F1' },
  preview: { height: 120, backgroundColor: '#334155', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  previewText: { fontSize: 48, color: '#94A3B8' },
  name: { color: '#F8FAFC', fontSize: 14, fontWeight: '600', marginTop: 8 },
  meta: { color: '#64748B', fontSize: 12, marginTop: 4 },
});
