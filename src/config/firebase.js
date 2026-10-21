import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth,
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDhB0DUSzLHHw3tNGn2f832s5z68RiKO7M',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'my-resturentapp.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'my-resturentapp',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'my-resturentapp.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1031647269702',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:1031647269702:web:029be3be58150417080b47',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-5H58Z6V0LF',
};

// Initialize Firebase App instance singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for React Native / Expo
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // For native Android/iOS in Expo Go:
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (e) {
  // If already initialized
  auth = getAuth(app);
}

// Initialize Cloud Firestore
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };
