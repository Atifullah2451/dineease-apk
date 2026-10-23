/**
 * DineEase Restaurant Detail & Menu Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { restaurantService } from '../services/restaurantService.js';
import MenuItemCard from '../components/MenuItemCard.js';
import { useCart } from '../context/CartContext.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const { addItem, items: cartItems, conflictModal, confirmReplaceCart, cancelConflict, total, itemCount } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rest, items] = await Promise.all([
          restaurantService.getRestaurantById(restaurantId),
          restaurantService.getMenuItems(restaurantId),
        ]);
        setRestaurant(rest);
        setMenuItems(items);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [restaurantId]);

  if (loading || !restaurant) {
    return (
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSkeleton}>
          <View style={styles.loadingImageSkeleton} />
          <View style={styles.loadingLine} />
          <View style={styles.loadingLineShort} />
        </View>
      </View>
      </SafeAreaView>
    );
  }

  // Extract menu categories
  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];
  const displayedItems =
    selectedCategory === 'All'
      ? menuItems
      : menuItems.filter((i) => i.category === selectedCategory);

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
        {/* Cover Image & Back Button */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: restaurant.imageUrl }} style={styles.coverImage} resizeMode="cover" />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={SIZE.icon} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.ratingBadge}>
            <Feather name="star" size={SIZE.iconSmall} color={COLORS.accent} />
            <Text style={styles.ratingText}>{restaurant.rating} </Text>
            <Text style={styles.reviewsCount}>({restaurant.reviewsCount || 100}+)</Text>
          </View>
        </View>

        {/* Restaurant Info Header */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
          </View>

          <Text style={styles.descriptionText}>{restaurant.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Feather name="coffee" size={SIZE.iconSmall} color={COLORS.primary} />
              <Text style={styles.metaBadgeText}>{restaurant.cuisine}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Feather name="credit-card" size={SIZE.iconSmall} color={COLORS.primary} />
              <Text style={styles.metaBadgeText}>{restaurant.priceRange}</Text>
            </View>
            <View style={styles.metaBadge}>
              <Feather name="truck" size={SIZE.iconSmall} color={COLORS.primary} />
              <Text style={styles.metaBadgeText}>${restaurant.deliveryFee?.toFixed(2)} Fee</Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={SIZE.iconSmall} color={COLORS.textMuted} />
            <Text style={styles.locationText}>{restaurant.address}</Text>
          </View>

          <View style={styles.hoursRow}>
            <Feather name="clock" size={SIZE.iconSmall} color={COLORS.textMuted} />
            <Text style={styles.hoursText}>Open: {restaurant.openingHours}</Text>
          </View>

          {/* Book Table Button */}
          <TouchableOpacity
            style={styles.bookTableAction}
            activeOpacity={0.88}
            onPress={() => navigation.navigate('BookingModal', { restaurant })}
          >
            <Feather name="calendar" size={SIZE.iconSmall} color={COLORS.surface} />
            <Text style={styles.bookTableText}>Reserve a Table</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>Menu</Text>

          {/* Category Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryTab, selectedCategory === cat && styles.categoryTabActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    selectedCategory === cat && styles.categoryTabTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Menu Items List */}
          {displayedItems.map((item) => {
            const inCart = cartItems.find((i) => i.id === item.id)?.quantity || 0;
            return (
              <MenuItemCard
                key={item.id}
                item={item}
                currentCartQuantity={inCart}
                onAddToCart={() => addItem(item, restaurant, 1)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Cart Bar if Cart has items */}
      {itemCount > 0 && (
        <View style={styles.floatingCart}>
          <View>
            <Text style={styles.cartCountText}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</Text>
            <Text style={styles.cartTotalText}>${total.toFixed(2)} Total</Text>
          </View>
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => navigation.navigate('CartTab')}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
            <Feather name="arrow-right" size={SIZE.iconSmall} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      )}

      {/* Single-Restaurant Conflict Modal */}
      <Modal visible={conflictModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.conflictCard}>
            <View style={styles.conflictIconCircle}>
              <Feather name="alert-circle" size={SIZE.iconLarge} color={COLORS.danger} />
            </View>
            <Text style={styles.conflictTitle}>Create New Order?</Text>
            <Text style={styles.conflictBody}>
              Your cart currently contains dishes from another restaurant. Adding this item will clear your current cart.
            </Text>
            <View style={styles.conflictActions}>
              <TouchableOpacity style={styles.cancelConflictBtn} onPress={cancelConflict}>
                <Text style={styles.cancelConflictText}>Keep Current Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmConflictBtn} onPress={confirmReplaceCart}>
                <Text style={styles.confirmConflictText}>Start New Order</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    width: '100%',
    maxWidth: SIZE.contentMaxWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACE.screen,
    backgroundColor: COLORS.background,
  },
  loadingSkeleton: {
    width: '100%',
    padding: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  loadingImageSkeleton: {
    height: SIZE.detailSkeletonImage,
    marginBottom: SPACE.md,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.border,
  },
  loadingLine: {
    width: SIZE.skeletonLongWidth,
    height: SIZE.skeletonLineHeight,
    marginBottom: SPACE.sm,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  loadingLineShort: {
    width: SIZE.skeletonShortWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  detailScrollContent: {
    paddingBottom: SIZE.detailFooterClearance,
  },
  imageContainer: {
    position: 'relative',
    height: SIZE.detailHeroHeight,
    width: '100%',
    backgroundColor: COLORS.border,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: SPACE.screen,
    left: SPACE.screen,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.round,
    width: SIZE.backButton,
    height: SIZE.backButton,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
  },
  ratingBadge: {
    position: 'absolute',
    bottom: SPACE.md,
    right: SPACE.md,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.small,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  ratingText: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
    marginLeft: SPACE.xxs,
  },
  reviewsCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  infoSection: {
    backgroundColor: COLORS.surface,
    padding: SPACE.screen,
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: TYPE.display,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  descriptionText: {
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    lineHeight: TYPE.bodyLineHeight,
    marginTop: SPACE.sm,
    marginBottom: SPACE.md,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACE.md,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.small,
    marginRight: SPACE.xs,
    marginBottom: SPACE.xs,
  },
  metaBadgeText: {
    color: COLORS.primary,
    fontSize: TYPE.label,
    fontFamily: FONTS.bodyMedium,
    marginLeft: SPACE.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACE.xxs,
  },
  locationText: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginLeft: SPACE.xs,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACE.xs,
  },
  hoursText: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginLeft: SPACE.xs,
  },
  bookTableAction: {
    minHeight: SIZE.primaryButtonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.input,
    marginTop: SPACE.md,
  },
  bookTableText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
    marginLeft: SPACE.xs,
  },
  menuSection: {
    padding: SPACE.screen,
  },
  menuTitle: {
    fontSize: TYPE.title,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.sm,
  },
  categoryScroll: {
    marginBottom: SPACE.md,
  },
  categoryTab: {
    minHeight: SIZE.categoryTabHeight,
    marginRight: SPACE.lg,
    justifyContent: 'center',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.background,
  },
  categoryTabActive: {
    borderBottomWidth: SIZE.borderWidth * 2,
    borderBottomColor: COLORS.primary,
  },
  categoryTabText: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.textMuted,
  },
  categoryTabTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
  },
  floatingCart: {
    position: 'absolute',
    bottom: SPACE.md,
    left: SPACE.screen,
    right: SPACE.screen,
    width: 'auto',
    maxWidth: SIZE.contentMaxWidth - SPACE.screen * 2,
    alignSelf: 'center',
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOW,
  },
  cartCountText: {
    color: COLORS.border,
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyMedium,
  },
  cartTotalText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodyBold,
  },
  viewCartButton: {
    minHeight: SIZE.smallButtonHeight,
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.small,
  },
  viewCartText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
    marginRight: SPACE.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACE.screen,
  },
  conflictCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.lg,
    width: '100%',
    alignItems: 'center',
  },
  conflictIconCircle: {
    width: SIZE.conflictIconCircle,
    height: SIZE.conflictIconCircle,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.dangerTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  conflictTitle: {
    fontSize: TYPE.title,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.xs,
  },
  conflictBody: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: TYPE.bodyLineHeight,
    marginBottom: SPACE.md,
  },
  conflictActions: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelConflictBtn: {
    flex: 1,
    minHeight: SIZE.primaryButtonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.input,
    marginRight: SPACE.xs,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  cancelConflictText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  confirmConflictBtn: {
    flex: 1,
    minHeight: SIZE.primaryButtonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.input,
    marginLeft: SPACE.xs,
  },
  confirmConflictText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
});
