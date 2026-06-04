import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.email?.[0]?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={s.email}>{user?.email ?? '未登录'}</Text>
      </View>

      {user && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>档案</Text>
          <View style={s.row}>
            <Text style={s.label}>性别</Text>
            <Text style={s.value}>{user.gender === 'male' ? '男' : user.gender === 'female' ? '女' : '其他'}</Text>
          </View>
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionTitle}>订阅</Text>
        <Text style={s.plan}>Free 计划 · 每日 3 次免费生成</Text>
        <Pressable style={s.upgradeButton}>
          <Text style={s.upgradeText}>升级到 Pro</Text>
        </Pressable>
      </View>

      <View style={s.section}>
        <Pressable onPress={() => router.push('/privacy')}>
          <Text style={s.link}>隐私政策</Text>
        </Pressable>
        <View style={s.divider} />
        <Pressable onPress={() => router.push('/terms')}>
          <Text style={s.link}>服务条款</Text>
        </Pressable>
        <View style={s.divider} />
        <Pressable onPress={() => Linking.openURL('mailto:privacy@istyle.app')}>
          <Text style={s.link}>联系我们</Text>
        </Pressable>
      </View>

      {user ? (
        <Pressable style={s.logoutButton} onPress={() => { logout(); router.replace('/onboarding'); }}>
          <Text style={s.logoutText}>退出登录</Text>
        </Pressable>
      ) : (
        <Pressable style={s.loginButton} onPress={() => router.push('/(auth)/login')}>
          <Text style={s.loginText}>登录/注册</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, gap: 24 },
  header: { alignItems: 'center', gap: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  email: { color: '#F8FAFC', fontSize: 18 },
  section: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, gap: 10 },
  sectionTitle: { color: '#94A3B8', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#94A3B8' },
  value: { color: '#F8FAFC' },
  plan: { color: '#F8FAFC', fontSize: 16 },
  upgradeButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  upgradeText: { color: '#fff', fontWeight: '600' },
  loginButton: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  logoutButton: { alignItems: 'center', paddingVertical: 14 },
  logoutText: { color: '#EF4444', fontSize: 16 },
  link: { color: '#6366F1', fontSize: 16, paddingVertical: 4 },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 4 },
});
