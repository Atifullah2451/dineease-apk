/**
 * DineEase Orders Service
 * Handles cart checkout, Firestore order creation, and order history
 */

import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export const orderService = {
  /**
   * Place an order with validated items and delivery details
   */
  async createOrder({
    userId,
    customerName,
    restaurantId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    phone,
    notes = '',
    paymentMethod = 'Cash on Delivery (Demo)'
  }) {
    if (!userId) throw new Error('Authentication required to place an order.');
    if (!items || items.length === 0) throw new Error('Your cart is empty.');
    if (!deliveryAddress?.trim()) throw new Error('Delivery address is required.');
    if (!phone?.trim()) throw new Error('Phone number is required.');

    // Recalculate totals client-side to ensure integrity
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const calculatedTotal = Number((calculatedSubtotal + deliveryFee).toFixed(2));

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderDocRef = doc(db, 'orders', orderId);

    const orderData = {
      id: orderId,
      userId,
      customerName: customerName.trim(),
      restaurantId,
      restaurantName,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        totalItemPrice: Number((item.price * item.quantity).toFixed(2))
      })),
      subtotal: Number(calculatedSubtotal.toFixed(2)),
      deliveryFee: Number(deliveryFee.toFixed(2)),
      total: calculatedTotal,
      deliveryAddress: deliveryAddress.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      paymentMethod,
      status: 'placed', // 'placed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(orderDocRef, orderData);
      return { success: true, order: orderData };
    } catch (error) {
      throw new Error(error.message || 'Failed to place order in database.');
    }
  },

  /**
   * Fetch all past orders for a user
   */
  async getUserOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const orders = [];
      snapshot.forEach(docSnap => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.warn('Error fetching orders:', error);
      return [];
    }
  }
};
