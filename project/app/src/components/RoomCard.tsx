import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, typography, spacing, layout, playerColors } from '../theme';

interface Player {
  uid: string;
  displayName: string;
  avatar?: string;
}

interface RoomCardProps {
  roomId: string;
  betAmount: number;
  maxPlayers: number;
  currentPlayers: number;
  players: Player[];
  onJoin: () => void;
  isDark?: boolean;
  style?: object;
  accessibilityLabel?: string;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomId,
  betAmount,
  maxPlayers,
  currentPlayers,
  players,
  onJoin,
  isDark = false,
  style,
  accessibilityLabel,
}) => {
  const theme = isDark ? colors.dark : colors.light;
  
  const canJoin = currentPlayers < maxPlayers;
  const playerColorValues = Object.values(playerColors);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style
      ]}
      accessibilityLabel={accessibilityLabel || `Room with ₹${betAmount} bet`}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.betBadge}>
          <Text style={styles.betText}>₹{betAmount}</Text>
        </View>
        <Text style={[styles.roomId, { color: theme.muted }]}>
          Room {roomId.slice(-6).toUpperCase()}
        </Text>
      </View>

      {/* Players */}
      <View style={styles.playersSection}>
        <View style={styles.avatarsContainer}>
          {Array.from({ length: maxPlayers }, (_, index) => {
            const player = players[index];
            const isEmpty = !player;
            const playerColor = playerColorValues[index % playerColorValues.length];

            return (
              <View
                key={index}
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isEmpty ? theme.border : playerColor,
                  }
                ]}
              >
                {!isEmpty && (
                  <Text style={styles.avatarText}>
                    {player.displayName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <Text style={[styles.playersCount, { color: theme.muted }]}>
          {currentPlayers}/{maxPlayers} players
        </Text>
      </View>

      {/* Join Button */}
      <TouchableOpacity
        onPress={onJoin}
        disabled={!canJoin}
        style={[
          styles.joinButton,
          {
            backgroundColor: canJoin ? theme.primary : theme.muted,
          }
        ]}
        accessibilityLabel={canJoin ? "Join room" : "Room is full"}
        accessibilityRole="button"
        accessibilityState={{ disabled: !canJoin }}
      >
        <Text style={styles.joinButtonText}>
          {canJoin ? 'Join' : 'Full'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: layout.borderRadius,
    borderWidth: 1,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  betBadge: {
    backgroundColor: colors.light.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  betText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
  roomId: {
    fontSize: typography.sizes.caption,
    fontFamily: typography.fonts.body,
  },
  playersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.xs, // Overlap slightly
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playersCount: {
    fontSize: typography.sizes.caption,
    fontFamily: typography.fonts.body,
  },
  joinButton: {
    minHeight: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: typography.sizes.body,
    fontWeight: '600',
  },
});

export default RoomCard;