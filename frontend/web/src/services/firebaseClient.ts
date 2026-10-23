/**
 * DineEase Unified Firebase & State Client
 * Supports both Live Firebase (Auth & Firestore) and seamless Local Simulation
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { INITIAL_RESTAURANTS, INITIAL_MENU_ITEMS } from '../data/seedData.js';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
  role?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  totalItemPrice: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  phone: string;
  notes?: string;
  paymentMethod: string;
  status: 'placed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  bookingDate: string;
  timeSlot: string;
  guestCount: number;
  customerName: string;
  contactNumber: string;
  specialRequest?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: string;
  cancellationReason?: string;
}

// Check if valid Firebase configuration is present
const hasLiveConfig = Boolean(
  (import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY) &&
  (import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID)
);

let liveApp: any = null;
let liveAuth: any = null;
let liveDb: any = null;

if (hasLiveConfig) {
  try {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || import.meta.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    liveApp = getApps().length === 0 ? initializeApp(config) : getApp();
    liveAuth = getAuth(liveApp);
    liveDb = getFirestore(liveApp);
  } catch (err) {
    console.warn('Live Firebase initialization error, falling back to local simulation:', err);
  }
}

// Local simulation fallback storage keys
const STORAGE_USER_KEY = 'dineease_sim_user';
const STORAGE_ORDERS_KEY = 'dineease_sim_orders';
const STORAGE_BOOKINGS_KEY = 'dineease_sim_bookings';

class DineEaseStorage {
  private static defaultUser: UserProfile = {
    uid: 'user_demo_101',
    fullName: 'Atif Khan',
    email: 'atifkhan97401@gmail.com',
    phone: '+92 300 1234567',
    createdAt: new Date().toISOString(),
    role: 'customer'
  };

  private static defaultBookings: Booking[] = [
    {
      id: 'book_sample_01',
      userId: 'user_demo_101',
      restaurantId: 'rest_lalqila',
      restaurantName: 'LalQila Traditional Feast',
      bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      timeSlot: '07:30 PM',
      guestCount: 4,
      customerName: 'Atif Khan',
      contactNumber: '+92 300 1234567',
      specialRequest: 'Window booth please',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    }
  ];

  private static defaultOrders: Order[] = [
    {
      id: 'ord_sample_98',
      userId: 'user_demo_101',
      customerName: 'Atif Khan',
      restaurantId: 'rest_bellaroma',
      restaurantName: 'Bella Roma Trattoria',
      items: [
        {
          id: 'menu_br_1',
          name: 'Margherita Burrata D.O.P.',
          price: 12.00,
          quantity: 1,
          totalItemPrice: 12.00
        },
        {
          id: 'menu_br_4',
          name: 'Espresso Classic Tiramisu',
          price: 5.50,
          quantity: 2,
          totalItemPrice: 11.00
        }
      ],
      subtotal: 23.00,
      deliveryFee: 4.00,
      total: 27.00,
      deliveryAddress: 'Sector F-7/2, Street 18, Islamabad',
      phone: '+92 300 1234567',
      notes: 'Please ring bell upon arrival',
      paymentMethod: 'Cash on Delivery',
      status: 'delivered',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  static getUser(): UserProfile | null {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(this.defaultUser));
      return this.defaultUser;
    }
    return JSON.parse(raw);
  }

  static setUser(user: UserProfile | null) {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }

  static getBookings(): Booking[] {
    const raw = localStorage.getItem(STORAGE_BOOKINGS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(this.defaultBookings));
      return this.defaultBookings;
    }
    return JSON.parse(raw);
  }

  static saveBooking(booking: Booking): Booking {
    const all = this.getBookings();
    const updated = [booking, ...all];
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
    return booking;
  }

  static updateBookingStatus(id: string, status: 'cancelled' | 'confirmed', reason?: string) {
    const all = this.getBookings();
    const updated = all.map(b => b.id === id ? { ...b, status, cancellationReason: reason } : b);
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(updated));
  }

  static getOrders(): Order[] {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(this.defaultOrders));
      return this.defaultOrders;
    }
    return JSON.parse(raw);
  }

  static saveOrder(order: Order): Order {
    const all = this.getOrders();
    const updated = [order, ...all];
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(updated));
    return order;
  }
}

export const unifiedService = {
  isLiveFirebaseConfigured: hasLiveConfig && !!liveDb,

  // User Auth
  async getCurrentUser(): Promise<UserProfile | null> {
    if (liveAuth && liveAuth.currentUser) {
      const docSnap = await getDoc(doc(liveDb, 'users', liveAuth.currentUser.uid));
      if (docSnap.exists()) return docSnap.data() as UserProfile;
    }
    return DineEaseStorage.getUser();
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (liveAuth) {
      const res = await signInWithEmailAndPassword(liveAuth, email, password);
      const docSnap = await getDoc(doc(liveDb, 'users', res.user.uid));
      if (docSnap.exists()) return docSnap.data() as UserProfile;
      return {
        uid: res.user.uid,
        fullName: res.user.displayName || email.split('@')[0],
        email: res.user.email || email,
        createdAt: new Date().toISOString()
      };
    }
    // Simulation
    const user: UserProfile = {
      uid: `usr_${Date.now()}`,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      phone: '+92 300 1234567',
      createdAt: new Date().toISOString(),
      role: 'customer'
    };
    DineEaseStorage.setUser(user);
    return user;
  },

  async register(fullName: string, email: string, password: string, phone: string = ''): Promise<UserProfile> {
    if (liveAuth) {
      const res = await createUserWithEmailAndPassword(liveAuth, email, password);
      await updateProfile(res.user, { displayName: fullName });
      const profile: UserProfile = {
        uid: res.user.uid,
        fullName,
        email,
        phone,
        createdAt: new Date().toISOString(),
        role: 'customer'
      };
      await setDoc(doc(liveDb, 'users', res.user.uid), profile);
      return profile;
    }
    // Simulation
    const user: UserProfile = {
      uid: `usr_${Date.now()}`,
      fullName,
      email,
      phone,
      createdAt: new Date().toISOString(),
      role: 'customer'
    };
    DineEaseStorage.setUser(user);
    return user;
  },

  async logout(): Promise<void> {
    if (liveAuth) {
      await signOut(liveAuth);
    }
    DineEaseStorage.setUser(null);
  },

  // Restaurants
  async getRestaurants() {
    if (liveDb) {
      try {
        const snap = await getDocs(collection(liveDb, 'restaurants'));
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        console.warn('Firestore fetch failed, using local restaurants:', e);
      }
    }
    return INITIAL_RESTAURANTS;
  },

  // Menu items
  async getMenuItems(restaurantId?: string) {
    if (liveDb) {
      try {
        const snap = await getDocs(collection(liveDb, 'menuItems'));
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          return restaurantId ? list.filter((i: any) => i.restaurantId === restaurantId) : list;
        }
      } catch (e) {
        console.warn('Firestore menu items fetch failed:', e);
      }
    }
    return restaurantId
      ? INITIAL_MENU_ITEMS.filter(i => i.restaurantId === restaurantId)
      : INITIAL_MENU_ITEMS;
  },

  // Orders
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const orderId = `ord_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 5)}`;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: 'placed',
      createdAt: new Date().toISOString()
    };

    if (liveDb) {
      try {
        await setDoc(doc(liveDb, 'orders', orderId), newOrder);
      } catch (e) {
        console.warn('Firestore order write error:', e);
      }
    }
    return DineEaseStorage.saveOrder(newOrder);
  },

  async getOrders(userId?: string): Promise<Order[]> {
    if (liveDb && userId) {
      try {
        const q = query(collection(liveDb, 'orders'), where('userId', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
        }
      } catch (e) {
        console.warn('Firestore orders fetch failed:', e);
      }
    }
    const all = DineEaseStorage.getOrders();
    return userId ? all.filter(o => o.userId === userId) : all;
  },

  // Bookings
  async createBooking(bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<Booking> {
    const bookingId = `book_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 5)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: bookingId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    if (liveDb) {
      try {
        await setDoc(doc(liveDb, 'bookings', bookingId), newBooking);
      } catch (e) {
        console.warn('Firestore booking write error:', e);
      }
    }
    return DineEaseStorage.saveBooking(newBooking);
  },

  async getBookings(userId?: string): Promise<Booking[]> {
    if (liveDb && userId) {
      try {
        const q = query(collection(liveDb, 'bookings'), where('userId', '==', userId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Booking[];
        }
      } catch (e) {
        console.warn('Firestore bookings fetch failed:', e);
      }
    }
    const all = DineEaseStorage.getBookings();
    return userId ? all.filter(b => b.userId === userId) : all;
  },

  async cancelBooking(bookingId: string, reason = 'Cancelled by guest'): Promise<void> {
    if (liveDb) {
      try {
        await updateDoc(doc(liveDb, 'bookings', bookingId), {
          status: 'cancelled',
          cancellationReason: reason,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Firestore cancel booking error:', e);
      }
    }
    DineEaseStorage.updateBookingStatus(bookingId, 'cancelled', reason);
  }
};
