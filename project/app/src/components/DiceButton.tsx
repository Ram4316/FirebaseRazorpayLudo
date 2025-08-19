import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors, typography, spacing, layout, animationDurations, diceAnimationFrames } from '../theme';

interface DiceButtonProps {
  onRoll: () => void;
  disabled?: boolean;
  isRolling?: boolean;
  diceValue?: number;
  isDark?: boolean;
  style?: object;
  accessibilityLabel?: string;
  reduceMotion?: boolean;
}

const diceUnicodes = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const DiceButton: React.FC<DiceButtonProps> = ({
  onRoll,
  disabled = false,
  isRolling = false,
  diceValue,
  isDark = false,
  style,
  accessibilityLabel,
  reduceMotion = false,
}) => {
  const theme = isDark ? colors.dark : colors.light;
  const [animatedValue] = useState(new Animated.Value(1));
  const [currentFrame, setCurrentFrame] = useState(0);

  // Animation states for dice rolling
  useEffect(() => {
    if (isRolling && !reduceMotion) {
      // Start rolling animation
      const rollAnimation = () => {
        // Bounce phase (0-200ms)
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: diceAnimationFrames.bounce.end - diceAnimationFrames.bounce.start,
            useNativeDriver: true,
          }),
          // Flicker phase (200-800ms) - rapid frame changes
          Animated.timing(animatedValue, {
            toValue: 0.9,
            duration: diceAnimationFrames.flicker.end - diceAnimationFrames.flicker.start,
            useNativeDriver: true,
          }),
          // Settle phase (800-900ms)
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: diceAnimationFrames.settle.end - diceAnimationFrames.settle.start,
            useNativeDriver: true,
          }),
        ]).start();

        // Flicker frames during flicker phase
        const flickerInterval = setInterval(() => {
          setCurrentFrame(Math.floor(Math.random() * 6));
        }, 50);

        setTimeout(() => {
          clearInterval(flickerInterval);
          if (diceValue) {
            setCurrentFrame(diceValue - 1);
          }
        }, diceAnimationFrames.flicker.end);
      };

      rollAnimation();
    } else if (diceValue) {
      setCurrentFrame(diceValue - 1);
    }
  }, [isRolling, diceValue, reduceMotion, animatedValue]);

  const handlePress = () => {
    if (!disabled && !isRolling) {
      onRoll();
    }
  };

  const getDiceDisplay = () => {
    if (isRolling) {
      return diceUnicodes[currentFrame];
    }
    if (diceValue) {
      return diceUnicodes[diceValue - 1];
    }
    return '🎲';
  };

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    if (isRolling) return 'Rolling dice';
    if (diceValue) return `Dice shows ${diceValue}`;
    return 'Roll dice';
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isRolling}
      style={[
        styles.container,
        {
          backgroundColor: disabled ? theme.muted : theme.primary,
          transform: reduceMotion ? undefined : [{ scale: animatedValue }],
        },
        style
      ]}
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || isRolling }}
    >
      <Text style={[styles.diceText, { opacity: isRolling ? 0.8 : 1 }]}>
        {getDiceDisplay()}
      </Text>
      
      {isRolling && (
        <Text style={styles.statusText}>Rolling...</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  diceText: {
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusText: {
    position: 'absolute',
    bottom: -24,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DiceButton;