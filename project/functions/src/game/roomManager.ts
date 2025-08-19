import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';
import { HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { generateRoomId } from '../utils/helpers';

const db = getDatabase();

// Valid bet amounts (in ₹)
const VALID_BET_AMOUNTS = [2, 5, 10, 20, 50, 100];

interface CreateRoomRequest {
  betAmount: number;
  maxPlayers: number;
}

interface JoinRoomRequest {
  roomId: string;
}

interface Player {
  uid: string;
  displayName: string;
  avatar?: string;
  ready: boolean;
  skipCount: number;
  forfeited: boolean;
  walletLockedAmount: number;
}

interface Room {
  roomId: string;
  betAmount: number;
  maxPlayers: number;
  status: 'waiting' | 'ready' | 'ongoing' | 'finished';
  players: { [uid: string]: Player };
  turnOrder: string[];
  currentTurnIndex: number;
  boardState: any;
  diceHistory: any[];
  movesHistory: any[];
  potAmount: number;
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
}

/**
 * Create a new game room
 */
export const createRoom = async (request: any) => {
  // Authenticate user
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { betAmount, maxPlayers = 4 }: CreateRoomRequest = request.data;
  const uid = request.auth.uid;

  // Validate bet amount
  if (!VALID_BET_AMOUNTS.includes(betAmount)) {
    throw new HttpsError('invalid-argument', 'Invalid bet amount');
  }

  // Validate max players
  if (maxPlayers < 2 || maxPlayers > 4) {
    throw new HttpsError('invalid-argument', 'Max players must be between 2 and 4');
  }

  try {
    // Get user info
    const userRecord = await getAuth().getUser(uid);
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      throw new HttpsError('not-found', 'User data not found');
    }

    // Check if user has sufficient balance
    if (userData.walletBalance < betAmount) {
      throw new HttpsError('failed-precondition', 'Insufficient wallet balance');
    }

    // Generate unique room ID
    const roomId = generateRoomId();

    // Create initial board state
    const initialBoardState = {
      players: {},
      // TODO: Initialize proper Ludo board state
    };

    // Create player object
    const player: Player = {
      uid,
      displayName: userRecord.displayName || userRecord.email || 'Anonymous',
      avatar: userRecord.photoURL,
      ready: false,
      skipCount: 0,
      forfeited: false,
      walletLockedAmount: 0,
    };

    // Create room object
    const room: Room = {
      roomId,
      betAmount,
      maxPlayers,
      status: 'waiting',
      players: {
        [uid]: player
      },
      turnOrder: [],
      currentTurnIndex: 0,
      boardState: initialBoardState,
      diceHistory: [],
      movesHistory: [],
      potAmount: 0,
      createdAt: Date.now(),
    };

    // Save room to database
    await db.ref(`rooms/${roomId}`).set(room);

    logger.info('Room created', { roomId, uid, betAmount, maxPlayers });

    return {
      roomId,
      message: 'Room created successfully'
    };

  } catch (error: any) {
    logger.error('Error creating room', { error: error.message, uid });
    throw new HttpsError('internal', 'Failed to create room');
  }
};

/**
 * Join an existing game room
 */
export const joinRoom = async (request: any) => {
  // Authenticate user
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { roomId }: JoinRoomRequest = request.data;
  const uid = request.auth.uid;

  if (!roomId) {
    throw new HttpsError('invalid-argument', 'Room ID is required');
  }

  try {
    // Get room data
    const roomSnapshot = await db.ref(`rooms/${roomId}`).once('value');
    if (!roomSnapshot.exists()) {
      throw new HttpsError('not-found', 'Room not found');
    }

    const roomData = roomSnapshot.val() as Room;

    // Check room status
    if (roomData.status !== 'waiting') {
      throw new HttpsError('failed-precondition', 'Room is not accepting new players');
    }

    // Check if room is full
    const currentPlayers = Object.keys(roomData.players).length;
    if (currentPlayers >= roomData.maxPlayers) {
      throw new HttpsError('failed-precondition', 'Room is full');
    }

    // Check if user is already in room
    if (roomData.players[uid]) {
      throw new HttpsError('already-exists', 'User already in room');
    }

    // Get user info and check wallet balance
    const userRecord = await getAuth().getUser(uid);
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    if (!userData) {
      throw new HttpsError('not-found', 'User data not found');
    }

    if (userData.walletBalance < roomData.betAmount) {
      throw new HttpsError('failed-precondition', 'Insufficient wallet balance');
    }

    // Create player object
    const player: Player = {
      uid,
      displayName: userRecord.displayName || userRecord.email || 'Anonymous',
      avatar: userRecord.photoURL,
      ready: false,
      skipCount: 0,
      forfeited: false,
      walletLockedAmount: 0,
    };

    // Add player to room
    await db.ref(`rooms/${roomId}/players/${uid}`).set(player);

    // Log the join
    const joinLog = {
      uid,
      action: 'join',
      timestamp: Date.now()
    };
    await db.ref(`rooms/${roomId}/movesHistory`).push(joinLog);

    logger.info('Player joined room', { roomId, uid });

    return {
      message: 'Joined room successfully',
      roomData: {
        ...roomData,
        players: {
          ...roomData.players,
          [uid]: player
        }
      }
    };

  } catch (error: any) {
    logger.error('Error joining room', { error: error.message, roomId, uid });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to join room');
  }
};

// TODO: Implement additional room management functions:
// - readyPlayer(roomId)
// - leaveRoom(roomId) 
// - getRoomDetails(roomId)
// - listAvailableRooms()