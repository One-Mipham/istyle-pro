// ── iStyle Pro Design Tokens ──
// Single source of truth for all visual constants.
// Import from '@istyle/shared' in both api (if needed) and mobile.

// ── Palette ──
export const colors = {
  /** Main screen background — deep navy */
  bg: '#0F172A',
  /** Card, input, and elevated surface */
  surface: '#1E293B',
  /** Subtle borders and dividers */
  border: '#334155',
  /** Primary action color — indigo */
  primary: '#6366F1',
  /** Light variant for hints on primary backgrounds */
  primaryLight: '#C7D2FE',
  /** Primary text on dark backgrounds */
  text: '#F8FAFC',
  /** Secondary / label text */
  textSecondary: '#94A3B8',
  /** Tertiary / muted text */
  textTertiary: '#64748B',
  /** Error / destructive */
  error: '#EF4444',
  /** Success / confirmation */
  success: '#22C55E',
  /** Pure white */
  white: '#FFFFFF',
  /** Semi-transparent overlays */
  overlay: 'rgba(0,0,0,0.5)',
  /** Primary badge with opacity */
  primaryOverlay: 'rgba(99,102,241,0.9)',
} as const;

// ── Spacing (4px grid) ──
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

// ── Border Radius ──
export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 16,
  pill: 20,
  circle: 9999,
} as const;

// ── Typography ──
export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
  '4xl': 24,
  '5xl': 28,
  '6xl': 32,
  '7xl': 48,
} as const;

export const fontWeight = {
  normal: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// ── Common composite styles (used across screens) ──
export const common = {
  /** Full-screen dark container */
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  } as const,
  /** Centered screen variant */
  screenCentered: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.bg,
  } as const,
  /** Standard text input */
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg - 2, // 14
    color: colors.text,
    fontSize: fontSize.lg,
  } as const,
  /** Primary CTA button */
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg - 2, // 14
    borderRadius: radius.lg,
    alignItems: 'center' as const,
  } as const,
  /** Secondary outline button */
  buttonSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg - 2, // 14
    borderRadius: radius.lg,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
  } as const,
  /** Primary button text */
  buttonTextPrimary: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  } as const,
  /** Secondary button text */
  buttonTextSecondary: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  } as const,
  /** Chip/tag (unselected) */
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  } as const,
  /** Chip/tag (selected) */
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  } as const,
  /** Section title */
  sectionTitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  } as const,
  /** Nav link (colored, centered) */
  link: {
    color: colors.primary,
    textAlign: 'center' as const,
  } as const,
  /** Error text */
  errorText: {
    color: colors.error,
    textAlign: 'center' as const,
  } as const,
  /** Screen title */
  screenTitle: {
    fontSize: fontSize['5xl'],
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center' as const,
  } as const,
  /** Standard padding wrapper */
  padded: {
    padding: spacing['2xl'],
  } as const,
} as const;

// ── Helper: create a StyleSheet-friendly object ──
/** Spread multiple common styles into one object (shallow merge, last wins). */
export function compose(...styles: Array<Record<string, unknown>>): Record<string, unknown> {
  return Object.assign({}, ...styles);
}
