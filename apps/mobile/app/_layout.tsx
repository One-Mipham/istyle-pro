import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="generate" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
