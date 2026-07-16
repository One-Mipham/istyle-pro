import { Tabs } from 'expo-router';
import { colors } from '@istyle/shared';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.surface },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textTertiary,
    }}>
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="explore" options={{ title: '探索' }} />
      <Tabs.Screen name="history" options={{ title: '历史' }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}
