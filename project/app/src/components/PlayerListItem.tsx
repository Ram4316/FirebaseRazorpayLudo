import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout, playerColors } from '../theme';

interface PlayerListItemProps {
  uid: string;
  displayName: string;
  avatar?: string;
  skipCount: number;
  forfeited: boolean;
  isCurrentTurn?: boolean;
  playerIndex: number;
  isDark?: boolean;
  style?: object;
  accessibilityLabel?: string;
}

export const PlayerListItem: React.FC<PlayerListItemProps> = ({
  uid,
  displayName,
  avatar,
  skipCount,
  forfeited,
  isCurrentTurn = false,
  playerIndex,
  isDark = false,
  style,
  accessibilityLabel,
}) => {
  const theme = isDark ? colors.dark : colors.light;
  const playerColorValues = Object.values(playerColors);
  const playerColor = playerColorValues[playerIndex % playerColorValues.length];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isCurrentTurn ? theme.primary + '20' : theme.surface,
          borderColor: isCurrentTurn ? theme.primary : theme.border,
          opacity: forfeited ? 0.5 : 1,
        },
        style
      ]}
      accessibilityLabel={accessibilityLabel || `${displayName}${isCurrentTurn ? ', current turn' : ''}${forfeited ? ', forfeited' : ''}`}
    >
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: playerColor,
            borderColor: isCurrentTurn ? theme.primary : 'transparent',
          }
        ]}
      >
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Player Info */}
      <View style={styles.playerInfo}>
        <Text
          style={[
            styles.displayName,
            { color: theme.text }
          ]}
          numberOfLines={1}
        >
          {displayName}
        </Text>

        {/* Status Badges */}
        <View style={styles.statusContainer}>
          {forfeited && (
            <View style={[styles.badge, { backgroundColor: theme.danger }]}>
              <Text style={styles.badgeText}>Forfeited</Text>
            </View>
          )}

          {skipCount > 0 && !forfeited && (
            <View style={[styles.badge, { backgroundColor: theme.warning }]}>
              <Text style={styles.badgeText}>Skips: {skipCount}/3</Text>
            </View>
          )}

          {isCurrentTurn && !forfeited && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>Turn</Text>
            </View>
          )}
        </View>
      </View>

      {/* Turn Indicator */}
      {isCurrentTurn && !forfeited && (
        <View style={[styles.turnIndicator, { backgroundColor: theme.primary }]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: layout.borderRadius,
    borderWidth: 2,
    marginVertical: spacing.xs,
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  playerInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  turnIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ translateY: -4 }],
  },
});

export default PlayerListItem;