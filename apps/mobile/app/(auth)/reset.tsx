import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
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
      <TextInput style={s.input} placeholder="注册邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor="#64748B" />
      <TextInput style={s.input} placeholder="新密码 (8位数字)" keyboardType="numeric" secureTextEntry maxLength={8} value={newPassword} onChangeText={setNewPassword} placeholderTextColor="#64748B" />
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
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0F172A', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8FAFC', textAlign: 'center' },
  hint: { fontSize: 14, color: '#94A3B8', textAlign: 'center' },
  error: { color: '#EF4444', textAlign: 'center' },
  input: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16 },
  button: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366F1', textAlign: 'center' },
});
