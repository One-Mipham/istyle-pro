import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';
import { api } from '../lib/api';
import { useQuota } from '../lib/quota';
import { GenerationProgress } from '../components/GenerationProgress';
import { POLL_INTERVAL_MS, GENERATION_TIMEOUT_MS } from '@istyle/shared';
import type { GenerateResponse, GenerationStatus } from '@istyle/shared';

export default function Generate() {
  const { photoUri, styles: styleParam } = useLocalSearchParams<{ photoUri: string; styles?: string }>();
  const [stage, setStage] = useState<GenerationStatus>('pending');
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [error, setError] = useState('');
  const taskIdRef = useRef<string | null>(null);
  const { decrement } = useQuota();

  useEffect(() => {
    submitAndPoll();
  }, []);

  async function submitAndPoll() {
    try {
      setStage('pending');
      const base64 = await FileSystem.readAsStringAsync(photoUri, { encoding: FileSystem.EncodingType.Base64 });
      const uploadRes = await api<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ base64, mimeType: 'image/jpeg' }),
      });

      const styleIds = styleParam ? styleParam.split(',') : ['style-0', 'style-1'];
      const generateRes = await api<GenerateResponse>('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ originalImageUrl: uploadRes.url, styleTemplateIds: styleIds }),
      });

      taskIdRef.current = generateRes.taskId;
      setStage('processing');

      const startTime = Date.now();
      while (Date.now() - startTime < GENERATION_TIMEOUT_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
        const pollRes = await api<{ status: GenerationStatus; resultImageUrl: string | null }>(`/api/generate/${taskIdRef.current}`);

        if (pollRes.status === 'completed' && pollRes.resultImageUrl) {
          setResultUri(pollRes.resultImageUrl);
          decrement();
          return;
        }

        if (pollRes.status === 'failed') {
          setError('生成失败，请重试');
          return;
        }
      }

      setError('生成超时，请重试');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
    }
  }

  if (resultUri) {
    return (
      <View style={s.container}>
        <Text style={s.title}>生成完成</Text>
        <Pressable style={s.button} onPress={() => router.replace({ pathname: '/result', params: { photoUri, resultUri } })}>
          <Text style={s.buttonText}>查看效果</Text>
        </Pressable>
      </View>
    );
  }

  const progressStage = stage === 'pending' ? 'uploading' : stage === 'processing' ? 'generating' : 'completed';

  return (
    <View style={s.container}>
      <Text style={s.title}>正在生成</Text>
      <GenerationProgress stage={progressStage} />
      {error ? (
        <View style={s.errorBox}>
          <Text style={s.error}>{error}</Text>
          <Pressable style={s.button} onPress={submitAndPoll}>
            <Text style={s.buttonText}>重试</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'], backgroundColor: colors.bg, gap: spacing['3xl'] },
  title: { fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, color: colors.text },
  errorBox: { alignItems: 'center', gap: spacing.lg },
  error: { color: colors.error, fontSize: fontSize.lg },
  button: { backgroundColor: colors.primary, paddingHorizontal: spacing['3xl'], paddingVertical: spacing.xl - 2, borderRadius: radius.lg },
  buttonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
});
