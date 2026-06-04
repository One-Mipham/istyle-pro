import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', gap: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#F8FAFC' },
  body: { fontSize: 16, color: '#94A3B8', textAlign: 'center' },
  camera: { flex: 1, width: '100%' },
  overlay: { position: 'absolute', top: 60, left: 24, right: 24, backgroundColor: 'rgba(0,0,0,0.5)', padding: 16, borderRadius: 12 },
  guide: { color: '#fff', fontSize: 16, textAlign: 'center' },
  captureButton: { position: 'absolute', bottom: 60, width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  button: { backgroundColor: '#6366F1', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  retake: { color: '#64748B', fontSize: 16 },
});
