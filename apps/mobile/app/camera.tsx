import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  if (!permission) return <View style={s.container} />;
  if (!permission.granted) {
    return (
      <View style={s.container}>
        <Text style={s.title}>需要相机权限</Text>
        <Pressable style={s.button} onPress={requestPermission}>
          <Text style={s.buttonText}>授权相机</Text>
        </Pressable>
      </View>
    );
  }

  async function takePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
    if (photo?.uri) setPhotoUri(photo.uri);
  }

  if (photoUri) {
    return (
      <View style={s.container}>
        <Text style={s.title}>照片已拍摄</Text>
        <Text style={s.body}>请确认这是清晰的全身照</Text>
        <Pressable style={s.button} onPress={() => router.push({ pathname: '/generate', params: { photoUri, source: 'quick' } })}>
          <Text style={s.buttonText}>确认，开始生成</Text>
        </Pressable>
        <Pressable onPress={() => setPhotoUri(null)}>
          <Text style={s.retake}>重拍</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <CameraView ref={cameraRef} style={s.camera} facing="back">
        <View style={s.overlay}>
          <Text style={s.guide}>请站立在明亮处，拍摄全身照</Text>
        </View>
      </CameraView>
      <Pressable style={s.captureButton} onPress={takePhoto}>
        <View style={s.captureInner} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, gap: spacing.xl },
  title: { fontSize: fontSize['3xl'], fontWeight: fontWeight.bold, color: colors.text },
  body: { fontSize: fontSize.lg, color: colors.textSecondary, textAlign: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: {
    position: 'absolute', top: 60, left: spacing['2xl'], right: spacing['2xl'],
    backgroundColor: colors.overlay, padding: spacing.lg, borderRadius: radius.lg,
  },
  guide: { color: colors.white, fontSize: fontSize.lg, textAlign: 'center' },
  captureButton: {
    position: 'absolute', bottom: 60, width: 72, height: 72, borderRadius: 36,
    borderWidth: spacing.xs, borderColor: colors.white, justifyContent: 'center', alignItems: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white },
  button: { backgroundColor: colors.primary, paddingHorizontal: spacing['3xl'], paddingVertical: spacing.xl - 2, borderRadius: radius.lg },
  buttonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  retake: { color: colors.textTertiary, fontSize: fontSize.lg },
});
