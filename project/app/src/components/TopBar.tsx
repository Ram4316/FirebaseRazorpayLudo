import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, layout } from '../theme';

interface TopBarProps {
  title: string;
  onBack?: () => void;
  walletBalance?: number;
  showWallet?: boolean;
  isDark?: boolean;
  style?: object;
  accessibilityLabel?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  onBack,
  walletBalance,
  showWallet = false,
  isDark = false,
  style,
  accessibilityLabel,
}) => {
  const theme = isDark ? colors.dark : colors.light;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }, style]}>
      <View style={styles.content}>
        {/* Back Button */}
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backButton, { backgroundColor: theme.surface }]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={[styles.backIcon, { color: theme.text }]}>←</Text>
          </TouchableOpacity>
        )}

        {/* Title */}
        <Text
          style={[styles.title, { color: theme.text }]}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityRole="header"
        >
          {title}
        </Text>

        {/* Wallet Chip */}
        {showWallet && (
          <View style={[styles.walletChip, { backgroundColor: theme.success }]}>
            <Text style={styles.walletIcon}>₹</Text>
            <Text style={styles.walletAmount}>
              {walletBalance?.toFixed(2) || '0.00'}
            </Text>
          </View>
        )}

        {/* Spacer when no wallet */}
        {!showWallet && !onBack && <View style={styles.spacer} />}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: layout.touchTarget,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: typography.sizes.h2,
    fontFamily: typography.fonts.heading,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  walletChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    minWidth: 80,
  },
  walletIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  walletAmount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    width: 40,
  },
});

export default TopBar;