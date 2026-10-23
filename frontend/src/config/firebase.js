import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDhB0DUSzLHHw3tNGn2f832s5z68RiKO7M",
  authDomain: "my-resturentapp.firebaseapp.com",
  projectId: "my-resturentapp",
  storageBucket: "my-resturentapp.firebasestorage.app",
  messagingSenderId: "1031647269702",
  appId: "1:1031647269702:web:029be3be58150417080b47",
  measurementId: "G-5H58Z6V0LF",
};

// Initialize Firebase App instance singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence for React Native / Expo
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
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