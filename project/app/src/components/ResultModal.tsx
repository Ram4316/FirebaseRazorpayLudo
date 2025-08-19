import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout } from '../theme';

interface ResultModalProps {
  visible: boolean;
  isWinner: boolean;
  potAmount: number;
  transactionId?: string;
  onClose: () => void;
  onBackToLobby: () => void;
  onShare?: () => void;
  isDark?: boolean;
  style?: object;
  accessibilityLabel?: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  visible,
  isWinner,
  potAmount,
  transactionId,
  onClose,
  onBackToLobby,
  onShare,
  isDark = false,
  style,
  accessibilityLabel,
}) => {
  const theme = isDark ? colors.dark : colors.light;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: theme.surface },
            style
          ]}
          accessibilityLabel={accessibilityLabel}
        >
          {/* Result Header */}
          <View style={styles.header}>
            <Text style={[styles.emoji, { fontSize: isWinner ? 48 : 36 }]}>
              {isWinner ? '🎉' : '😔'}
            </Text>
            
            <Text
              style={[
                styles.title,
                { color: isWinner ? theme.success : theme.danger }
              ]}
            >
              {isWinner ? 'Congratulations!' : 'Game Over'}
            </Text>

            <Text style={[styles.subtitle, { color: theme.muted }]}>
              {isWinner 
                ? `You won ₹${potAmount.toFixed(2)}!`
                : 'Better luck next time!'
              }
            </Text>
          </View>

          {/* Transaction Details */}
          {transactionId && isWinner && (
            <View style={[styles.transactionContainer, { borderColor: theme.border }]}>
              <Text style={[styles.transactionLabel, { color: theme.muted }]}>
                Transaction ID
              </Text>
              <Text
                style={[styles.transactionId, { color: theme.text }]}
                accessibilityLabel={`Transaction ID: ${transactionId}`}
              >
                #{transactionId}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onBackToLobby}
              style={[
                styles.primaryButton,
                { backgroundColor: theme.primary }
              ]}
              accessibilityLabel="Back to lobby"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>
                Back to Lobby
              </Text>
            </TouchableOpacity>

            {onShare && isWinner && (
              <TouchableOpacity
                onPress={onShare}
                style={[
                  styles.secondaryButton,
                  { 
                    backgroundColor: theme.surface,
                    borderColor: theme.primary 
                  }
                ]}
                accessibilityLabel="Share result"
                accessibilityRole="button"
              >
                <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>
                  Share
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <Text style={[styles.closeButtonText, { color: theme.muted }]}>
              ✕
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: layout.borderRadius * 2,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    position: 'relative',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.h1,
    fontFamily: typography.fonts.heading,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
  },
  transactionContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: layout.borderRadius,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  transactionLabel: {
    fontSize: typography.sizes.caption,
    fontFamily: typography.fonts.body,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  transactionId: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    minHeight: layout.touchTarget,
    borderRadius: layout.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '600',
  },
  secondaryButton: {
    minHeight: layout.touchTarget,
    borderRadius: layout.borderRadius,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  secondaryButtonText: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ResultModal;