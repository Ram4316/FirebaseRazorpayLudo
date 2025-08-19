import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getAuth } from 'firebase-admin/auth';
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as logger from 'firebase-functions/logger';

// Game logic imports
import { createRoom } from './game/roomManager';
import { joinRoom } from './game/roomManager';
import { startGame } from './game/gameLogic';
import { serverRollDice } from './game/gameLogic';
import { autoSkip, handleForfeit } from './game/gameLogic';
import { finalizeGame } from './game/gameLogic';

// Payment imports  
import { createRazorpayOrder, razorpayWebhook, requestWithdrawal } from './payments/razorpay';

// Initialize Firebase Admin
initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

// Set global options
setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
});

// Export all Cloud Functions

// Room Management Functions
export const createRoomFunction = onCall(createRoom);
export const joinRoomFunction = onCall(joinRoom);

// Game Logic Functions  
export const startGameFunction = onCall(startGame);
export const serverRollDiceFunction = onCall(serverRollDice);
export const autoSkipFunction = onCall(autoSkip);
export const handleForfeitFunction = onCall(handleForfeit);
export const finalizeGameFunction = onCall(finalizeGame);

// Payment Functions
export const createRazorpayOrderFunction = onCall(createRazorpayOrder);
export const razorpayWebhookFunction = onRequest(razorpayWebhook);
export const requestWithdrawalFunction = onCall(requestWithdrawal);

// Health check function
export const healthCheck = onCall(async (request) => {
  logger.info('Health check called', { uid: request.auth?.uid });
  
  return {
    status: 'healthy',
    timestamp: Date.now(),
    version: '1.0.0'
  };
});

// TODO: Add more functions as needed:
// - readyPlayer
// - leaveRoom  
// - getGameHistory
// - getUserStats
// - adminFunctions (ban users, manage disputes)