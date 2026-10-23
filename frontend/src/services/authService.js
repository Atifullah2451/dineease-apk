import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

export const authService = {
  /**
   * Register a new user with Firebase Auth and create Firestore profile
   */
  async register(fullName, email, password, phone = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // Update Firebase Auth profile display name
      await updateProfile(user, { displayName: fullName.trim() });

      // Save user profile document in Firestore 'users' collection
      const userDocRef = doc(db, 'users', user.uid);
      const userProfile = {
        uid: user.uid,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '',
        createdAt: new Date().toISOString(),
        role: 'customer'
      };

      await setDoc(userDocRef, userProfile);

      return { user, profile: userProfile };
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  /**
   * Sign in user with email and password
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      
      const profile = await this.getUserProfile(user.uid);
      return { user, profile };
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  /**
   * Sign out current user
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error(error.message || 'Failed to log out.');
    }
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(email) {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error) {
      throw new Error(formatAuthError(error));
    }
  },

  /**
   * Fetch user profile from Firestore
   */
  async getUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.warn('Could not fetch user profile from Firestore:', error);
      return null;
    }
  },

  /**
   * Update permitted profile fields in Firestore
   */
  async updateProfile(uid, data) {
    try {
      const docRef = doc(db, 'users', uid);
      const allowedData = {
        fullName: data.fullName,
        phone: data.phone,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, allowedData);
      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile.');
    }
  }
};

/**
 * Format Firebase Auth error codes into friendly human-readable strings
 */
function formatAuthError(error) {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'The email address format is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a moment and try again.';
    default:
      return error.message || 'An unexpected authentication error occurred.';
  }
}
