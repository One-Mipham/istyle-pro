import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface BeforeAfterProps {
  beforeUri: string;
  afterUri: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function BeforeAfter({ beforeUri, afterUri }: BeforeAfterProps) {
  const sliderX = useSharedValue(SCREEN_WIDTH / 2);

  const pan = Gesture.Pan().onUpdate((e) => {
    sliderX.value = Math.max(0, Math.min(SCREEN_WIDTH, e.absoluteX));
  });

  const afterStyle = useAnimatedStyle(() => ({
    width: sliderX.value,
    overflow: 'hidden' as const,
  }));

  return (
    <View style={styles.container}>
      <Image source={{ uri: beforeUri }} style={styles.image} />
      <Animated.View style={[styles.overlay, afterStyle]}>
        <Image source={{ uri: afterUri }} style={styles.image} />
      </Animated.View>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.handle, { left: sliderX.value - 2 }]} />
      </GestureDetector>
      <View style={styles.labels}>
        <Text style={styles.label}>Before</Text>
        <Text style={styles.label}>After</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, height: SCREEN_WIDTH * 1.3, position: 'relative' },
  image: { width: SCREEN_WIDTH, height: '100%', resizeMode: 'cover' },
  overlay: { position: 'absolute', top: 0, left: 0, height: '100%' },
  handle: { position: 'absolute', top: 0, width: 4, height: '100%', backgroundColor: '#fff' },
  labels: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24 },
  label: { color: '#fff', fontSize: 14, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, overflow: 'hidden' },
});
