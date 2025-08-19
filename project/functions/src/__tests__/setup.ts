// Test setup for Firebase Functions
// This file runs before all tests

import { setGlobalOptions } from 'firebase-functions/v2';

// Set test environment variables
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST = 'localhost:5001';

// Test Razorpay credentials
process.env.RAZORPAY_KEY_ID = 'rzp_test_fake_key_id';
process.env.RAZORPAY_KEY_SECRET = 'fake_test_secret';
process.env.WEBHOOK_SECRET = 'test_webhook_secret_123';
process.env.PLATFORM_FEE_PERCENT = '0';

// Disable Firebase Functions authentication for tests
setGlobalOptions({
  region: 'us-central1',
});

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error, // Keep errors visible
};