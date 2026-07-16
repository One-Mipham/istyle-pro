import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';
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
  container: { flex: 1, backgroundColor: colors.bg },
  actions: { padding: spacing['2xl'], gap: spacing.md, alignItems: 'center' },
  primaryButton: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  primaryText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  secondaryButton: {
    width: '100%',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: { color: colors.text, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  homeLink: { color: colors.textTertiary, fontSize: fontSize.base, marginTop: spacing.sm },
  aiLabel: {
    position: 'absolute', top: spacing.md, right: spacing.md,
    backgroundColor: colors.primaryOverlay,
    paddingHorizontal: spacing.md - 2, paddingVertical: spacing.xs,
    borderRadius: 6, zIndex: 10,
  },
  aiLabelText: { color: colors.white, fontSize: fontSize.xs, fontWeight: fontWeight.bold },
});
