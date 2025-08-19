// Theme configuration for the Ludo game app
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color tokens
export const colors = {
  light: {
    primary: '#0066FF',
    primary600: '#0052CC',
    secondary: '#00B37E',
    background: '#F7FBFF',
    surface: '#FFFFFF',
    text: '#0F1724',
    muted: '#667085',
    border: '#E6E9EE',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  dark: {
    primary: '#3B82F6',
    primary600: '#2563EB',
    secondary: '#00B37E',
    background: '#071129',
    surface: '#0B1220',
    text: '#E6EEF8',
    muted: '#9AA7B9',
    border: '#1E293B',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#EF4444',
  }
};

// Ludo player colors (consistent across themes)
export const playerColors = {
  red: '#E02424',
  green: '#16A34A',
  yellow: '#FBBF24',
  blue: '#2563EB',
};

// Typography
export const typography = {
  fonts: {
    heading: 'Poppins',
    body: 'Inter',
  },
  sizes: {
    h1: 28,
    h2: 20,
    body: 16,
    caption: 12,
  },
  lineHeights: {
    heading: 1.25,
    body: 1.4,
  },
};

// Spacing system (base unit: 4px)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Layout constants
export const layout = {
  borderRadius: 12,
  touchTarget: 48,
  screenPadding: 16,
  cardPadding: 16,
};

// Animation durations
export const animationDurations = {
  diceRoll: 900,
  turnChange: 300,
  turnGlow: 600,
  timerWarning: 10000, // 10s remaining
  timerDanger: 5000,   // 5s remaining
  confetti: 1200,
  buttonPress: 150,
};

// Accessibility settings
export const accessibility = {
  reduceMotion: false,
  colorBlindMode: false,
  hapticFeedback: true,
};

// Screen dimensions
export const dimensions = {
  width,
  height,
  isSmallScreen: width < 380,
  isMediumScreen: width >= 380 && width < 414,
  isLargeScreen: width >= 414,
};

// Breakpoints for responsive design
export const breakpoints = {
  sm: 320,
  md: 375,
  lg: 414,
  xl: 480,
};

// Z-index levels
export const zIndex = {
  modal: 1000,
  overlay: 900,
  dropdown: 800,
  tooltip: 700,
  header: 600,
};

// Game-specific constants
export const gameConstants = {
  turnTimeLimit: 30000, // 30 seconds in milliseconds
  maxSkipCount: 3,
  betAmounts: [2, 5, 10, 20, 50, 100], // ₹ amounts
  maxPlayersPerRoom: 4,
  minPlayersToStart: 2,
};

// Dice animation frames timing
export const diceAnimationFrames = {
  bounce: { start: 0, end: 200 },
  flicker: { start: 200, end: 800 },
  settle: { start: 800, end: 900 },
};

// Helper function to get current theme colors
export const getThemeColors = (isDark: boolean = false) => {
  return isDark ? colors.dark : colors.light;
};

// Helper function for contrast checking
export const getContrastColor = (backgroundColor: string, isDark: boolean = false) => {
  const theme = getThemeColors(isDark);
  return backgroundColor === theme.background ? theme.text : theme.background;
};

export default {
  colors,
  playerColors,
  typography,
  spacing,
  layout,
  animationDurations,
  accessibility,
  dimensions,
  breakpoints,
  zIndex,
  gameConstants,
  diceAnimationFrames,
  getThemeColors,
  getContrastColor,
};