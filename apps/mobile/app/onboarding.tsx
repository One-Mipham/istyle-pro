import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight, common } from '@istyle/shared';

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [preferredStyles, setPreferredStyles] = useState<string[]>(['casual']);

  const toggleStyle = (s: string) => {
    setPreferredStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  if (step === 0) {
    return (
      <View style={s.container}>
        <Text style={s.title}>iStyle Pro</Text>
        <Text style={s.subtitle}>你的私人 AI 形象顾问</Text>
        <Text style={s.body}>拍照 → 30 秒 → 看到全新的自己</Text>
        <Pressable style={s.button} onPress={() => setStep(1)}>
          <Text style={s.buttonText}>开始</Text>
        </Pressable>
        <Pressable onPress={() => router.replace('/(tabs)')}>
          <Text style={s.skip}>跳过，先逛逛</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 1) {
    return (
      <ScrollView contentContainerStyle={s.scrollContainer}>
        <Text style={s.title}>完善档案</Text>
        <Text style={s.body}>帮助 AI 更懂你</Text>

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

        <Text style={s.label}>偏好风格（可多选）</Text>
        <View style={s.row}>
          {['casual', 'formal', 'sport'].map(style => (
            <Pressable key={style} style={[common.chip, preferredStyles.includes(style) && common.chipActive]} onPress={() => toggleStyle(style)}>
              <Text style={preferredStyles.includes(style) ? s.chipTextActive : s.chipText}>{style === 'casual' ? '休闲' : style === 'formal' ? '职业' : '运动'}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={s.button} onPress={() => setStep(2)}>
          <Text style={s.buttonText}>下一步</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>拍照权限</Text>
      <Text style={s.body}>iStyle Pro 需要访问相机来拍摄你的全身照</Text>
      <Pressable style={s.button} onPress={() => router.replace('/(tabs)')}>
        <Text style={s.buttonText}>允许并开始</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { ...common.screenCentered, gap: spacing.lg },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'], backgroundColor: colors.bg, gap: spacing.lg },
  title: { fontSize: fontSize['5xl'], fontWeight: fontWeight.bold, color: colors.text },
  subtitle: { fontSize: fontSize.xl, color: colors.textSecondary },
  body: { fontSize: fontSize.lg, color: '#CBD5E1', textAlign: 'center' },
  label: { fontSize: fontSize.base, color: colors.textSecondary, alignSelf: 'flex-start' },
  button: { backgroundColor: colors.primary, paddingHorizontal: spacing['3xl'], paddingVertical: spacing.xl - 2, borderRadius: radius.lg },
  buttonText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  skip: { color: colors.textTertiary, marginTop: spacing.md },
  input: { ...common.input, width: '100%' },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chipText: { color: colors.textSecondary },
  chipTextActive: { color: colors.white },
});
