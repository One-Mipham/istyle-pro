import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { BeforeAfter } from '../components/BeforeAfter';

export default function Result() {
  const { photoUri, resultUri } = useLocalSearchParams<{ photoUri: string; resultUri: string }>();

  async function saveToGallery() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要相册权限');
      return;
    }

    const localPath = FileSystem.cacheDirectory + `istyle-${Date.now()}.jpg`;
    await FileSystem.downloadAsync(resultUri!, localPath);
    await MediaLibrary.saveToLibraryAsync(localPath);
    Alert.alert('已保存到相册');
  }

  return (
    <View style={s.container}>
      <BeforeAfter beforeUri={photoUri!} afterUri={resultUri!} />
      <View style={s.aiLabel}>
        <Text style={s.aiLabelText}>AI Generated</Text>
      </View>
      <View style={s.actions}>
        <Pressable style={s.primaryButton} onPress={saveToGallery}>
          <Text style={s.primaryText}>保存到相册</Text>
        </Pressable>
        <Pressable style={s.secondaryButton} onPress={() => router.push('/explore')}>
          <Text style={s.secondaryText}>换一种风格</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={s.homeLink}>返回首页</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  actions: { padding: 24, gap: 12, alignItems: 'center' },
  primaryButton: { width: '100%', backgroundColor: '#6366F1', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButton: { width: '100%', backgroundColor: '#1E293B', paddingVertical: 16, borderRadius: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  secondaryText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  homeLink: { color: '#64748B', fontSize: 14, marginTop: 8 },
  aiLabel: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(99,102,241,0.9)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, zIndex: 10 },
  aiLabelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
