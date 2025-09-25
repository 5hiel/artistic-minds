# Design System Quick Reference

## Essential Imports

```typescript
// Most common import
import { buttonStyles, cardStyles, layoutStyles, colors, spacing } from '@/design';

// Complete import
import { 
  buttonStyles, cardStyles, textStyles, layoutStyles, contentStyles, feedbackStyles,
  colors, spacing, typography, borderRadius, shadows, accessibility
} from '@/design';
```

## Component Styles Cheat Sheet

### Buttons
```typescript
buttonStyles.primary(levelIndex, 'default')      // Main buttons  
buttonStyles.secondary(levelIndex, 'pressed')    // Secondary buttons
buttonStyles.option(levelIndex, 'correct')       // A/B/C/D + power buttons
```

**States**: `'default' | 'pressed' | 'disabled' | 'loading'`
**Option Variants**: `'default' | 'correct' | 'incorrect' | 'power' | 'power-purchase' | 'power-disabled'`

### Cards  
```typescript
cardStyles.status(levelIndex)      // Top bar: high score, level
cardStyles.metric(levelIndex)      // Score display: score, time, power
cardStyles.content(levelIndex)     // General content containers
```

### Layout
```typescript
layoutStyles.screen(levelIndex)    // Main screen + gradients
layoutStyles.section(levelIndex)   // Sections + spacing
```

### Content
```typescript
contentStyles.puzzle(levelIndex)   // Puzzle container
contentStyles.grid(levelIndex)     // Grid cells
contentStyles.options(levelIndex)  // Options container
```

## Essential Design Tokens

### Colors
```typescript
colors.text.white                  // #ffffff - High contrast
colors.text.primary               // #e8eaed - Standard text  
colors.text.disabled              // rgba(255,255,255,0.4)
colors.components.background       // rgba(0,0,0,0.4) - Uniform backgrounds
colors.semantic.success            // #48BB78
colors.semantic.error              // #F56565
```

### Spacing
```typescript
spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 16px ← Most common
spacing.lg    // 24px ← Most common  
spacing.xl    // 32px
spacing.xxl   // 48px
spacing.xxxl  // 64px
```

### Typography
```typescript
typography.fontSize.sm    // 14px
typography.fontSize.md    // 16px ← Standard
typography.fontSize.lg    // 18px ← Buttons
typography.fontSize.xl    // 20px ← Headings

typography.fontWeight.normal    // '400'
typography.fontWeight.medium    // '500' ← Most common
typography.fontWeight.semibold  // '600'
typography.fontWeight.bold      // '700'
```

### Accessibility
```typescript
accessibility.minTouchTarget           // 44 (iOS minimum)
accessibility.minAndroidTouchTarget    // 48 (Android minimum)
accessibility.minTouchTargetSpacing    // 8 (minimum gap)
```

## Common Usage Patterns

### Level-Based Component
```typescript
interface MyComponentProps {
  levelIndex?: number;
}

const MyComponent: React.FC<MyComponentProps> = ({ levelIndex = 0 }) => {
  const styles = buttonStyles.primary(levelIndex);
  
  return (
    <Pressable style={styles.container}>
      <Text style={styles.text}>Button</Text>
    </Pressable>
  );
};
```

### Conditional Variants
```typescript
const variant = isSelected 
  ? (isCorrect ? 'correct' : 'incorrect')
  : 'default';
const styles = buttonStyles.option(levelIndex, variant);
```

### Style Composition
```typescript
<View style={[styles.container, { marginTop: spacing.lg }]}>
  <Text style={[styles.text, { color: colors.semantic.success }]}>
    Success Message
  </Text>
</View>
```

### Power Surge Theme Level
```typescript
// In useGameLogic hook
const effectiveThemeLevel = isInPowerSurge && currentPowerLevel > 1
  ? (levelIndex + 1) % LEVELS.length  // Circular progression
  : levelIndex;

// In components
<MyComponent levelIndex={effectiveThemeLevel} />
```

## Level Theme Reference

| Level | Name | Color | Usage |
|-------|------|-------|-------|
| 0 | Seeker | `#1A202C` | Dark, professional |
| 1 | Learner | `#1E90FF` | Sky blue, trustworthy |
| 2 | Thinker | `#FFD700` | Yellow, energetic |
| 3 | Creator | `#FF69B4` | Pink, creative |
| 4 | Visionary | `#32CD32` | Green, mastery |

**Power Surge Circular**: 4→0, 0→1, 1→2, 2→3, 3→4

## Performance Tips

### ✅ Do
```typescript
// Use design tokens
marginTop: spacing.lg

// Use design system styles  
const styles = buttonStyles.primary(levelIndex);

// Pre-created StyleSheet composition
<View style={[baseStyles.container, dynamicStyles]} />
```

### ❌ Don't
```typescript
// Don't hardcode values
marginTop: 24

// Don't create StyleSheet in render
const styles = StyleSheet.create({ ... });

// Don't use inline styles for static values
<View style={{ backgroundColor: '#1A202C' }} />
```

## Troubleshooting

### "Cannot find module '@/design'"
```typescript
// Fix import path
import { colors } from '../../../design';
// Or use relative path to your component location
```

### TypeScript errors on variants
```typescript
// Use proper types
const variant: 'default' | 'correct' | 'incorrect' = 'default';
const styles = buttonStyles.option(levelIndex, variant);
```

### Styles not applying
```typescript
// Ensure levelIndex prop is passed
<MyComponent levelIndex={effectiveThemeLevel} />

// Check that component uses design system
const styles = cardStyles.status(levelIndex); // Not inline styles
```

### Power surge theme not switching
```typescript
// Use effectiveThemeLevel from useGameLogic
const { effectiveThemeLevel } = useGameLogic(gameState, gameActions);

// Pass to all components
<Component levelIndex={effectiveThemeLevel} />
```

## Component Props Reference

### Standard Props
```typescript
interface StandardComponentProps {
  levelIndex?: number;        // 0-4, theme level (required for styled components)
  variant?: string;          // Component-specific variants
  state?: ComponentState;    // 'default' | 'pressed' | 'disabled' | 'loading'  
  disabled?: boolean;        // Disable interaction
}
```

### Button-Specific Props
```typescript
interface ButtonProps extends StandardComponentProps {
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  state?: 'default' | 'pressed' | 'disabled' | 'loading';
}

interface OptionButtonProps extends StandardComponentProps {
  variant?: 'default' | 'correct' | 'incorrect' | 'power' | 'power-purchase' | 'power-disabled';
}
```