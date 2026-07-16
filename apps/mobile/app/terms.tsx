import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '@istyle/shared';

export default function TermsOfService() {
  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>服务条款 / Terms of Service</Text>
      <Text style={s.date}>生效日期: 2026年5月24日</Text>

      <Text style={s.h2}>1. 服务说明</Text>
      <Text style={s.p}>iStyle Pro 是由 One Mipham Corporation (北京华安麦逄科技有限公司) 提供的 AI 虚拟试穿服务。使用本服务即表示您同意以下条款。</Text>

      <Text style={s.h2}>2. 账号注册</Text>
      <Text style={s.p}>- 您需提供有效的电子邮箱和基本档案信息来创建账号</Text>
      <Text style={s.p}>- 您应对账号下的所有活动负责</Text>
      <Text style={s.p}>- 密码使用 8 位数字格式，可随时通过注册邮箱重置</Text>

      <Text style={s.h2}>3. 使用规则</Text>
      <Text style={s.p}>- 免费用户每日可生成 3 次 AI 效果图</Text>
      <Text style={s.p}>- 您上传的照片必须为您本人的合法照片</Text>
      <Text style={s.p}>- 禁止上传色情、暴力或侵权内容</Text>
      <Text style={s.p}>- 禁止反向工程或滥用 API</Text>

      <Text style={s.h2}>4. AI 生成免责声明</Text>
      <Text style={s.p}>- AI 生成的效果图为计算机生成内容，仅供参考</Text>
      <Text style={s.p}>- 我们不保证生成结果的准确性或适用性</Text>
      <Text style={s.p}>- 所有 AI 生成内容均标注为 AI 生成</Text>

      <Text style={s.h2}>5. 知识产权</Text>
      <Text style={s.p}>- iStyle Pro 及其品牌归 One Mipham Corporation 所有</Text>
      <Text style={s.p}>- 您保留上传照片的所有权</Text>
      <Text style={s.p}>- AI 生成的结果图像归您所有，可用于个人用途</Text>

      <Text style={s.h2}>6. 服务变更与终止</Text>
      <Text style={s.p}>- 我们保留随时修改或终止服务的权利</Text>
      <Text style={s.p}>- 如终止服务，将提前通过邮件通知</Text>
      <Text style={s.p}>- 违反使用规则可能导致账号被暂停</Text>

      <Text style={s.h2}>7. 免责条款</Text>
      <Text style={s.p}>- 本服务按"现状"提供，不作任何明示或默示保证</Text>
      <Text style={s.p}>- 对于因使用本服务产生的任何损失，我们不承担责任</Text>

      <Text style={s.h2}>8. 联系我们</Text>
      <Text style={s.p}>法律相关咨询: legal@istyle.app</Text>
      <Text style={s.p}>One Mipham Corporation (北京华安麦逄科技有限公司)</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: spacing['2xl'], backgroundColor: colors.bg, gap: spacing.md },
  title: { fontSize: fontSize['4xl'], fontWeight: fontWeight.bold, color: colors.text, marginBottom: spacing.xs },
  date: { fontSize: fontSize.sm + 1, color: colors.textTertiary, marginBottom: spacing.md },
  h2: { fontSize: fontSize.xl, fontWeight: fontWeight.semibold, color: '#E2E8F0', marginTop: spacing.lg },
  p: { fontSize: fontSize.base + 1, color: colors.textSecondary, lineHeight: 22 },
});
