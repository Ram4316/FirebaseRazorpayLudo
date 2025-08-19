# Real-Money Ludo Game - Full-Stack Scaffold

A production-ready real-money Ludo game built with Expo React Native and Firebase.

## 🏗️ Project Structure

```
├── app/                    # Expo React Native Frontend (TypeScript)
├── functions/              # Firebase Cloud Functions Backend (TypeScript)
├── firebase.json          # Firebase configuration
├── database.rules.json    # Realtime Database security rules
└── README.md              # This file
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- Firebase CLI: `npm install -g firebase-tools`
- Android Studio (for Android development)

### 2. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Phone)
3. Enable Realtime Database
4. Enable Cloud Functions
5. Download `google-services.json` and place it in `app/`
6. Get your Firebase web config and update `app/src/config/firebase.ts`

### 3. Razorpay Setup

1. Create Razorpay account at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Get your Test API Keys (Key ID and Key Secret)
3. Set up webhook endpoint for payment verification

### 4. Environment Configuration

#### Frontend (`app/.env`)
```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

#### Backend (`functions/.env`)
```bash
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
PLATFORM_FEE_PERCENT=0
WEBHOOK_SECRET=your_webhook_secret
```

### 5. Installation & Setup

```bash
# Install frontend dependencies
cd app
npm install

# Install backend dependencies
cd ../functions
npm install

# Initialize Firebase (from project root)
firebase login
firebase use --add  # Select your Firebase project
```

### 6. Local Development with Firebase Emulator Suite

```bash
# Start Firebase Emulators
firebase emulators:start

# In another terminal, start Expo dev server
cd app
npm start
```

The emulators will run on:
- Auth Emulator: http://localhost:9099
- Realtime Database: http://localhost:9000
- Functions: http://localhost:5001
- Emulator UI: http://localhost:4000

### 7. Testing Payments Locally

1. Use Razorpay test keys in emulator environment
2. Test webhook using ngrok or similar tunnel service
3. Use test card numbers from Razorpay documentation

## 📱 App Features

### ✅ Implemented Features
- User authentication (Email/Phone + Google OAuth)
- Wallet system with Razorpay deposits
- Room creation and joining (₹2, ₹5, ₹10, ₹20, ₹50, ₹100 bets)
- Real-time multiplayer game state
- Server-side dice rolling and move validation
- 30-second turn timers with auto-skip
- Automatic forfeit after 3 skips
- Secure wallet transactions
- Game history and audit logs
- Firebase security rules

### 🔄 TODO: Production Hardening
- [ ] KYC verification for withdrawals
- [ ] Rate limiting on Cloud Functions
- [ ] Advanced fraud detection
- [ ] Push notifications
- [ ] Admin dashboard
- [ ] Analytics integration
- [ ] Crash reporting

## 🔧 Development Commands

```bash
# Frontend (app/)
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run build      # Build for production
npm test           # Run tests

# Backend (functions/)
npm run build      # Build TypeScript
npm run serve      # Serve functions locally
npm run deploy     # Deploy to Firebase
npm test           # Run unit tests

# Firebase
firebase deploy --only functions    # Deploy functions only
firebase deploy --only database     # Deploy database rules
```

## 🧪 Testing

### Unit Tests
```bash
# Test Cloud Functions
cd functions
npm test

# Test React Native components
cd app
npm test
```

### Integration Tests with Emulator
```bash
# Start emulators
firebase emulators:exec --only auth,database,functions "npm test"
```

## 🔒 Security

### Firebase Security Rules
- Users can only read/write their own data
- Game state modifications restricted to Cloud Functions
- Wallet operations require authentication
- Audit logs are write-only for functions

### Payment Security
- All order creation happens server-side
- Webhook signature verification implemented
- No sensitive payment data stored client-side

## 🚀 Deployment

### Switch to Firebase Blaze Plan
1. Upgrade your Firebase project to Blaze plan
2. Enable billing alerts
3. Update environment variables for production

### Production Deployment
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only database
```

## 📊 Database Schema

### Users Collection
```json
{
  "users": {
    "uid": {
      "uid": "string",
      "name": "string",
      "avatar": "string",
      "walletBalance": 0,
      "pendingWithdrawals": [],
      "transactions": []
    }
  }
}
```

### Rooms Collection
```json
{
  "rooms": {
    "roomId": {
      "roomId": "string",
      "betAmount": 10,
      "maxPlayers": 4,
      "status": "waiting|ready|ongoing|finished",
      "players": {},
      "turnOrder": [],
      "currentTurnIndex": 0,
      "boardState": {},
      "diceHistory": [],
      "movesHistory": [],
      "potAmount": 40,
      "createdAt": "timestamp",
      "startedAt": "timestamp",
      "endedAt": "timestamp"
    }
  }
}
```

## 🎯 Game Rules

1. **Turn Timer**: 30 seconds per turn
2. **Auto-Skip**: Missing 3 turns results in forfeit
3. **Server Authority**: All dice rolls and moves validated server-side
4. **Atomic Transactions**: Wallet operations use Firebase transactions
5. **Audit Trail**: All game actions logged for dispute resolution

## 🔧 Troubleshooting

### Common Issues
1. **Emulator Connection**: Ensure emulators are running before starting app
2. **Android Build**: Make sure `google-services.json` is in the correct location
3. **Payment Webhook**: Use ngrok for local webhook testing

### Support
- Check Firebase Console for function logs
- Use Expo development build for debugging
- Test payment flows in Razorpay dashboard

## 📄 License

This project is licensed under the MIT License.