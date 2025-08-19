import { getDatabase } from 'firebase-admin/database';
import { HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { randomInt } from 'crypto';

const db = getDatabase();

interface StartGameRequest {
  roomId: string;
}

interface RollDiceRequest {
  roomId: string;
}

interface AutoSkipRequest {
  roomId: string;
}

interface ForfeitRequest {
  roomId: string;
  uid?: string; // If not provided, use auth uid
}

interface FinalizeGameRequest {
  roomId: string;
}

/**
 * Start a game after all players are ready
 * Locks bet amounts from player wallets atomically
 */
export const startGame = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId }: StartGameRequest = request.data;
  const uid = request.auth.uid;

  if (!roomId) {
    throw new HttpsError('invalid-argument', 'Room ID is required');
  }

  try {
    // Use transaction to ensure atomic wallet operations
    const result = await db.ref(`rooms/${roomId}`).transaction((roomData) => {
      if (!roomData) {
        throw new HttpsError('not-found', 'Room not found');
      }

      // Validate room state
      if (roomData.status !== 'waiting') {
        throw new HttpsError('failed-precondition', 'Game already started');
      }

      // Check if user is room creator or all players are ready
      const players = Object.values(roomData.players) as any[];
      const allReady = players.every((player: any) => player.ready);
      
      if (!allReady) {
        throw new HttpsError('failed-precondition', 'Not all players are ready');
      }

      // Lock bet amounts (this will be validated against actual wallet balance)
      let totalPot = 0;
      const updatedPlayers = { ...roomData.players };
      
      for (const playerId in updatedPlayers) {
        updatedPlayers[playerId].walletLockedAmount = roomData.betAmount;
        totalPot += roomData.betAmount;
      }

      // Create turn order (randomized)
      const turnOrder = Object.keys(updatedPlayers);
      for (let i = turnOrder.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [turnOrder[i], turnOrder[j]] = [turnOrder[j], turnOrder[i]];
      }

      // Initialize board state
      const boardState = initializeBoardState(Object.keys(updatedPlayers));

      return {
        ...roomData,
        status: 'ongoing',
        players: updatedPlayers,
        turnOrder,
        currentTurnIndex: 0,
        boardState,
        potAmount: totalPot,
        startedAt: Date.now(),
      };
    });

    if (result.committed) {
      const roomData = result.snapshot.val();
      
      // Now deduct from actual wallet balances atomically
      const walletUpdates: { [key: string]: any } = {};
      for (const playerId in roomData.players) {
        walletUpdates[`users/${playerId}/walletBalance`] = 
          db.ref(`users/${playerId}/walletBalance`).transaction((balance) => {
            return (balance || 0) - roomData.betAmount;
          });

        // Add transaction record
        const transactionId = db.ref(`users/${playerId}/transactions`).push().key;
        walletUpdates[`users/${playerId}/transactions/${transactionId}`] = {
          type: 'bet',
          amount: roomData.betAmount,
          roomId,
          timestamp: Date.now(),
          status: 'completed',
          description: `Ludo game bet - Room ${roomId.slice(-6).toUpperCase()}`
        };
      }

      await Promise.all(Object.values(walletUpdates));

      logger.info('Game started', { 
        roomId, 
        players: Object.keys(roomData.players),
        potAmount: roomData.potAmount 
      });

      return {
        message: 'Game started successfully',
        roomData,
        turnOrder: roomData.turnOrder,
        currentPlayer: roomData.turnOrder[0]
      };
    } else {
      throw new HttpsError('aborted', 'Failed to start game due to concurrent modification');
    }

  } catch (error: any) {
    logger.error('Error starting game', { error: error.message, roomId, uid });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to start game');
  }
};

/**
 * Server-side dice roll with secure RNG
 * Validates player's turn and updates board state
 */
export const serverRollDice = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId }: RollDiceRequest = request.data;
  const uid = request.auth.uid;

  try {
    const result = await db.ref(`rooms/${roomId}`).transaction((roomData) => {
      if (!roomData || roomData.status !== 'ongoing') {
        throw new HttpsError('failed-precondition', 'Game is not active');
      }

      // Validate it's player's turn
      const currentPlayerUid = roomData.turnOrder[roomData.currentTurnIndex];
      if (currentPlayerUid !== uid) {
        throw new HttpsError('permission-denied', 'Not your turn');
      }

      // Check if player is forfeited
      if (roomData.players[uid].forfeited) {
        throw new HttpsError('failed-precondition', 'Player is forfeited');
      }

      // Generate secure random dice value
      const diceValue = randomInt(1, 7);
      
      // Reset skip count on successful roll
      roomData.players[uid].skipCount = 0;

      // Add to dice history for audit
      const diceRoll = {
        playerId: uid,
        value: diceValue,
        timestamp: Date.now(),
        turnIndex: roomData.currentTurnIndex
      };
      roomData.diceHistory.push(diceRoll);

      // TODO: Update board state based on dice roll and player moves
      // This is where the core Ludo logic would go
      
      // Move to next player's turn
      let nextTurnIndex = (roomData.currentTurnIndex + 1) % roomData.turnOrder.length;
      
      // Skip forfeited players
      let attempts = 0;
      while (roomData.players[roomData.turnOrder[nextTurnIndex]].forfeited && attempts < roomData.turnOrder.length) {
        nextTurnIndex = (nextTurnIndex + 1) % roomData.turnOrder.length;
        attempts++;
      }

      roomData.currentTurnIndex = nextTurnIndex;

      return roomData;
    });

    if (result.committed) {
      const roomData = result.snapshot.val();
      const diceRoll = roomData.diceHistory[roomData.diceHistory.length - 1];

      logger.info('Dice rolled', { 
        roomId, 
        uid, 
        diceValue: diceRoll.value,
        nextPlayer: roomData.turnOrder[roomData.currentTurnIndex]
      });

      return {
        diceValue: diceRoll.value,
        nextPlayer: roomData.turnOrder[roomData.currentTurnIndex],
        boardState: roomData.boardState
      };
    } else {
      throw new HttpsError('aborted', 'Failed to roll dice due to concurrent modification');
    }

  } catch (error: any) {
    logger.error('Error rolling dice', { error: error.message, roomId, uid });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to roll dice');
  }
};

/**
 * Auto-skip a player's turn (called when timer expires)
 * Increments skip count and may trigger forfeit
 */
export const autoSkip = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId }: AutoSkipRequest = request.data;
  const uid = request.auth.uid;

  try {
    const result = await db.ref(`rooms/${roomId}`).transaction((roomData) => {
      if (!roomData || roomData.status !== 'ongoing') {
        throw new HttpsError('failed-precondition', 'Game is not active');
      }

      // Validate it's player's turn
      const currentPlayerUid = roomData.turnOrder[roomData.currentTurnIndex];
      if (currentPlayerUid !== uid) {
        throw new HttpsError('permission-denied', 'Not your turn');
      }

      // Increment skip count
      roomData.players[uid].skipCount += 1;

      // Add to moves history
      const skipAction = {
        playerId: uid,
        action: 'auto-skip',
        skipCount: roomData.players[uid].skipCount,
        timestamp: Date.now(),
        turnIndex: roomData.currentTurnIndex
      };
      roomData.movesHistory.push(skipAction);

      // Check if player should be forfeited (3 skips)
      const shouldForfeit = roomData.players[uid].skipCount >= 3;

      if (shouldForfeit) {
        roomData.players[uid].forfeited = true;
        
        // Add forfeit action
        const forfeitAction = {
          playerId: uid,
          action: 'forfeit',
          reason: 'auto-skip-limit',
          timestamp: Date.now(),
        };
        roomData.movesHistory.push(forfeitAction);

        // Check if only one player remains
        const activePlayers = Object.values(roomData.players).filter((p: any) => !p.forfeited);
        if (activePlayers.length === 1) {
          // Auto-finalize game
          roomData.status = 'finished';
          roomData.endedAt = Date.now();
        }
      }

      // Move to next player's turn
      let nextTurnIndex = (roomData.currentTurnIndex + 1) % roomData.turnOrder.length;
      
      // Skip forfeited players
      let attempts = 0;
      while (roomData.players[roomData.turnOrder[nextTurnIndex]].forfeited && attempts < roomData.turnOrder.length) {
        nextTurnIndex = (nextTurnIndex + 1) % roomData.turnOrder.length;
        attempts++;
      }

      roomData.currentTurnIndex = nextTurnIndex;

      return roomData;
    });

    if (result.committed) {
      const roomData = result.snapshot.val();
      const wasForfeited = roomData.players[uid].forfeited;

      // If game ended due to forfeit, handle payouts
      if (roomData.status === 'finished') {
        await handleGameFinalization(roomId, roomData);
      }

      logger.info('Player auto-skipped', { 
        roomId, 
        uid, 
        skipCount: roomData.players[uid].skipCount,
        forfeited: wasForfeited
      });

      return {
        skipCount: roomData.players[uid].skipCount,
        forfeited: wasForfeited,
        gameFinished: roomData.status === 'finished'
      };
    } else {
      throw new HttpsError('aborted', 'Failed to auto-skip due to concurrent modification');
    }

  } catch (error: any) {
    logger.error('Error auto-skipping', { error: error.message, roomId, uid });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to auto-skip');
  }
};

/**
 * Handle player forfeit
 */
export const handleForfeit = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId, uid: targetUid }: ForfeitRequest = request.data;
  const uid = targetUid || request.auth.uid;

  // TODO: Add authorization check (only self or admin can forfeit)

  try {
    const result = await db.ref(`rooms/${roomId}`).transaction((roomData) => {
      if (!roomData || roomData.status !== 'ongoing') {
        throw new HttpsError('failed-precondition', 'Game is not active');
      }

      if (!roomData.players[uid]) {
        throw new HttpsError('not-found', 'Player not in room');
      }

      if (roomData.players[uid].forfeited) {
        throw new HttpsError('already-exists', 'Player already forfeited');
      }

      // Mark player as forfeited
      roomData.players[uid].forfeited = true;

      // Add forfeit action
      const forfeitAction = {
        playerId: uid,
        action: 'forfeit',
        reason: 'manual',
        timestamp: Date.now(),
      };
      roomData.movesHistory.push(forfeitAction);

      // Check if only one player remains
      const activePlayers = Object.values(roomData.players).filter((p: any) => !p.forfeited);
      if (activePlayers.length === 1) {
        roomData.status = 'finished';
        roomData.endedAt = Date.now();
      } else if (activePlayers.length === 0) {
        // All players forfeited
        roomData.status = 'finished';
        roomData.endedAt = Date.now();
      }

      return roomData;
    });

    if (result.committed) {
      const roomData = result.snapshot.val();

      // If game ended, handle payouts
      if (roomData.status === 'finished') {
        await handleGameFinalization(roomId, roomData);
      }

      logger.info('Player forfeited', { roomId, uid });

      return {
        message: 'Player forfeited',
        gameFinished: roomData.status === 'finished'
      };
    }

  } catch (error: any) {
    logger.error('Error handling forfeit', { error: error.message, roomId, uid });
    throw new HttpsError('internal', 'Failed to handle forfeit');
  }
};

/**
 * Finalize game and distribute winnings
 */
export const finalizeGame = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId }: FinalizeGameRequest = request.data;

  try {
    const roomSnapshot = await db.ref(`rooms/${roomId}`).once('value');
    const roomData = roomSnapshot.val();

    if (!roomData) {
      throw new HttpsError('not-found', 'Room not found');
    }

    await handleGameFinalization(roomId, roomData);

    return { message: 'Game finalized successfully' };

  } catch (error: any) {
    logger.error('Error finalizing game', { error: error.message, roomId });
    throw new HttpsError('internal', 'Failed to finalize game');
  }
};

/**
 * Initialize board state for new game
 */
function initializeBoardState(playerIds: string[]) {
  // TODO: Implement actual Ludo board initialization
  // This should create the proper board state with player tokens, etc.
  
  const boardState = {
    players: {},
    // Add actual Ludo board state here
  };

  for (const playerId of playerIds) {
    boardState.players[playerId] = {
      tokens: [
        { id: 0, position: 'home' },
        { id: 1, position: 'home' },
        { id: 2, position: 'home' },
        { id: 3, position: 'home' },
      ]
    };
  }

  return boardState;
}

/**
 * Handle game finalization and payouts
 */
async function handleGameFinalization(roomId: string, roomData: any) {
  // Calculate winners
  const activePlayers = Object.values(roomData.players).filter((p: any) => !p.forfeited);
  
  if (activePlayers.length === 0) {
    // All forfeited - return money to all players
    logger.info('All players forfeited, returning bets', { roomId });
    
    for (const playerId in roomData.players) {
      await refundPlayerBet(playerId, roomData.betAmount, roomId);
    }
    
    return;
  }

  // Apply platform fee
  const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '0');
  const platformFee = roomData.potAmount * (platformFeePercent / 100);
  const netPot = roomData.potAmount - platformFee;

  // For now, winner takes all (first active player)
  // TODO: Implement proper Ludo winning logic
  const winner = activePlayers[0] as any;
  
  await creditPlayerWallet(winner.uid, netPot, roomId, 'win');

  logger.info('Game finalized', { 
    roomId, 
    winner: winner.uid, 
    winnings: netPot,
    platformFee 
  });
}

/**
 * Credit player wallet
 */
async function creditPlayerWallet(playerId: string, amount: number, roomId: string, type: string) {
  await db.ref(`users/${playerId}/walletBalance`).transaction((balance) => {
    return (balance || 0) + amount;
  });

  // Add transaction record
  const transactionId = db.ref(`users/${playerId}/transactions`).push().key;
  await db.ref(`users/${playerId}/transactions/${transactionId}`).set({
    type,
    amount,
    roomId,
    timestamp: Date.now(),
    status: 'completed',
    description: `Ludo game ${type} - Room ${roomId.slice(-6).toUpperCase()}`
  });
}

/**
 * Refund player bet
 */
async function refundPlayerBet(playerId: string, amount: number, roomId: string) {
  await creditPlayerWallet(playerId, amount, roomId, 'refund');
}