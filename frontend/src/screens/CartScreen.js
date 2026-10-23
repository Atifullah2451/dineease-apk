/**
 * DineEase Shopping Cart Screen
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';
import { useCart } from '../context/CartContext.js';
import EmptyState from '../components/EmptyState.js';

export default function CartScreen({ navigation }) {
  const { items, restaurant, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } =
    useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
       <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          message="Looks like you haven't added any delicious dishes yet. Explore our top restaurants!"
          buttonTitle="Browse Restaurants"
          onButtonPress={() => navigation.navigate('HomeTab')}
        />
       </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <Text style={styles.restaurantTag}>From: {restaurant?.name}</Text>
        </View>
        <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cart Items List */}
        <View style={styles.itemsCard}>
          {items.map((item, index) => (
            <View key={item.id} style={[styles.itemRow, index > 0 && styles.itemBorder]}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
              </View>

              {/* Quantity Controls */}
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Feather
                  name={item.quantity === 1 ? 'trash-2' : 'minus'}
                  size={SIZE.iconSmall}
                  color={item.quantity === 1 ? COLORS.danger : COLORS.text}
                  />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Feather name="plus" size={SIZE.iconSmall} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add More Items Button */}
        <TouchableOpacity
          style={styles.addMoreBtn}
          onPress={() => {
            if (restaurant?.id) {
              navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id });
            } else {
              navigation.navigate('HomeTab');
            }
          }}
        >
          <Feather name="plus-circle" size={SIZE.iconMedium} color={COLORS.primary} />
          <Text style={styles.addMoreText}>Add more items from this restaurant</Text>
        </TouchableOpacity>

        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Estimated Delivery Fee</Text>
            <Text style={styles.summaryValue}>${deliveryFee.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Footer Bar */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerSubtotal}>Total to pay</Text>
          <Text style={styles.footerTotal}>${total.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.88}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Feather name="arrow-right" size={SIZE.iconSmall} color={COLORS.surface} />
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
  header: {
    paddingTop: SPACE.lg,
    paddingHorizontal: SPACE.screen,
    paddingBottom: SPACE.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
  },
  restaurantTag: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
  },
  clearBtn: {
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  clearBtnText: {
    color: COLORS.danger,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  scrollContent: {
    padding: SPACE.screen,
    paddingBottom: SIZE.cartFooterClearance,
  },
  itemsCard: {
    paddingHorizontal: SPACE.md,
    marginBottom: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACE.md,
  },
  itemBorder: {
    borderTopWidth: SIZE.borderWidth,
    borderTopColor: COLORS.border,
  },
  itemImage: {
    width: SIZE.cartItemImage,
    height: SIZE.cartItemImage,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACE.sm,
    marginRight: SPACE.xs,
  },
  itemName: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.medium,
  },
  itemPrice: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACE.xs,
  },
  qtyBtn: {
    width: SIZE.stepperButton,
    height: SIZE.stepperButton,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
    marginHorizontal: SPACE.xs,
    color: COLORS.text,
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACE.md,
    borderRadius: RADIUS.input,
    marginBottom: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  addMoreText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
    marginLeft: SPACE.xs,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  summaryTitle: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.body,
    marginBottom: SPACE.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACE.xs,
  },
  summaryLabel: {
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
    color: COLORS.text,
  },
  summaryDivider: {
    height: SIZE.borderWidth,
    backgroundColor: COLORS.border,
    marginVertical: SPACE.sm,
  },
  totalLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.body,
    color: COLORS.text,
  },
  totalValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.subtitle,
    color: COLORS.accent,
  },
  footer: {
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
    ...SHADOW,
  },
  footerSubtotal: {
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
    color: COLORS.textMuted,
  },
  footerTotal: {
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.title,
    color: COLORS.text,
  },
  checkoutBtn: {
    minHeight: SIZE.primaryButtonHeight,
    flex: 1,
    marginLeft: SPACE.md,
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: SPACE.xs,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.input,
  },
  checkoutBtnText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
});
