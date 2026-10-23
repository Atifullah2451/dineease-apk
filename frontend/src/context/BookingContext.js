/**
 * DineEase Booking Context
 * State management for table reservations and cancellations
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService.js';
import { useAuth } from './AuthContext.js';

const BookingContext = createContext(null);

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    if (!user) {
      setBookings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getUserBookings(user.uid);
      setBookings(data);
    } catch (e) {
      console.warn('Error fetching bookings:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const createBooking = async (bookingData) => {
    setError(null);
    try {
      const result = await bookingService.createBooking({
        ...bookingData,
        userId: user?.uid,
      });
      await fetchBookings();
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    if (!user) return;
    setError(null);
    try {
      await bookingService.cancelBooking(bookingId, user.uid, reason);
      await fetchBookings();
      return true;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  };

  return (
    <BookingContext.Provider
      value={{
        bookings,
        loading,
        error,
        refreshBookings: fetchBookings,
        createBooking,
        cancelBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
