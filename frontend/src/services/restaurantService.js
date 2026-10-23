/**
 * DineEase Restaurant & Menu Service
 * Connects to Firestore with graceful fallback to seed data
 */

import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS } from '../data/seedData.js';

export const restaurantService = {
  /**
   * Fetch all active restaurants
   */
  async getRestaurants() {
    try {
      const q = query(collection(db, 'restaurants'), where('isActive', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const list = [];
        querySnapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() });
        });
        return list;
      }
      // If collection is not seeded yet, return initial data
      return INITIAL_RESTAURANTS;
    } catch (error) {
      console.warn('Firestore restaurants fetch error, falling back to local data:', error);
      return INITIAL_RESTAURANTS;
    }
  },

  /**
   * Fetch a single restaurant by ID
   */
  async getRestaurantById(restaurantId) {
    try {
      const docRef = doc(db, 'restaurants', restaurantId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return INITIAL_RESTAURANTS.find(r => r.id === restaurantId) || null;
    } catch (error) {
      return INITIAL_RESTAURANTS.find(r => r.id === restaurantId) || null;
    }
  },

  /**
   * Fetch menu items for a specific restaurant
   */
  async getMenuItems(restaurantId) {
    try {
      const q = query(
        collection(db, 'menuItems'), 
        where('restaurantId', '==', restaurantId),
        where('isAvailable', '==', true)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const items = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        return items;
      }
      return INITIAL_MENU_ITEMS.filter(item => item.restaurantId === restaurantId);
    } catch (error) {
      console.warn('Firestore menu items fetch error, using local data:', error);
      return INITIAL_MENU_ITEMS.filter(item => item.restaurantId === restaurantId);
    }
  },

  /**
   * Fetch all menu items across all restaurants (for dish search)
   */
  async getAllMenuItems() {
    try {
      const querySnapshot = await getDocs(collection(db, 'menuItems'));
      if (!querySnapshot.empty) {
        const items = [];
        querySnapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() });
        });
        return items;
      }
      return INITIAL_MENU_ITEMS;
    } catch (error) {
      return INITIAL_MENU_ITEMS;
    }
  }
};
