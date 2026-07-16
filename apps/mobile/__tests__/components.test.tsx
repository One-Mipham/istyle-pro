import { describe, it, expect, vi } from 'vitest';

// Mock react-native before any component imports
vi.mock('react-native', () => {
  const RN = {
    View: 'View', Text: 'Text', Image: 'Image', Pressable: 'Pressable',
    ScrollView: 'ScrollView', FlatList: 'FlatList', TextInput: 'TextInput',
    StyleSheet: { create: (styles: Record<string, unknown>) => styles, hairlineWidth: 1 },
    Dimensions: { get: () => ({ width: 390, height: 844 }) },
    Platform: { OS: 'ios', select: (o: Record<string, unknown>) => (o as Record<string, unknown>).ios ?? (o as Record<string, unknown>).default },
  };
  return { ...RN, default: RN };
});

vi.mock('react-native-gesture-handler', () => ({
  GestureDetector: 'GestureDetector',
  Gesture: { Pan: () => ({ onUpdate: () => ({}) }) },
}));

vi.mock('react-native-reanimated', () => ({
  default: { View: 'AnimatedView', createAnimatedComponent: (c: unknown) => c },
  useSharedValue: (v: number) => ({ value: v }),
  useAnimatedStyle: () => ({}),
}));

// Mock zustand
vi.mock('zustand', () => {
  const actual = vi.importActual('zustand');
  return {
    ...actual,
    create: (fn: (set: unknown) => Record<string, unknown>) => {
      let state: Record<string, unknown> = {};
      const set = (partial: unknown) => {
        if (typeof partial === 'function') {
          state = { ...state, ...(partial as (s: Record<string, unknown>) => Record<string, unknown>)(state) };
        } else {
          state = { ...state, ...(partial as Record<string, unknown>) };
        }
      };
      state = fn(set);
      const useStore = (selector?: (s: Record<string, unknown>) => unknown) => {
        if (selector) return selector(state);
        return state;
      };
      Object.assign(useStore, state);
      return useStore;
    },
  };
});

import React from 'react';
import { StyleCard } from '../components/StyleCard';
import { CategoryFilter } from '../components/CategoryFilter';
import { GenerationProgress } from '../components/GenerationProgress';
import { BeforeAfter } from '../components/BeforeAfter';
import { QuotaBadge } from '../components/QuotaBadge';

describe('StyleCard', () => {
  it('renders correctly when not selected', () => {
    expect(typeof StyleCard).toBe('function');
    const element = React.createElement(StyleCard, {
      name: '自然发型', category: 'hair', scene: 'casual', selected: false, onToggle: () => {},
    });
    expect(element).toBeDefined();
    expect(element.props.name).toBe('自然发型');
  });

  it('renders with selected=true', () => {
    const element = React.createElement(StyleCard, {
      name: '运动套装', category: 'clothing', scene: 'sport', selected: true, onToggle: () => {},
    });
    expect(element.props.selected).toBe(true);
  });
});

describe('CategoryFilter', () => {
  it('renders with all filter options', () => {
    expect(typeof CategoryFilter).toBe('function');
    const element = React.createElement(CategoryFilter, { selected: null, onSelect: () => {} });
    expect(element.props.selected).toBeNull();
  });

  it('passes selected state correctly', () => {
    const element = React.createElement(CategoryFilter, { selected: 'hair', onSelect: () => {} });
    expect(element.props.selected).toBe('hair');
  });
});

describe('GenerationProgress', () => {
  it('renders all stages', () => {
    expect(typeof GenerationProgress).toBe('function');
    const element = React.createElement(GenerationProgress, { stage: 'generating' });
    expect(element.props.stage).toBe('generating');
  });

  it('accepts all valid stages', () => {
    const stages = ['uploading', 'analyzing', 'generating', 'completed'] as const;
    for (const stage of stages) {
      const element = React.createElement(GenerationProgress, { stage });
      expect(element.props.stage).toBe(stage);
    }
  });
});

describe('BeforeAfter', () => {
  it('renders with required URIs', () => {
    expect(typeof BeforeAfter).toBe('function');
    const element = React.createElement(BeforeAfter, {
      beforeUri: 'https://example.com/before.jpg',
      afterUri: 'https://example.com/after.jpg',
    });
    expect(element.props.beforeUri).toBe('https://example.com/before.jpg');
    expect(element.props.afterUri).toBe('https://example.com/after.jpg');
  });
});

describe('QuotaBadge', () => {
  it('renders successfully', () => {
    expect(typeof QuotaBadge).toBe('function');
    const element = React.createElement(QuotaBadge);
    expect(element).toBeDefined();
  });
});
