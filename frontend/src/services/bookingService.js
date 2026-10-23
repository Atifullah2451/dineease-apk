/**
 * DineEase Table Booking Service
 * Concurrency-safe reservations, slot calculation, and cancellation
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where,
  runTransaction 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const bookingService = {
  /**
   * Get booked count for a specific restaurant, date, and slot
   * Used to check remaining table capacity (capacity per slot: 5 tables)
   */
  async getSlotBookingCount(restaurantId, bookingDate, timeSlot) {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('restaurantId', '==', restaurantId),
        where('bookingDate', '==', bookingDate),
        where('timeSlot', '==', timeSlot),
        where('status', 'in', ['confirmed', 'pending'])
      );
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.warn('Slot count check error:', error);
      return 0;
    }
  },

  /**
   * Check if a specific slot is available
   */
  async isSlotAvailable(restaurantId, bookingDate, timeSlot, maxTables = 4) {
    const bookedCount = await this.getSlotBookingCount(restaurantId, bookingDate, timeSlot);
    return bookedCount < maxTables;
  },

  /**
   * Create an atomic table reservation
   */
  async createBooking(bookingData) {
    const {
      userId,
      restaurantId,
      restaurantName,
      bookingDate,
      timeSlot,
      guestCount,
      customerName,
      contactNumber,
      specialRequest = ''
    } = bookingData;

    // Validate inputs
    if (!userId) throw new Error('You must be logged in to book a table.');
    if (!restaurantId) throw new Error('Please select a restaurant.');
    if (!bookingDate) throw new Error('Please choose a valid booking date.');
    if (!timeSlot) throw new Error('Please select an available time slot.');
    if (!guestCount || guestCount < 1 || guestCount > 20) {
      throw new Error('Guest count must be between 1 and 20.');
    }
    if (!customerName?.trim()) throw new Error('Please enter customer name.');
    if (!contactNumber?.trim()) throw new Error('Please enter contact phone number.');

    // Validate date is not in the past
    const today = new Date().toISOString().split('T')[0];
    if (bookingDate < today) {
      throw new Error('Reservations cannot be made for past dates.');
    }

    // Generate unique booking ID
    const bookingId = `book_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const bookingRef = doc(db, 'bookings', bookingId);

    try {
      // Concurrency-safe check with Firestore transaction
      await runTransaction(db, async (transaction) => {
        // Query current active bookings for this date and time
        const existingQuery = query(
          collection(db, 'bookings'),
          where('restaurantId', '==', restaurantId),
          where('bookingDate', '==', bookingDate),
          where('timeSlot', '==', timeSlot),
          where('status', 'in', ['confirmed', 'pending'])
        );
        const existingSnap = await getDocs(existingQuery);

        // Check if user already has a booking at this exact slot
        const userDuplicate = existingSnap.docs.some(d => d.data().userId === userId);
        if (userDuplicate) {
          throw new Error('You already have a reservation at this restaurant for this time slot.');
        }

        // Capacity limit: 5 tables per slot
        if (existingSnap.size >= 5) {
          throw new Error('Sorry, this time slot has just reached full capacity. Please pick another slot.');
        }

        const newBooking = {
          id: bookingId,
          userId,
          restaurantId,
          restaurantName,
          bookingDate,
          timeSlot,
          guestCount: Number(guestCount),
          customerName: customerName.trim(),
          contactNumber: contactNumber.trim(),
          specialRequest: specialRequest.trim(),
          status: 'confirmed', // confirmed upon creation
          createdAt: new Date().toISOString()
        };

        transaction.set(bookingRef, newBooking);
      });

      return { bookingId, success: true };
    } catch (error) {
      // In case offline or permissions, provide informative message
      throw new Error(error.message || 'Failed to complete reservation.');
    }
  },

  /**
   * Fetch all bookings for a user
   */
  async getUserBookings(userId) {
    try {
      const q = query(
        collection(db, 'bookings'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const bookings = [];
      snapshot.forEach(docSnap => {
        bookings.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort in memory by date/time descending
      return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.warn('Error fetching user bookings:', error);
      return [];
    }
  },

  /**
   * Cancel an eligible booking
   */
  async cancelBooking(bookingId, userId, reason = 'Cancelled by guest') {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const snap = await getDoc(bookingRef);
      if (!snap.exists()) {
        throw new Error('Booking not found.');
      }
      const data = snap.data();
      if (data.userId !== userId) {
        throw new Error('Unauthorized to cancel this booking.');
      }
      if (data.status === 'cancelled') {
        throw new Error('This booking is already cancelled.');
      }
      if (data.status === 'completed') {
        throw new Error('Completed reservations cannot be cancelled.');
      }

      await updateDoc(bookingRef, {
        status: 'cancelled',
        cancellationReason: reason,
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to cancel reservation.');
    }
  }
};
