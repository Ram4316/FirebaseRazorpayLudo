import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing, layout, animationDurations } from '../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  isDark?: boolean;
  style?: object;
  textStyle?: object;
  accessibilityLabel?: string;
  reduceMotion?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  isDark = false,
  style,
  textStyle,
  accessibilityLabel,
  reduceMotion = false,
}) => {
  const theme = isDark ? colors.dark : colors.light;
  
  const buttonColor = disabled ? theme.muted : theme.primary;
  const textColor = '#FFFFFF';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: buttonColor },
        style
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={reduceMotion ? 1 : 0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export const SecondaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  isDark = false,
  style,
  textStyle,
  accessibilityLabel,
  reduceMotion = false,
}) => {
  const theme = isDark ? colors.dark : colors.light;
  
  const buttonColor = theme.surface;
  const borderColor = disabled ? theme.muted : theme.primary;
  const textColor = disabled ? theme.muted : theme.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        styles.secondaryButton,
        { 
          backgroundColor: buttonColor,
          borderColor: borderColor 
        },
        style
      ]}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      activeOpacity={reduceMotion ? 1 : 0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: layout.touchTarget,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PrimaryButton;