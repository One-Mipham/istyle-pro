import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Test the validation schemas used in auth routes
// These are the same schemas copied from the route file for test validation

const PASSWORD_REGEX = /^\d{8}$/;
const PASSWORD_MESSAGE = 'Password must be 8 digits (e.g., birthdate 20001231)';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().int().min(1).max(120),
  heightCm: z.number().int().min(50).max(250),
  weightKg: z.number().int().min(10).max(300),
  preferredStyles: z.array(z.enum(['casual', 'formal', 'sport'])).min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

const generateSchema = z.object({
  originalImageUrl: z.string().url(),
  styleTemplateIds: z.array(z.string()).min(1),
});

const uploadSchema = z.object({
  base64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

describe('auth validation schemas', () => {
  describe('registerSchema', () => {
    it('accepts a valid registration', () => {
      const result = registerSchema.safeParse({
        email: 'user@example.com',
        password: '20001231',
        gender: 'female',
        age: 25,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: ['casual'],
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: '20001231',
        gender: 'male',
        age: 25,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: ['casual'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects password that is not exactly 8 digits', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: 'short',
        gender: 'male',
        age: 25,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: ['casual'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects age below 1', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '20001231',
        gender: 'male',
        age: 0,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: ['casual'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects age above 120', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '20001231',
        gender: 'male',
        age: 121,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: ['casual'],
      });
      expect(result.success).toBe(false);
    });

    it('rejects empty preferredStyles', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '20001231',
        gender: 'male',
        age: 25,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: [],
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid gender', () => {
      const result = registerSchema.safeParse({
        email: 'a@b.com',
        password: '20001231',
        gender: 'unknown',
        age: 25,
        heightCm: 170,
        weightKg: 60,
        preferredStyles: ['casual'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: 'anything' }).success).toBe(true);
    });

    it('rejects empty password', () => {
      expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
    });

    it('rejects invalid email', () => {
      expect(loginSchema.safeParse({ email: 'not-email', password: 'x' }).success).toBe(false);
    });
  });

  describe('resetSchema', () => {
    it('accepts valid reset', () => {
      expect(resetSchema.safeParse({ email: 'a@b.com', newPassword: '20001231' }).success).toBe(true);
    });

    it('rejects weak new password', () => {
      expect(resetSchema.safeParse({ email: 'a@b.com', newPassword: '123' }).success).toBe(false);
    });
  });

  describe('generateSchema', () => {
    it('accepts valid generate request', () => {
      expect(
        generateSchema.safeParse({
          originalImageUrl: 'https://example.com/photo.jpg',
          styleTemplateIds: ['style-0'],
        }).success,
      ).toBe(true);
    });

    it('rejects non-URL originalImageUrl', () => {
      expect(
        generateSchema.safeParse({
          originalImageUrl: 'not-a-url',
          styleTemplateIds: ['style-0'],
        }).success,
      ).toBe(false);
    });

    it('rejects empty styleTemplateIds', () => {
      expect(
        generateSchema.safeParse({
          originalImageUrl: 'https://example.com/photo.jpg',
          styleTemplateIds: [],
        }).success,
      ).toBe(false);
    });
  });

  describe('uploadSchema', () => {
    it('accepts valid upload', () => {
      expect(
        uploadSchema.safeParse({
          base64: 'aGVsbG8=',
          mimeType: 'image/jpeg',
        }).success,
      ).toBe(true);
    });

    it('rejects empty base64', () => {
      expect(uploadSchema.safeParse({ base64: '', mimeType: 'image/png' }).success).toBe(false);
    });

    it('rejects unsupported mime type', () => {
      expect(uploadSchema.safeParse({ base64: 'aGVsbG8=', mimeType: 'image/gif' }).success).toBe(false);
    });
  });
});
