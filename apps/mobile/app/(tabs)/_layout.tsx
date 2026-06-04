import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: '#0F172A' },
      headerTintColor: '#F8FAFC',
      tabBarStyle: { backgroundColor: '#0F172A', borderTopColor: '#1E293B' },
      tabBarActiveTintColor: '#6366F1',
      tabBarInactiveTintColor: '#64748B',
    }}>
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="explore" options={{ title: '探索' }} />
      <Tabs.Screen name="history" options={{ title: '历史' }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}
