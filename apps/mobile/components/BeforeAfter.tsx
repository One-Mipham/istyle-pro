import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';

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
  handle: { position: 'absolute', top: 0, width: spacing.xs, height: '100%', backgroundColor: colors.white },
  labels: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing['2xl'],
  },
  label: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
});
