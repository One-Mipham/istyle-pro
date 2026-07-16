// ── User ──
export interface UserProfile {
  id: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  preferredStyles: StyleCategory[];
  avatarUrl: string | null;
  createdAt: string;
}

// ── Style Templates ──
export type StyleCategory = 'hair' | 'clothing' | 'shoes' | 'hat';
export type Scene = 'work' | 'sport' | 'casual' | 'ceremony' | 'daily';
export type AgeGroup = 'kids' | 'teen' | 'young' | 'middle' | 'senior';

export interface StyleTemplate {
  id: string;
  category: StyleCategory;
  scene: Scene;
  style: string;
  ageGroup: AgeGroup;
  name: string;
  previewUrl: string;
  sortOrder: number;
  isActive: boolean;
}

// ── Generations ──
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface GenerationRecord {
  id: string;
  userId: string;
  originalImageUrl: string;
  resultImageUrl: string | null;
  styleTemplateIds: string[];
  status: GenerationStatus;
  createdAt: string;
}

export interface GenerateRequest {
  originalImageUrl: string;
  styleTemplateIds: string[];
}

export interface GenerateResponse {
  taskId: string;
  status: GenerationStatus;
}

// ── Subscription ──
export type PlanTier = 'free' | 'pro_monthly' | 'pro_yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  dailyRemaining: number;
  startedAt: string;
  expiresAt: string | null;
}

// ── API ──
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
