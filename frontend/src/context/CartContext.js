/**
 * DineEase Cart Context
 * Single-restaurant restriction, calculations, and local persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = '@dineease_cart_v1';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null); // { id, name, deliveryFee }
  const [conflictModal, setConflictModal] = useState({
    visible: false,
    pendingItem: null,
    pendingRestaurant: null,
  });

  // Load persisted cart on startup
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.items && parsed?.restaurant) {
            setItems(parsed.items);
            setRestaurant(parsed.restaurant);
          }
        }
      } catch (e) {
        console.warn('Failed to load persisted cart:', e);
      }
    };
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        if (items.length === 0) {
          await AsyncStorage.removeItem(CART_STORAGE_KEY);
        } else {
          await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items, restaurant }));
        }
      } catch (e) {
        console.warn('Failed to save cart:', e);
      }
    };
    saveCart();
  }, [items, restaurant]);

  /**
   * Add item to cart with single-restaurant guard
   */
  const addItem = (item, targetRestaurant, quantity = 1) => {
    // If cart is currently not empty and belongs to another restaurant:
    if (restaurant && restaurant.id !== targetRestaurant.id && items.length > 0) {
      setConflictModal({
        visible: true,
        pendingItem: { ...item, quantity },
        pendingRestaurant: targetRestaurant,
      });
      return false; // indicating conflict
    }

    // Set active restaurant if empty
    if (!restaurant || items.length === 0) {
      setRestaurant({
        id: targetRestaurant.id,
        name: targetRestaurant.name,
        deliveryFee: targetRestaurant.deliveryFee || 2.50,
      });
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevItems, { ...item, quantity }];
    });

    return true;
  };

  /**
   * Replace cart when user agrees to overwrite with items from a new restaurant
   */
  const confirmReplaceCart = () => {
    if (conflictModal.pendingItem && conflictModal.pendingRestaurant) {
      setRestaurant({
        id: conflictModal.pendingRestaurant.id,
        name: conflictModal.pendingRestaurant.name,
        deliveryFee: conflictModal.pendingRestaurant.deliveryFee || 2.50,
      });
      setItems([{ ...conflictModal.pendingItem }]);
    }
    setConflictModal({ visible: false, pendingItem: null, pendingRestaurant: null });
  };

  const cancelConflict = () => {
    setConflictModal({ visible: false, pendingItem: null, pendingRestaurant: null });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeItem = (itemId) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== itemId);
      if (filtered.length === 0) {
        setRestaurant(null);
      }
      return filtered;
    });
  };

  const clearCart = () => {
    setItems([]);
    setRestaurant(null);
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = restaurant ? restaurant.deliveryFee || 2.50 : 0;
  const total = items.length > 0 ? Number((subtotal + deliveryFee).toFixed(2)) : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        restaurant,
        itemCount,
        subtotal: Number(subtotal.toFixed(2)),
        deliveryFee: Number(deliveryFee.toFixed(2)),
        total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        conflictModal,
        confirmReplaceCart,
        cancelConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
