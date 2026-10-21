/**
 * DineEase Auth Context
 * Persistent authentication and profile state management
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.email : 'null');
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await authService.getUserProfile(currentUser.uid);
          setUserProfile(profile || {
            uid: currentUser.uid,
            fullName: currentUser.displayName || 'Food Enthusiast',
            email: currentUser.email,
          });
        } catch (e) {
          console.warn('Could not fetch user profile:', e);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const { user, profile } = await authService.login(email, password);
      setUser(user);
      setUserProfile(profile);
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const register = async (fullName, email, password, phone) => {
    setAuthError(null);
    try {
      const { user, profile } = await authService.register(fullName, email, password, phone);
      setUser(user);
      setUserProfile(profile);
      return { success: true };
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      await authService.sendPasswordReset(email);
      return true;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await authService.getUserProfile(user.uid);
      if (profile) setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthenticated: !!user,
        loading,
        authError,
        login,
        register,
        logout,
        resetPassword,
        refreshProfile,
        clearError: () => setAuthError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
