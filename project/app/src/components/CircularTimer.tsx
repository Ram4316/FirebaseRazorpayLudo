import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, spacing, gameConstants } from '../theme';

interface CircularTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onTimeout: () => void;
  isDark?: boolean;
  style?: object;
  accessibilityLabel?: string;
  reduceMotion?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularTimer: React.FC<CircularTimerProps> = ({
  duration = gameConstants.turnTimeLimit / 1000,
  isActive,
  onTimeout,
  isDark = false,
  style,
  accessibilityLabel,
  reduceMotion = false,
}) => {
  const theme = isDark ? colors.dark : colors.light;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [animatedValue] = useState(new Animated.Value(1));

  const radius = 35;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (isActive) {
      setTimeLeft(duration);
      
      // Start the countdown animation
      if (!reduceMotion) {
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration * 1000,
          useNativeDriver: false,
        }).start();
      }

      // Start the countdown timer
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            clearInterval(interval);
            onTimeout();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Reset when not active
      setTimeLeft(duration);
      animatedValue.setValue(1);
    }
  }, [isActive, duration, onTimeout, reduceMotion, animatedValue]);

  const getTimerColor = () => {
    if (timeLeft <= 5) return theme.danger || colors.light.danger;
    if (timeLeft <= 10) return theme.warning || colors.light.warning;
    return theme.primary;
  };

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, style]} accessibilityLabel={accessibilityLabel}>
      <Svg width="80" height="80" style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx="40"
          cy="40"
          r={radius}
          stroke={theme.border}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        {isActive && (
          <AnimatedCircle
            cx="40"
            cy="40"
            r={radius}
            stroke={getTimerColor()}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={reduceMotion ? 0 : strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 40 40)`}
          />
        )}
      </Svg>
      
      {/* Timer text */}
      <View style={styles.textContainer}>
        <Text
          style={[
            styles.timerText,
            { color: isActive ? getTimerColor() : theme.muted }
          ]}
          accessibilityLabel={`${timeLeft} seconds remaining`}
        >
          {timeLeft}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CircularTimer;