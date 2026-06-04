import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  async function handleLogin() {
    try {
      setError('');
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>登录</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TextInput style={s.input} placeholder="邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor="#64748B" />
      <TextInput style={s.input} placeholder="密码" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor="#64748B" />
      <Pressable style={s.button} onPress={handleLogin}>
        <Text style={s.buttonText}>登录</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/reset')}>
        <Text style={s.link}>忘记密码？</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text style={s.link}>没有账号？注册</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#0F172A', gap: 16 },
  title: { fontSize: 28, fontWeight: '700', color: '#F8FAFC', textAlign: 'center' },
  error: { color: '#EF4444', textAlign: 'center' },
  input: { backgroundColor: '#1E293B', borderRadius: 10, padding: 14, color: '#F8FAFC', fontSize: 16 },
  button: { backgroundColor: '#6366F1', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#6366F1', textAlign: 'center', marginTop: 8 },
});
