# Design System Guide

## Overview

The Gifted Minds design system provides level-based theming, responsive components, and consistent visual language across all platforms. It supports 5 level themes with power surge effects.

## Level-Based Theming

### Theme Levels
```typescript
const LEVELS = [
  { name: 'Seeker', color: '#1A202C' },     // Level 0: Dark, professional
  { name: 'Learner', color: '#1E90FF' },    // Level 1: Blue, trustworthy
  { name: 'Thinker', color: '#FFD700' },    // Level 2: Yellow, energetic
  { name: 'Creator', color: '#FF69B4' },    // Level 3: Pink, creative
  { name: 'Visionary', color: '#32CD32' }   // Level 4: Green, mastery
];
```

### Power Surge Theming
```typescript
// Circular progression during power surge
const effectiveThemeLevel = isInPowerSurge && currentPowerLevel > 1
  ? (levelIndex + 1) % LEVELS.length  // 4→0, 0→1, 1→2, 2→3, 3→4
  : levelIndex;
```

## Design Tokens

### Colors
```typescript
colors = {
  text: {
    white: '#ffffff',                 // High contrast
    primary: '#e8eaed',              // Standard text
    disabled: 'rgba(255,255,255,0.4)' // Disabled state
  },
  components: {
    background: 'rgba(0,0,0,0.4)'    // Uniform backgrounds
  },
  semantic: {
    success: '#48BB78',              // Success states
    error: '#F56565',                // Error states
    warning: '#ED8936'               // Warning states
  }
};
```

### Spacing
```typescript
spacing = {
  xs: 4,      // 4px
  sm: 8,      // 8px
  md: 16,     // 16px ← Most common
  lg: 24,     // 24px ← Most common
  xl: 32,     // 32px
  xxl: 48,    // 48px
  xxxl: 64    // 64px
};
```

### Typography
```typescript
typography = {
  fontSize: {
    sm: 14,     // 14px
    md: 16,     // 16px ← Standard
    lg: 18,     // 18px ← Buttons
    xl: 20,     // 20px ← Headings
    xxl: 24     // 24px ← Large headings
  },
  fontWeight: {
    normal: '400',
    medium: '500',    // ← Most common
    semibold: '600',
    bold: '700'
  }
};
```

## Component Styles

### Buttons
```typescript
// Primary buttons
buttonStyles.primary(levelIndex, 'default')
buttonStyles.primary(levelIndex, 'pressed')
buttonStyles.primary(levelIndex, 'disabled')

// Option buttons (A/B/C/D)
buttonStyles.option(levelIndex, 'default')
buttonStyles.option(levelIndex, 'correct')
buttonStyles.option(levelIndex, 'incorrect')
buttonStyles.option(levelIndex, 'power')
```

### Cards
```typescript
// Status cards (top bar)
cardStyles.status(levelIndex)

// Metric cards (score display)
cardStyles.metric(levelIndex)

// Content cards (general containers)
cardStyles.content(levelIndex)
```

### Layout
```typescript
// Screen layouts with gradients
layoutStyles.screen(levelIndex)

// Section layouts with spacing
layoutStyles.section(levelIndex)

// Puzzle-specific layouts
contentStyles.puzzle(levelIndex)
contentStyles.grid(levelIndex)
contentStyles.options(levelIndex)
```

## Usage Patterns

### Level-Aware Components
```typescript
interface ComponentProps {
  levelIndex?: number;  // 0-4, theme level
  variant?: string;     // Component-specific variants
  state?: ComponentState; // 'default' | 'pressed' | 'disabled'
}

const MyComponent: React.FC<ComponentProps> = ({ levelIndex = 0 }) => {
  const styles = buttonStyles.primary(levelIndex);

  return (
    <Pressable style={styles.container}>
      <Text style={styles.text}>Button</Text>
    </Pressable>
  );
};
```

### Style Composition
```typescript
// Combine design system with custom styles
<View style={[
  layoutStyles.section(levelIndex),
  { marginTop: spacing.lg }
]}>
  <Text style={[
    styles.text,
    { color: colors.semantic.success }
  ]}>
    Success Message
  </Text>
</View>
```

## Accessibility

### Touch Targets
```typescript
accessibility = {
  minTouchTarget: 44,           // iOS minimum
  minAndroidTouchTarget: 48,    // Android minimum
  minTouchTargetSpacing: 8      // Minimum gap
};

// Applied in all interactive components
style = {
  minHeight: accessibility.minTouchTarget,
  minWidth: accessibility.minTouchTarget
};
```

### Screen Reader Support
```typescript
<Pressable
  accessibilityRole="button"
  accessibilityLabel="Option A: First answer choice"
  accessibilityHint="Select this answer"
  accessibilityState={{ selected: isSelected }}
>
  <Text>Option A</Text>
</Pressable>
```

## Responsive Design

### Platform Adaptations
- **iOS**: Native iOS styling and interactions
- **Android**: Material Design principles
- **Web**: Progressive web app optimizations

### Breakpoints
```typescript
breakpoints = {
  mobile: 0,      // 0px+ (default)
  tablet: 768,    // 768px+ (iPad)
  desktop: 1024   // 1024px+ (large screens)
};
```

## Performance Optimizations

### StyleSheet Caching
```typescript
// Pre-create StyleSheet objects
const createLevelStyles = (levelIndex: number) => StyleSheet.create({
  container: {
    backgroundColor: LEVELS[levelIndex].color,
    // ... other styles
  }
});

// Cache styles by level
const levelStylesCache = new Map();
const getLevelStyles = (levelIndex: number) => {
  if (!levelStylesCache.has(levelIndex)) {
    levelStylesCache.set(levelIndex, createLevelStyles(levelIndex));
  }
  return levelStylesCache.get(levelIndex);
};
```

## Best Practices

### Do's ✅
```typescript
// Use design tokens
marginTop: spacing.lg

// Use design system styles
const styles = buttonStyles.primary(levelIndex);

// Compose styles properly
<View style={[baseStyles.container, dynamicStyles]} />

// Support level theming
<MyComponent levelIndex={effectiveThemeLevel} />
```

### Don'ts ❌
```typescript
// Don't hardcode values
marginTop: 24

// Don't create StyleSheet in render
const styles = StyleSheet.create({ ... });

// Don't use inline styles for static values
<View style={{ backgroundColor: '#1A202C' }} />

// Don't ignore accessibility
<Pressable style={{ height: 20, width: 20 }} /> // Too small!
```

## Design System Extensions

### Adding New Components
1. Define TypeScript interface with `levelIndex` prop
2. Create level-aware styles using design tokens
3. Include accessibility attributes
4. Add comprehensive tests
5. Document usage patterns

### Custom Themes
```typescript
// Extend existing themes
const customTheme = {
  ...LEVELS[levelIndex],
  customProperty: 'value'
};

// Create theme variants
const nightMode = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#000000'
  }
};
```

## Related Documentation

- [Component Architecture](../02-architecture/components.md)
- [Hooks API](hooks-api.md)
- [Quick Reference](../01-getting-started/quick-reference.md)