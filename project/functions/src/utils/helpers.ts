import { randomBytes } from 'crypto';

/**
 * Generate a unique room ID
 */
export function generateRoomId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString('hex');
  return `room_${timestamp}_${random}`;
}

/**
 * Generate a secure random integer between min and max (inclusive)
 */
export function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  const randomBytes = require('crypto').randomBytes(4);
  const randomInt = randomBytes.readUInt32BE(0);
  return min + (randomInt % range);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate transaction ID
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(6).toString('hex').toUpperCase();
  return `TXN${timestamp}${random}`;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number, feePercent: number): number {
  return Math.round((amount * feePercent / 100) * 100) / 100; // Round to 2 decimal places
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * Validate room configuration
 */
export function validateRoomConfig(betAmount: number, maxPlayers: number): { valid: boolean; error?: string } {
  const validBetAmounts = [2, 5, 10, 20, 50, 100];
  
  if (!validBetAmounts.includes(betAmount)) {
    return { valid: false, error: 'Invalid bet amount' };
  }
  
  if (maxPlayers < 2 || maxPlayers > 4) {
    return { valid: false, error: 'Max players must be between 2 and 4' };
  }
  
  return { valid: true };
}

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Sleep utility for testing
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}