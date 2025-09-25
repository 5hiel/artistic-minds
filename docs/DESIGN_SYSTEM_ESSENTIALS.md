# Design System Essentials

## Architecture Overview

The Gifted Minds design system is built on **three core layers** for consistent, scalable styling:

1. **Design Tokens** (`design/tokens.ts`) - Raw values (colors, spacing, typography)
2. **Component Styles** (`design/components.ts`) - Pre-built component styles with variants
3. **React Components** - Components using the design system

## Quick Start

### Import Design System
```typescript
import { buttonStyles, cardStyles, layoutStyles, colors, spacing } from '@/design';
```

### Level-Based Theming
Every component supports dynamic theming based on user progression:

```typescript
// effectiveThemeLevel = 0-4 (Seeker to Visionary)
const styles = buttonStyles.primary(effectiveThemeLevel, 'default');
const cardStyle = cardStyles.status(effectiveThemeLevel);

// Use the styles
<Pressable style={styles.container}>
  <Text style={styles.text}>Button Text</Text>
</Pressable>
```

### Power Surge Circular Theming

**NEW SYSTEM**: During power surge, theme automatically advances to next level:

- **Level 0 (Seeker)** → **Level 1 (Learner)** theme
- **Level 1 (Learner)** → **Level 2 (Thinker)** theme  
- **Level 2 (Thinker)** → **Level 3 (Creator)** theme
- **Level 3 (Creator)** → **Level 4 (Visionary)** theme
- **Level 4 (Visionary)** → **Level 0 (Seeker)** theme (**CIRCULAR**)

This replaces custom animations with seamless theme switching.

## Component Categories

### Buttons
```typescript
// Interactive elements
buttonStyles.primary(level, state)    // Main action buttons
buttonStyles.secondary(level, state)  // Secondary actions  
buttonStyles.option(level, variant)   // A/B/C/D puzzle answers + power buttons
```

**Variants**: `'default' | 'correct' | 'incorrect' | 'power' | 'power-purchase' | 'power-disabled'`
**States**: `'default' | 'pressed' | 'disabled' | 'loading'`

### Cards
```typescript
// Display containers
cardStyles.status(level)     // Game top bar (high score, level display)
cardStyles.metric(level)     // Score display (score, time, power)
cardStyles.content(level)    // Content containers
```

### Layout
```typescript
// Structure and positioning
layoutStyles.screen(level)   // Main screen containers + gradients
layoutStyles.section(level)  // Section containers and spacing
```

### Content
```typescript
// Game-specific displays
contentStyles.puzzle(level)  // Main puzzle container
contentStyles.grid(level)    // Puzzle grid cells
contentStyles.options(level) // Answer options container
```

## Essential Design Tokens

### Colors
```typescript
colors.text.white              // High contrast white text
colors.text.primary            // Standard text (#e8eaed)
colors.text.disabled           // Disabled state text
colors.components.background   // Uniform dark tinted backgrounds (rgba(0,0,0,0.4))
```

### Spacing
```typescript
spacing.xs   // 4px
spacing.sm   // 8px  
spacing.md   // 16px - Most common
spacing.lg   // 24px - Most common
spacing.xl   // 32px
```

### Accessibility
```typescript
accessibility.minTouchTarget   // 44pt minimum for iOS
accessibility.minAndroidTouchTarget // 48pt minimum for Android  
accessibility.minTouchTargetSpacing // 8pt minimum between targets
```

## Mobile-First Guidelines

### Platform-Optimized Shadows
The design system automatically provides platform-specific shadows:

- **iOS**: `shadowOffset`, `shadowOpacity`, `shadowRadius`
- **Android**: `elevation` 
- **Web**: `boxShadow`

### Touch Targets
All interactive elements automatically meet accessibility standards:
- Minimum 44pt on iOS, 48pt on Android
- Proper spacing between targets
- Enhanced touch areas for small elements

### Performance
- **Pre-created StyleSheet objects** reduce runtime overhead
- **Style composition** instead of creating new StyleSheet instances
- **Memoization** prevents redundant style calculations

## Creating New Components

### 1. Import Design System
```typescript
import { buttonStyles, colors, spacing } from '@/design';
```

### 2. Accept levelIndex Prop
```typescript
interface MyComponentProps {
  levelIndex?: number; // Level-based theming
  // other props...
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  levelIndex = 0,
  // other props...
}) => {
```

### 3. Use Design System Styles
```typescript
  const styles = buttonStyles.primary(levelIndex);
  
  return (
    <Pressable style={styles.container}>
      <Text style={styles.text}>My Component</Text>
    </Pressable>
  );
};
```

### 4. Follow Naming Conventions
- **Props**: `levelIndex` for theming, descriptive names
- **Styles**: Use design system categories (buttons, cards, layout, content)
- **Variants**: Descriptive names (`'primary'`, `'secondary'`, `'disabled'`)

## Common Patterns

### Conditional Styling
```typescript
const variant = isSelected 
  ? (isCorrect ? 'correct' : 'incorrect')
  : 'default';
const styles = buttonStyles.option(levelIndex, variant);
```

### Style Composition
```typescript
<Text style={[styles.text, { fontSize: typography.fontSize.xl }]}>
```

### Dynamic Props
```typescript
<Component 
  levelIndex={effectiveThemeLevel} // Use effectiveThemeLevel for power surge
  disabled={gameState.loading}
  variant={getVariant()}
/>
```

## Troubleshooting

### TypeScript Errors
- Ensure all design token imports are from `@/design`
- Use proper variant/state types from component definitions
- Check that `levelIndex` prop is passed to all styled components

### Performance Issues
- Use `effectiveThemeLevel` from `useGameLogic` instead of calculating manually
- Avoid creating inline styles - use design system tokens
- Don't create new StyleSheet objects in render functions

### Styling Inconsistencies
- Always use design tokens instead of hardcoded values
- Ensure all components accept `levelIndex` prop for theming
- Check that component follows one of the four categories (buttons, cards, layout, content)

## Level Progression Reference

| Level | Name | Threshold | Primary Color | Theme |
|-------|------|-----------|---------------|-------|
| 0 | Seeker | 0-9 | `#1A202C` | Dark, professional |
| 1 | Learner | 10-99 | `#1E90FF` | Sky blue, trustworthy |
| 2 | Thinker | 100-999 | `#FFD700` | Sunshine yellow, energetic |
| 3 | Creator | 1000-9999 | `#FF69B4` | Candy pink, creative |
| 4 | Visionary | 10000+ | `#32CD32` | Lime green, mastery |

During power surge, themes advance circularly: 4 → 0, 0 → 1, 1 → 2, etc.