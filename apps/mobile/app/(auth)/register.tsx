import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight, common } from '@istyle/shared';
import { useAuth } from '../../lib/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>(['casual']);
  const [error, setError] = useState('');
  const { register, login } = useAuth();

  const toggleStyle = (style: string) => {
    setPreferredStyles(prev => prev.includes(style) ? prev.filter(x => x !== style) : [...prev, style]);
  };

  async function handleRegister() {
    try {
      setError('');
      await register({ email, password, gender, age: Number(age), heightCm: Number(heightCm), weightKg: Number(weightKg), preferredStyles: preferredStyles as Array<'casual' | 'formal' | 'sport'> });
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    }
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>注册</Text>
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TextInput style={s.input} placeholder="邮箱" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} placeholderTextColor={colors.textTertiary} />
      <TextInput style={s.input} placeholder="8位数字(生日如20001231)" keyboardType="numeric" secureTextEntry maxLength={8} value={password} onChangeText={setPassword} placeholderTextColor={colors.textTertiary} />

      <View style={s.row}>
        {(['male', 'female', 'other'] as const).map(g => (
          <Pressable key={g} style={[common.chip, gender === g && common.chipActive]} onPress={() => setGender(g)}>
            <Text style={gender === g ? s.chipTextActive : s.chipText}>{g === 'male' ? '男' : g === 'female' ? '女' : '其他'}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput style={s.input} placeholder="年龄" keyboardType="numeric" value={age} onChangeText={setAge} placeholderTextColor={colors.textTertiary} />
      <TextInput style={s.input} placeholder="身高 (cm)" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} placeholderTextColor={colors.textTertiary} />
      <TextInput style={s.input} placeholder="体重 (kg)" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} placeholderTextColor={colors.textTertiary} />

      <Text style={s.label}>偏好风格</Text>
      <View style={s.row}>
        {['casual', 'formal', 'sport'].map(style => (
          <Pressable key={style} style={[common.chip, preferredStyles.includes(style) && common.chipActive]} onPress={() => toggleStyle(style)}>
            <Text style={preferredStyles.includes(style) ? s.chipTextActive : s.chipText}>{style === 'casual' ? '休闲' : style === 'formal' ? '职业' : '运动'}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={s.button} onPress={handleRegister}>
        <Text style={s.buttonText}>注册</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={s.link}>已有账号？登录</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: spacing['2xl'], backgroundColor: colors.bg, gap: spacing.xl - 2 },
  title: { ...common.screenTitle },
  error: { ...common.errorText },
  input: { ...common.input },
  label: { fontSize: fontSize.base, color: colors.textSecondary },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chipText: { color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  button: { ...common.buttonPrimary },
  buttonText: { ...common.buttonTextPrimary },
  link: { ...common.link },
});
