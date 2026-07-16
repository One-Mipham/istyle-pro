import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight, common } from '@istyle/shared';
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
      <TextInput style={s.input} placeholder="邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor={colors.textTertiary} />
      <TextInput style={s.input} placeholder="密码" secureTextEntry value={password} onChangeText={setPassword} placeholderTextColor={colors.textTertiary} />
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
  container: { ...common.screenCentered, padding: spacing['2xl'], gap: spacing.lg },
  title: { ...common.screenTitle },
  error: { ...common.errorText },
  input: { ...common.input },
  button: { ...common.buttonPrimary },
  buttonText: { ...common.buttonTextPrimary },
  link: { ...common.link, marginTop: spacing.sm },
});
