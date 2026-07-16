import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '@istyle/shared';
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
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing['2xl'], gap: spacing['2xl'] },
  header: { alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: colors.white, fontSize: fontSize['5xl'], fontWeight: fontWeight.bold },
  email: { color: colors.text, fontSize: fontSize.xl },
  section: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  sectionTitle: { color: colors.textSecondary, fontSize: fontSize.base },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: colors.textSecondary },
  value: { color: colors.text },
  plan: { color: colors.text, fontSize: fontSize.lg },
  upgradeButton: {
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  upgradeText: { color: colors.white, fontWeight: fontWeight.semibold },
  loginButton: { ...{
    backgroundColor: colors.primary,
    paddingVertical: spacing.xl - 2,
    borderRadius: radius.lg,
    alignItems: 'center',
  }},
  loginText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  logoutButton: { alignItems: 'center', paddingVertical: spacing.xl - 2 },
  logoutText: { color: colors.error, fontSize: fontSize.lg },
  link: { color: colors.primary, fontSize: fontSize.lg, paddingVertical: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
});
