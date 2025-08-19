import { getDatabase } from 'firebase-admin/database';
import { HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { createHash, createHmac } from 'crypto';

// Import Razorpay (using require for compatibility)
const Razorpay = require('razorpay');

const db = getDatabase();

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

interface CreateOrderRequest {
  amount: number; // Amount in ₹
}

interface WithdrawalRequest {
  amount: number;
}

/**
 * Create Razorpay order for deposits
 * Server-side order creation for security
 */
export const createRazorpayOrder = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount }: CreateOrderRequest = request.data;
  const uid = request.auth.uid;

  // Validate amount
  if (!amount || amount <= 0 || amount > 10000) {
    throw new HttpsError('invalid-argument', 'Invalid amount (₹1 - ₹10,000 allowed)');
  }

  try {
    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `deposit_${uid}_${Date.now()}`,
      notes: {
        userId: uid,
        type: 'wallet_deposit'
      }
    });

    // Store order in database for verification
    await db.ref(`pending_orders/${order.id}`).set({
      orderId: order.id,
      userId: uid,
      amount: amount,
      currency: 'INR',
      status: 'created',
      createdAt: Date.now(),
      expiresAt: Date.now() + (15 * 60 * 1000), // 15 minutes
    });

    logger.info('Razorpay order created', { 
      orderId: order.id, 
      uid, 
      amount 
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };

  } catch (error: any) {
    logger.error('Error creating Razorpay order', { 
      error: error.message, 
      uid, 
      amount 
    });
    
    throw new HttpsError('internal', 'Failed to create payment order');
  }
};

/**
 * Razorpay webhook handler
 * Verifies payment signature and credits user wallet
 */
export const razorpayWebhook = async (request: any, response: any) => {
  try {
    const body = request.body;
    const signature = request.headers['x-razorpay-signature'];

    if (!signature) {
      logger.warn('Webhook received without signature');
      response.status(400).send('Missing signature');
      return;
    }

    // Verify webhook signature
    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('Webhook secret not configured');
      response.status(500).send('Webhook not configured');
      return;
    }

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      logger.warn('Invalid webhook signature', { signature, expectedSignature });
      response.status(400).send('Invalid signature');
      return;
    }

    const event = body.event;
    const payload = body.payload.payment.entity;

    // Handle payment.captured event
    if (event === 'payment.captured') {
      await handlePaymentCaptured(payload);
    }

    // Handle payment.failed event  
    else if (event === 'payment.failed') {
      await handlePaymentFailed(payload);
    }

    logger.info('Webhook processed successfully', { event, paymentId: payload.id });
    response.status(200).send('OK');

  } catch (error: any) {
    logger.error('Webhook processing error', { error: error.message });
    response.status(500).send('Internal server error');
  }
};

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payment: any) {
  const orderId = payment.order_id;
  const paymentId = payment.id;
  const amount = payment.amount / 100; // Convert from paise to ₹

  try {
    // Get pending order
    const orderSnapshot = await db.ref(`pending_orders/${orderId}`).once('value');
    
    if (!orderSnapshot.exists()) {
      logger.warn('Payment received for unknown order', { orderId, paymentId });
      return;
    }

    const orderData = orderSnapshot.val();
    const userId = orderData.userId;

    // Validate payment amount
    if (Math.abs(amount - orderData.amount) > 0.01) {
      logger.error('Payment amount mismatch', { 
        orderId, 
        paymentId, 
        expected: orderData.amount, 
        received: amount 
      });
      return;
    }

    // Credit user wallet atomically
    await db.ref(`users/${userId}/walletBalance`).transaction((balance) => {
      return (balance || 0) + amount;
    });

    // Record transaction
    const transactionId = db.ref(`users/${userId}/transactions`).push().key;
    await db.ref(`users/${userId}/transactions/${transactionId}`).set({
      type: 'deposit',
      amount: amount,
      paymentId: paymentId,
      orderId: orderId,
      timestamp: Date.now(),
      status: 'completed',
      description: `Wallet deposit via Razorpay`
    });

    // Mark order as completed
    await db.ref(`pending_orders/${orderId}`).update({
      status: 'completed',
      paymentId: paymentId,
      completedAt: Date.now()
    });

    logger.info('Payment processed successfully', { 
      userId, 
      amount, 
      paymentId, 
      orderId 
    });

  } catch (error: any) {
    logger.error('Error processing payment', { 
      error: error.message, 
      orderId, 
      paymentId 
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payment: any) {
  const orderId = payment.order_id;
  const paymentId = payment.id;

  try {
    // Mark order as failed
    await db.ref(`pending_orders/${orderId}`).update({
      status: 'failed',
      paymentId: paymentId,
      failedAt: Date.now(),
      errorCode: payment.error_code,
      errorDescription: payment.error_description
    });

    logger.info('Payment failed', { paymentId, orderId });

  } catch (error: any) {
    logger.error('Error handling failed payment', { 
      error: error.message, 
      orderId, 
      paymentId 
    });
  }
}

/**
 * Request withdrawal (stub implementation)
 * TODO: Implement KYC verification and actual payouts for production
 */
export const requestWithdrawal = async (request: any) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { amount }: WithdrawalRequest = request.data;
  const uid = request.auth.uid;

  // Validate amount
  if (!amount || amount <= 0 || amount > 50000) {
    throw new HttpsError('invalid-argument', 'Invalid withdrawal amount (₹1 - ₹50,000 allowed)');
  }

  try {
    // Check user balance
    const userSnapshot = await db.ref(`users/${uid}`).once('value');
    const userData = userSnapshot.val();

    if (!userData || userData.walletBalance < amount) {
      throw new HttpsError('failed-precondition', 'Insufficient balance');
    }

    // TODO: Production implementation:
    // 1. Verify KYC status
    // 2. Check withdrawal limits
    // 3. Create Razorpay payout
    // 4. Handle payout webhook
    
    // Test mode: Just add to pending withdrawals
    const withdrawalId = db.ref(`users/${uid}/pendingWithdrawals`).push().key;
    await db.ref(`users/${uid}/pendingWithdrawals/${withdrawalId}`).set({
      id: withdrawalId,
      amount: amount,
      status: 'pending',
      requestedAt: Date.now(),
      // TODO: Add bank details, KYC info, etc.
    });

    // Record transaction
    const transactionId = db.ref(`users/${uid}/transactions`).push().key;
    await db.ref(`users/${uid}/transactions/${transactionId}`).set({
      type: 'withdrawal',
      amount: amount,
      withdrawalId: withdrawalId,
      timestamp: Date.now(),
      status: 'pending',
      description: `Withdrawal request - Test mode`
    });

    logger.info('Withdrawal requested', { uid, amount, withdrawalId });

    return {
      withdrawalId,
      message: 'Withdrawal request submitted (test mode)',
      note: 'This is test mode. Production requires KYC verification.'
    };

  } catch (error: any) {
    logger.error('Error requesting withdrawal', { 
      error: error.message, 
      uid, 
      amount 
    });
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', 'Failed to process withdrawal request');
  }
};