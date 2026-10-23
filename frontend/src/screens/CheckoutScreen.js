/**
 * DineEase Checkout Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { orderService } from '../services/orderService.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function CheckoutScreen({ navigation }) {
  const { user, userProfile } = useAuth();
  const { items, restaurant, subtotal, deliveryFee, total, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(userProfile?.fullName || '');
  const [address, setAddress] = useState('House 4B, Street 12, Sector F-7, Islamabad');
  const [phone, setPhone] = useState(userProfile?.phone || '+92 300 1234567');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to complete your checkout.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Missing Field', 'Please enter your full name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing Field', 'Please provide a delivery address.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing Field', 'Please provide a contact phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await orderService.createOrder({
        userId: user.uid,
        customerName,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items,
        subtotal,
        deliveryFee,
        total,
        deliveryAddress: address,
        phone,
        notes,
        paymentMethod,
      });

      // Clear cart
      clearCart();
      setConfirmedOrder(result.order);
    } catch (error) {
      Alert.alert('Order Placement Failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Order Success Screen View
  if (confirmedOrder) {
    return (
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <Feather name="check" size={SIZE.iconLarge} color={COLORS.surface} />
        </View>

        <Text style={styles.successTitle}>Order Placed Successfully!</Text>
        <Text style={styles.successSubtitle}>
          Your order has been sent to {confirmedOrder.restaurantName}. It will arrive shortly!
        </Text>

        <View style={styles.orderReceipt}>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Order ID</Text>
            <Text style={styles.receiptValue}>#{confirmedOrder.id}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total Paid (COD)</Text>
            <Text style={styles.receiptTotal}>${confirmedOrder.total.toFixed(2)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Delivering to</Text>
            <Text style={styles.receiptValue} numberOfLines={1}>{confirmedOrder.deliveryAddress}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Items Ordered</Text>
            <Text style={styles.receiptValue}>{confirmedOrder.items?.length} items</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.doneBtn}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.doneBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewHistoryBtn}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={() => navigation.navigate('ProfileTab')}
        >
          <Text style={styles.viewHistoryText}>View in Order History</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Restaurant Header */}
        <View style={styles.sectionCard}>
          <View style={styles.restaurantRow}>
            <Feather name="shopping-bag" size={SIZE.iconMedium} color={COLORS.primary} />
            <Text style={styles.restaurantName}>{restaurant?.name || 'Selected Restaurant'}</Text>
          </View>
          <Text style={styles.itemsSummary}>
            {items.reduce((s, i) => s + i.quantity, 0)} items in your order
          </Text>
        </View>

        {/* Delivery Details Form */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Delivery Information</Text>

          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g. John Doe"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
          />

          <Text style={styles.inputLabel}>Delivery Address</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Street address, building, apartment..."
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
            multiline
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +92 300 1234567"
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
          />

          <Text style={styles.inputLabel}>Order Notes (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. Please ring doorbell or extra spicy"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Payment Option</Text>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'Cash on Delivery' && styles.paymentOptionActive]}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => setPaymentMethod('Cash on Delivery')}
          >
            <View style={styles.radioCircle}>
              {paymentMethod === 'Cash on Delivery' && <View style={styles.radioInner} />}
            </View>
            <Feather name="dollar-sign" size={SIZE.iconMedium} color={COLORS.primary} style={styles.paymentIcon} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Cash on Delivery (Demo)</Text>
              <Text style={styles.paymentSub}>Pay safely when the courier arrives</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Order Bill Breakdown */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardHeader}>Payment Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Subtotal</Text>
            <Text style={styles.billVal}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billVal}>${deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.billDivider} />

          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalVal}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order CTA */}
      <View style={styles.footerBar}>
        <View>
          <Text style={styles.footerLabel}>Total Bill</Text>
          <Text style={styles.footerAmount}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderBtn, submitting && styles.btnDisabled]}
          disabled={submitting}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={handlePlaceOrder}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Confirm & Place Order</Text>
              <Feather name="check-circle" size={SIZE.iconSmall} color={COLORS.surface} style={styles.confirmIcon} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: SIZE.contentMaxWidth,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACE.screen,
    paddingBottom: SIZE.cartFooterClearance,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    marginBottom: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  restaurantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACE.xs,
  },
  restaurantName: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginLeft: SPACE.xs,
  },
  itemsSummary: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  cardHeader: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.md,
  },
  inputLabel: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
    marginBottom: SPACE.xxs,
    marginTop: SPACE.xs,
  },
  textInput: {
    minHeight: SIZE.inputHeight,
    backgroundColor: COLORS.surface,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  multilineInput: {
    height: SIZE.multilineInputHeight,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.surface,
  },
  paymentOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successTint,
  },
  radioCircle: {
    width: SIZE.radioOuter,
    height: SIZE.radioOuter,
    borderRadius: RADIUS.round,
    borderWidth: SIZE.radioBorderWidth,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: SIZE.radioInner,
    height: SIZE.radioInner,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
  paymentIcon: {
    marginHorizontal: SPACE.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
  },
  paymentSub: {
    fontSize: TYPE.label,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACE.xs,
  },
  billLabel: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  billVal: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
  },
  billDivider: {
    height: SIZE.borderWidth,
    backgroundColor: COLORS.border,
    marginVertical: SPACE.xs,
  },
  billTotalLabel: {
    fontSize: TYPE.body,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  billTotalVal: {
    fontSize: TYPE.subtitle,
    fontFamily: FONTS.bodyBold,
    color: COLORS.accent,
  },
  footerBar: {
    position: 'absolute',
    bottom: SPACE.zero,
    left: SPACE.zero,
    right: SPACE.zero,
    width: '100%',
    maxWidth: SIZE.contentMaxWidth,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACE.screen,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.lg,
    borderTopWidth: SIZE.borderWidth,
    borderTopColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: TYPE.label,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  footerAmount: {
    fontSize: TYPE.title,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  placeOrderBtn: {
    flex: 1,
    minHeight: SIZE.primaryButtonHeight,
    marginLeft: SPACE.md,
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: SPACE.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.input,
  },
  btnDisabled: {
    opacity: INTERACTION.disabledOpacity,
  },
  placeOrderText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  confirmIcon: {
    marginLeft: SPACE.xs,
  },
  successContainer: {
    flex: 1,
    width: '100%',
    maxWidth: SIZE.contentMaxWidth,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
    padding: SPACE.screen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconCircle: {
    width: SIZE.successIconCircle,
    height: SIZE.successIconCircle,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  successTitle: {
    fontSize: TYPE.display,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACE.xs,
  },
  successSubtitle: {
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: TYPE.bodyLineHeight,
    marginBottom: SPACE.lg,
  },
  orderReceipt: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    width: '100%',
    marginBottom: SPACE.lg,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACE.xs,
  },
  receiptLabel: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  receiptValue: {
    maxWidth: '60%',
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
    textAlign: 'right',
  },
  receiptTotal: {
    fontSize: TYPE.body,
    fontFamily: FONTS.bodyBold,
    color: COLORS.accent,
  },
  doneBtn: {
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    borderRadius: RADIUS.input,
    alignItems: 'center',
    marginBottom: SPACE.sm,
  },
  doneBtnText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
  },
  viewHistoryBtn: {
    minHeight: SIZE.smallButtonHeight,
    justifyContent: 'center',
  },
  viewHistoryText: {
    color: COLORS.primary,
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
  },
});
