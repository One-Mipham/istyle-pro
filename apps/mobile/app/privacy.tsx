import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>隐私政策 / Privacy Policy</Text>
      <Text style={s.date}>生效日期: 2026年5月24日</Text>

      <Text style={s.h2}>1. 我们收集的信息</Text>
      <Text style={s.p}>iStyle Pro 收集以下信息以提供 AI 虚拟试穿服务：</Text>
      <Text style={s.p}>- 邮箱地址（用于账号注册和登录）</Text>
      <Text style={s.p}>- 基本档案信息：性别、年龄、身高、体重、风格偏好（用于 AI 个性化推荐）</Text>
      <Text style={s.p}>- 您上传的全身照片（用于 AI 生成效果图）</Text>
      <Text style={s.p}>- 相机权限（仅用于拍摄试穿照片）</Text>

      <Text style={s.h2}>2. 数据存储与安全</Text>
      <Text style={s.p}>- 所有数据加密存储于 Supabase 云服务 (TLS 1.3 + AES-256-GCM)</Text>
      <Text style={s.p}>- 您的密码使用行业标准哈希算法保护</Text>
      <Text style={s.p}>- 原始上传照片将在 7 天后自动删除</Text>
      <Text style={s.p}>- 我们不会出售、分享或以其他方式向第三方提供您的个人信息</Text>

      <Text style={s.h2}>3. AI 生成内容</Text>
      <Text style={s.p}>- AI 生成的图像由第三方服务 Replicate 处理</Text>
      <Text style={s.p}>- 生成过程仅传输必要的图像数据</Text>
      <Text style={s.p}>- 所有 AI 生成的结果图像均标记为 AI 生成内容</Text>

      <Text style={s.h2}>4. 用户权利</Text>
      <Text style={s.p}>- 您可以随时请求导出或删除您的所有数据</Text>
      <Text style={s.p}>- 您可以通过注销账号来删除账户及相关数据</Text>
      <Text style={s.p}>- 如需数据删除请求，请联系: privacy@istyle.app</Text>

      <Text style={s.h2}>5. 儿童隐私</Text>
      <Text style={s.p}>- 本服务不面向 13 岁以下儿童</Text>
      <Text style={s.p}>- 如发现误收集了儿童数据，将立即删除</Text>

      <Text style={s.h2}>6. 联系我们</Text>
      <Text style={s.p}>隐私相关咨询: privacy@istyle.app</Text>
      <Text style={s.p}>One Mipham Corporation (北京华安麦逄科技有限公司)</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#0F172A', gap: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#F8FAFC', marginBottom: 4 },
  date: { fontSize: 13, color: '#64748B', marginBottom: 12 },
  h2: { fontSize: 18, fontWeight: '600', color: '#E2E8F0', marginTop: 16 },
  p: { fontSize: 15, color: '#94A3B8', lineHeight: 22 },
});
