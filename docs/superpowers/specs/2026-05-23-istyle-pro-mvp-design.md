# iStyle Pro — MVP 产品设计规格书

> **版本**: 1.0.0
> **日期**: 2026-05-23
> **作者**: One Mipham Corporation
> **状态**: 待审核

---

## 一、产品概述

### 1.1 产品定位

iStyle Pro（个人形象品牌设计专家）是 AI 驱动的虚拟试穿平台。用户上传全身照，选择发型、服装、鞋帽配饰，AI 实时生成逼真的形象变换效果图。

### 1.2 目标用户

不分性别、年龄、职业、人种的所有人。MVP 阶段不做人群限制，以覆盖面验证 PMF。

### 1.3 差异化

- 全人群覆盖 + 文化深度（全球民族服饰）
- 一站式四维搭配（发型 + 服装 + 鞋 + 配饰）
- AI 生成式拍照级真实感，非 3D 建模/贴图

---

## 二、技术架构

### 2.1 总览

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│   React Native/Expo  │────▶│  Fastify API Server  │────▶│   Replicate API      │
│   (iOS + Android)    │◀────│  (Node.js 22+)       │◀────│   (Virtual Try-On)   │
└──────────────────────┘     └──────────┬───────────┘     └──────────────────────┘
                                        │
                                        ▼
                               ┌──────────────────────┐
                               │      Supabase        │
                               │  Auth / DB / Storage │
                               └──────────────────────┘
```

### 2.2 选型说明

| 层级 | 技术 | 理由 |
|------|------|------|
| 前端 | Expo Router (React Native) | 一套代码 iOS+Android，快速迭代 |
| 后端 | Fastify (Node.js 22+) | 高性能、TypeScript、轻量 |
| AI 推理 | Replicate API | 托管虚拟试穿模型，零运维启动 |
| 数据存储 | Supabase | 自带 Auth + PostgreSQL + S3 存储 |
| 队列 | BullMQ + Redis | 异步任务处理（图片生成） |

### 2.3 演进路径

- **Phase 1 (MVP)**：全托管，Replicate API + Supabase，2-3 周上线
- **Phase 2 (验证 PMF 后)**：自建 ComfyUI 集群 + LoRA 微调，降低单位成本
- **Phase 3 (规模化)**：微服务拆分，GPU Worker 池化，全球 CDN

---

## 三、MVP 范围

### 3.1 MVP 包含

- 用户注册/登录（邮箱 + 第三方）
- 拍照上传全身照
- 1 种发型模板
- 3 种服装风格：休闲、职业、运动
- AI 生成效果图（单张）
- 结果保存到相册
- 每日免费 3 次生成

### 3.2 MVP 不包含

- 鞋帽配饰独立选择（MVP 中与服装绑定）
- 民族/文化服饰
- 社交分享
- 电商导购
- 高清导出（Pro 功能）

### 3.3 MVP 后第一迭代

场景聚焦：职业形象设计（发型 + 西装/投行精英/教师 + 皮鞋配饰）

---

## 四、用户流程

### 4.1 双入口设计

**入口 1：快速试穿**
```
拍照上传 → AI 分析体型肤色 → 推荐搭配 → 生成效果图
```

**入口 2：风格探索**
```
浏览模板库 → 选择搭配 → 拍照上传 → 生成效果图
```

### 4.2 完整用户旅程

```
App 启动
  ├── 引导页（3 屏：产品介绍 + 权限申请 + 档案填写）
  │     └── 填写：性别、年龄、身高、体重、偏好风格（可多选）
  ├── 首页
  │     ├── [快速试穿] 按钮 → 拍照 → AI 推荐 → 生成
  │     └── [风格探索] 按钮 → 分类浏览 → 选择 → 拍照 → 生成
  ├── 结果页
  │     ├── 效果图展示（对比模式：原图 vs 生成图）
  │     ├── 保存到相册
  │     ├── 换一个风格
  │     └── 分享（Phase 2）
  └── 我的
        ├── 历史记录
        ├── 档案编辑
        └── 订阅管理
```

---

## 五、数据模型

### 5.1 核心表

```sql
-- 用户档案
users (
  id uuid PK,
  email text UNIQUE,
  gender text,          -- male / female / other
  age int,
  height_cm int,
  weight_kg int,
  preferred_styles text[], -- ['casual', 'formal', 'sport']
  avatar_url text,
  created_at timestamptz
)

-- 风格模板（MVP 硬编码，后续管理后台编辑）
style_templates (
  id uuid PK,
  category text,        -- hair / clothing / shoes / hat
  scene text,           -- work / sport / casual / ceremony / daily
  style text,           -- formal / sport / casual / ethnic
  age_group text,       -- kids / teen / young / middle / senior
  name text,            -- 模板名称
  preview_url text,     -- 预览图
  prompt_extension text,-- Stable Diffusion 提示词片段
  sort_order int,
  is_active boolean
)

-- 生成历史
generation_history (
  id uuid PK,
  user_id uuid FK,
  original_image_url text,
  result_image_url text,
  style_template_ids uuid[],  -- 使用的模板 IDs
  status text,                -- pending / processing / completed / failed
  created_at timestamptz
)

-- 订阅记录
subscriptions (
  id uuid PK,
  user_id uuid FK,
  plan text,           -- free / pro_monthly / pro_yearly
  status text,         -- active / cancelled / expired
  daily_remaining int, -- 当日剩余生成次数
  started_at timestamptz,
  expires_at timestamptz
)
```

---

## 六、API 设计

### 6.1 核心端点

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册 + 创建档案 |
| POST | `/api/auth/login` | 登录 |
| GET | `/api/users/me` | 获取当前用户档案 |
| PATCH | `/api/users/me` | 更新档案 |
| GET | `/api/styles` | 获取风格模板列表（支持筛选） |
| POST | `/api/generate` | 提交生成任务（返回 taskId） |
| GET | `/api/generate/:taskId` | 查询任务状态/获取结果 |
| GET | `/api/history` | 获取生成历史 |
| POST | `/api/upload` | 上传照片 |

### 6.2 生成任务流程

```
POST /api/generate
  → 验证用户配额
  → 存储原图到 Supabase
  → 组装 prompt（基础 prompt + 风格 prompt_extension + 用户体型参数）
  → 提交 Replicate API
  → 创建 generation_history (status: pending)
  → 返回 taskId

后端轮询 / Webhook
  → Replicate 完成后回调
  → 下载结果图 → 上传 Supabase Storage
  → 更新 generation_history (status: completed)
  → 扣减用户配额

客户端轮询 GET /api/generate/:taskId
  → 每 2 秒检查一次
  → 获取结果图展示
```

---

## 七、前端组件树（MVP）

```
App (Expo Router)
├── app/
│   ├── onboarding.tsx           # 引导页
│   ├── (auth)/
│   │   ├── register.tsx         # 注册
│   │   └── login.tsx            # 登录
│   ├── (tabs)/
│   │   ├── index.tsx            # 首页（双入口）
│   │   ├── explore.tsx          # 风格探索（分类浏览）
│   │   ├── history.tsx          # 历史记录
│   │   └── profile.tsx          # 我的
│   ├── camera.tsx               # 拍照页
│   ├── generate.tsx             # 生成中（进度页）
│   └── result.tsx               # 结果页
├── components/
│   ├── StyleCard.tsx            # 风格卡片
│   ├── CategoryFilter.tsx       # 场景分类筛选器
│   ├── BeforeAfter.tsx          # 原图/生成图对比滑块
│   ├── QuotaBadge.tsx           # 剩余次数徽章
│   ├── ImageUploader.tsx        # 图片上传组件
│   └── GenerationProgress.tsx   # 生成进度动画
└── lib/
    ├── api.ts                   # API 客户端
    ├── auth.ts                  # Supabase Auth 封装
    ├── quota.ts                 # 配额管理
    └── storage.ts               # 图片本地缓存
```

---

## 八、错误处理策略

### 8.1 用户可见错误

| 场景 | 处理 |
|------|------|
| 拍照不清晰 | 提示"请拍摄光线充足、背景干净的全身照" |
| 生成超时 (>60s) | 显示"正在精心打造中，请稍候…"，超时后允许重试 |
| 配额用尽 | 展示 Pro 订阅引导页 |
| 网络断开 | 离线提示 + 自动重连后恢复 |
| Replicate API 故障 | 降级提示"服务繁忙，稍后重试"，不丢失用户任务 |

### 8.2 服务端错误

- Fastify 全局 error handler 统一 JSON 错误响应格式
- 生成任务失败时标记 `status: failed`，不扣配额
- BullMQ 任务重试 3 次，超过后进入 dead letter 队列
- 所有 API 错误记录到结构化日志（后续接 Sentry）

---

## 九、测试策略

### 9.1 MVP 阶段

- **单元测试**（Vitest）：API 路由 + 配额逻辑 + prompt 组装
- **组件测试**：关键组件（StyleCard, BeforeAfter, QuotaBadge）
- **E2E**：核心流程（注册 → 拍照 → 生成 → 保存）
- **手动测试**：AI 生成效果质量（不同体型/肤色/光线条件）

### 9.2 不覆盖

- 性能压力测试（MVP 阶段无规模需求）
- 多语言自动化测试（人工验证即可）

---

## 十、项目结构

```
iStyle-Pro/
├── apps/
│   ├── mobile/                 # Expo React Native App
│   └── api/                    # Fastify API Server
├── packages/
│   └── shared/                 # 共享类型、常量、工具
├── infrastructure/             # IaC（后续）
├── docs/
│   └── superpowers/
│       └── specs/              # 设计文档
└── .github/
    └── workflows/              # CI/CD
```

---

## 十一、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Replicate API 成本不可控 | 利润率 | 设定每周预算上限，达到后暂停服务并通知 |
| AI 生成效果不稳定 | 用户体验 | 精心调校 prompt + 限制输入照片质量要求 |
| 生成图片涉黄/不当内容 | 合规风险 | 输入/输出双重 NSFW 检测，不符合时拒绝生成 |
| 用户隐私（全身照） | 法律风险 | 图片存储加密，7 天自动删除原始上传照片 |
| App Store 审核 | 上线延迟 | 提前研究虚拟试穿类 App 审核案例 |

---

### 修订历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| 1.0.0 | 2026-05-23 | 初版：MVP 架构、用户流程、数据模型、API 设计 |
