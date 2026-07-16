import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight, common } from '@istyle/shared';
import { api } from '../../lib/api';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleReset() {
    try {
      setError('');
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      });
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    }
  }

  if (done) {
    return (
      <View style={s.container}>
        <Text style={s.title}>已重置</Text>
        <Text style={s.hint}>如果邮箱存在，密码已更新。</Text>
        <Pressable style={s.button} onPress={() => router.replace('/(auth)/login')}>
          <Text style={s.buttonText}>返回登录</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>重置密码</Text>
      <Text style={s.hint}>输入注册邮箱和新密码即可重置</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TextInput style={s.input} placeholder="注册邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor={colors.textTertiary} />
      <TextInput style={s.input} placeholder="新密码 (8位数字)" keyboardType="numeric" secureTextEntry maxLength={8} value={newPassword} onChangeText={setNewPassword} placeholderTextColor={colors.textTertiary} />
      <Pressable style={s.button} onPress={handleReset}>
        <Text style={s.buttonText}>重置密码</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={s.link}>返回登录</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { ...common.screenCentered, padding: spacing['2xl'], gap: spacing.lg },
  title: { ...common.screenTitle },
  hint: { fontSize: fontSize.base, color: colors.textSecondary, textAlign: 'center' },
  error: { ...common.errorText },
  input: { ...common.input },
  button: { ...common.buttonPrimary },
  buttonText: { ...common.buttonTextPrimary },
  link: { ...common.link },
});
