// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import Constants from 'expo-constants';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  databaseURL: Constants.expoConfig?.extra?.firebaseDatabaseUrl,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (__DEV__) {
  try {
    // Connect to Auth Emulator
    if (!auth._delegate._authProvider.isConnected) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    }

    // Connect to Database Emulator
    if (!database._delegate._connected) {
      connectDatabaseEmulator(database, 'localhost', 9000);
    }

    // Connect to Functions Emulator
    if (!functions._delegate._customDomain) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
    }
  } catch (error) {
    console.log('Emulator connection error (may already be connected):', error);
  }
}

export default app;