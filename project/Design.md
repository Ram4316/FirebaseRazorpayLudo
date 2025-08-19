# Ludo Game Design System

A comprehensive design system for the real-money Ludo game mobile application.

## 🎯 Design Goals

- **Playful but clear**: Bright player colors with readable UI chrome for excellent usability
- **Mobile-first**: Large touch targets and single-column flows optimized for mobile devices  
- **Fast feedback**: Snappy dice and turn animations that provide immediate visual response
- **Accessible**: WCAG contrast compliance and reduced-motion options for inclusive design

## 🎨 Color System

### Light Theme
```css
Primary: #0066FF        /* Main brand color */
Primary 600: #0052CC    /* Darker variant */
Secondary: #00B37E      /* Success/accent color */
Background: #F7FBFF     /* Main background */
Surface: #FFFFFF        /* Card backgrounds */
Text: #0F1724          /* Primary text */
Muted: #667085         /* Secondary text */
Border: #E6E9EE        /* Borders and dividers */
Success: #16A34A       /* Success states */
Warning: #F59E0B       /* Warning states */
Danger: #EF4444        /* Error states */
```

### Dark Theme
```css
Background: #071129     /* Dark background */
Surface: #0B1220       /* Dark card backgrounds */
Text: #E6EEF8          /* Light text */
Muted: #9AA7B9         /* Dark secondary text */
Primary: #3B82F6       /* Adjusted primary for dark */
```

### Ludo Player Colors (Consistent across themes)
```css
Red: #E02424           /* Player 1 tokens */
Green: #16A34A         /* Player 2 tokens */
Yellow: #FBBF24        /* Player 3 tokens */
Blue: #2563EB          /* Player 4 tokens */
```

## 🔤 Typography

### Font Families
- **Headings**: Poppins (primary display font)
- **Body**: Inter (readable interface font)

### Font Sizes (Mobile-optimized)
```css
h1: 28px               /* Page titles */
h2: 20px               /* Section headings */  
body: 16px             /* Main text */
caption: 12px          /* Small labels */
```

### Line Heights
- **Headings**: 1.25 (tight for impact)
- **Body**: 1.4 (readable for content)

## 📏 Spacing & Layout

### Spacing Scale (4px base unit)
```css
xs: 4px                /* Minimal spacing */
sm: 8px                /* Small spacing */
md: 12px               /* Medium spacing */
lg: 16px               /* Standard spacing */
xl: 24px               /* Large spacing */
xxl: 32px              /* Extra large */
xxxl: 48px             /* Maximum spacing */
```

### Layout Constants
```css
Border Radius: 12px    /* Cards and buttons */
Touch Target: 48px     /* Minimum interactive size */
Screen Padding: 16px   /* Edge margins */
Card Padding: 16px     /* Internal card spacing */
```

## 🎭 Animations & Timing

### Animation Durations
```css
Dice Roll: 900ms       /* Complete dice animation */
Turn Change: 300ms     /* Player turn transition */
Turn Glow: 600ms       /* Current player highlight */
Confetti: 1200ms       /* Win celebration */
Button Press: 150ms    /* Touch feedback */
```

### Dice Animation Breakdown
- **Bounce Phase**: 0-200ms (scale up effect)
- **Flicker Phase**: 200-800ms (rapid frame changes) 
- **Settle Phase**: 800-900ms (final value reveal)

### Timer Behavior  
- **Total Duration**: 30 seconds per turn
- **Warning State**: Last 10 seconds (yellow)
- **Danger State**: Last 5 seconds (red)

## ♿ Accessibility Features

### Contrast Compliance
- Body text: Minimum 4.5:1 contrast ratio
- Interactive elements: Minimum 3:1 contrast ratio  
- Focus indicators: High contrast borders

### Motion & Animation
- **Reduce Motion Toggle**: Disables animations when enabled
- **Haptic Feedback**: Touch vibration for dice rolls and wins
- **Color Blind Support**: Pattern overlays on tokens when enabled

### Screen Reader Support
- Comprehensive `accessibilityLabel` props
- Semantic role attributes for interactive elements
- Live region updates for game state changes

## 📱 Component Usage Examples

### Using Theme Colors
```tsx
import { colors, getThemeColors } from '../theme';

const MyComponent = ({ isDark }) => {
  const theme = getThemeColors(isDark);
  
  return (
    <View style={{ backgroundColor: theme.surface }}>
      <Text style={{ color: theme.text }}>Hello World</Text>
    </View>
  );
};
```

### Responsive Spacing
```tsx
import { spacing, dimensions } from '../theme';

const responsiveStyles = StyleSheet.create({
  container: {
    padding: dimensions.isSmallScreen ? spacing.md : spacing.lg,
    margin: spacing.xl,
  }
});
```

### Player Color Application
```tsx
import { playerColors } from '../theme';

const PlayerToken = ({ playerIndex }) => (
  <View 
    style={{
      backgroundColor: Object.values(playerColors)[playerIndex],
      width: 32,
      height: 32,
      borderRadius: 16,
    }}
  />
);
```

## 🎯 UI/UX Flow Guidelines

### Lobby Screen
- Grid of `RoomCard` components showing available games
- Prominent "Create Room" button with bet amount selection
- Filter options for bet amounts (₹2, ₹5, ₹10, ₹20, ₹50, ₹100)

### Room Screen  
- Player avatars in consistent positions
- Ready toggle for each player with visual feedback
- Host-only "Start Game" button (disabled until all ready)
- Real-time player count and bet amount display

### Game Board
- Large central board with clear token positioning
- Bottom-right dice button with timer
- Right sidebar showing player list with skip counts
- Turn indicator with subtle glow animation

### Result Screen
- Celebration animation for winners (confetti burst)
- Clear payout information with transaction ID
- "Back to Lobby" and "Share Result" CTAs
- Reduced motion: Simple fade transitions instead of confetti

## 🔧 Implementation Notes

### Dark Mode Support
```tsx
// Enable system theme detection
const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';
const theme = getThemeColors(isDark);
```

### Animation Disabling
```tsx
// Check accessibility preferences
const reduceMotion = AccessibilityInfo.isReduceMotionEnabled();

// Conditional animation
if (!reduceMotion) {
  Animated.timing(value, { ... }).start();
}
```

### Color Token Consistency
- Always import colors from `theme.ts`
- Never use hardcoded hex values in components
- Use semantic color names (`theme.primary` not `#0066FF`)

## 📋 Quality Checklist

### Before Implementation
- [ ] All colors pass WCAG AA contrast requirements
- [ ] Touch targets meet 48px minimum size
- [ ] Animation durations feel responsive (under 1s)
- [ ] Dark theme colors maintain contrast ratios

### During Development  
- [ ] Components accept `isDark` and `reduceMotion` props
- [ ] All interactive elements have `accessibilityLabel`
- [ ] Color tokens imported from theme, not hardcoded
- [ ] Spacing uses theme constants, not arbitrary values

### Testing Checklist
- [ ] Test with screen reader enabled
- [ ] Verify dark mode color accuracy
- [ ] Check reduced motion preference handling  
- [ ] Validate touch target sizes on device
- [ ] Confirm color blind accessibility with patterns

## 🎨 Asset Requirements

### Icons Needed (SVG format)
- Dice faces (1-6) + rolling state
- Coin/wallet icon
- Settings gear icon  
- Back arrow navigation
- Confetti burst elements

### Avatar Generation Prompts
```
"4 playful flat-style circular avatars matching player colors (red, green, yellow, blue). 
512x512 PNG, transparent background, friendly geometric faces"
```

### Dice Asset Prompts  
```
"8 3D dice animation frames showing faces 1-6 plus 2 motion blur frames for rolling effect. 
1024x1024 PNG with subtle shadows"
```

### Background Patterns
```
"Subtle pastel geometric pattern suitable for game board background. 
2048x2048 seamless tile, low contrast, complementary to #F7FBFF"
```

---

## 🚀 Getting Started

1. Import theme constants: `import { colors, typography, spacing } from '../theme'`
2. Use `getThemeColors(isDark)` for dynamic theming
3. Apply spacing with theme constants: `marginTop: spacing.lg`
4. Test with accessibility preferences enabled
5. Validate color contrast using browser dev tools

This design system ensures consistent, accessible, and delightful user experiences across the entire Ludo game application.