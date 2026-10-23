/**
 * DineEase Home Screen
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { restaurantService } from '../services/restaurantService.js';
import RestaurantCard from '../components/RestaurantCard.js';
import { CUISINE_CATEGORIES } from '../data/seedData.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

const PROMO_IMAGE =
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85';

const HOME_FONTS = {
  [FONTS.heading]: Fraunces_600SemiBold,
  [FONTS.headingRegular]: Fraunces_400Regular,
  [FONTS.body]: DMSans_400Regular,
  [FONTS.bodyMedium]: DMSans_500Medium,
  [FONTS.bodySemiBold]: DMSans_600SemiBold,
  [FONTS.bodyBold]: DMSans_700Bold,
};

function DishCard({ item, currentCartQuantity, onAddToCart }) {
  const dietaryColor = item.isVegetarian ? COLORS.success : COLORS.danger;

  return (
    <View style={styles.dishCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.dishImage} resizeMode="cover" />
      <View style={styles.dishDetails}>
        <View style={styles.dishTitleRow}>
          <View style={[styles.dietIndicator, { borderColor: dietaryColor }]}>
            <View style={[styles.dietDot, { backgroundColor: dietaryColor }]} />
          </View>
          {item.isPopular && <Text style={styles.popularLabel}>POPULAR</Text>}
        </View>
        <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.dishDescription} numberOfLines={1}>{item.description}</Text>
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`Add ${item.name} to cart${currentCartQuantity ? `, ${currentCartQuantity} already in cart` : ''}`}
            style={styles.addButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={onAddToCart}
          >
            <Feather name="plus" size={SIZE.iconSmall} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function DishSkeleton() {
  return (
    <View style={[styles.dishCard, styles.dishSkeleton]}>
      <View style={styles.dishImageSkeleton} />
      <View style={styles.skeletonDetails}>
        <View style={styles.skeletonShortLine} />
        <View style={styles.skeletonLongLine} />
        <View style={styles.skeletonLongLine} />
        <View style={styles.skeletonShortLine} />
      </View>
    </View>
  );
}

function RestaurantSkeleton() {
  return (
    <View style={styles.restaurantSkeleton}>
      <View style={styles.restaurantImageSkeleton} />
      <View style={styles.restaurantSkeletonDetails}>
        <View style={styles.skeletonLongLine} />
        <View style={styles.skeletonShortLine} />
        <View style={styles.skeletonLongLine} />
      </View>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const { userProfile, user } = useAuth();
  const { addItem, items: cartItems } = useCart();

  const [restaurants, setRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fontsLoaded] = useFonts(HOME_FONTS);

  const loadData = useCallback(async () => {
    try {
      const rests = await restaurantService.getRestaurants();
      setRestaurants(rests);

      const allItems = await restaurantService.getAllMenuItems();
      setPopularDishes(allItems.filter((i) => i.isPopular));
    } catch (e) {
      console.warn('Failed to load home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (selectedCuisine === 'all') return true;
    return restaurant.cuisineTags?.includes(selectedCuisine) || restaurant.cuisine === selectedCuisine;
  });

  if (!fontsLoaded) return null;

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'GOOD MORNING' : hour < 18 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const firstName = userProfile?.fullName ? userProfile.fullName.split(' ')[0] : 'Foodie';
  const promoImage = restaurants[0]?.imageUrl || PROMO_IMAGE;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.appName}>DineEase</Text>
            <Text style={styles.greeting}>{timeGreeting}</Text>
            <Text style={styles.firstName}>{firstName}</Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={user ? 'Open profile' : 'Sign in'}
            style={styles.profileButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => (user ? navigation.navigate('ProfileTab') : navigation.navigate('Login'))}
          >
            <Feather name="user" size={SIZE.icon} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Search dishes, cuisines, or restaurants"
            style={styles.searchBar}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => navigation.navigate('SearchTab')}
          >
            <Feather name="search" size={SIZE.icon} color={COLORS.textMuted} />
            <Text style={styles.searchPlaceholder}>Search dishes, cuisines, or restaurants</Text>
            <Feather name="sliders" size={SIZE.icon} color={COLORS.primary} />
          </TouchableOpacity>

          <View style={styles.promoBanner}>
            <ImageBackground
              source={{ uri: promoImage }}
              resizeMode="cover"
              imageStyle={styles.promoImage}
              style={styles.promoImageBackground}
            >
              <LinearGradient
                colors={[COLORS.overlayLight, COLORS.primaryDark]}
                locations={[0, 1]}
                style={styles.promoOverlay}
              >
                <Text style={styles.promoBadge}>LIMITED OFFER</Text>
                <Text style={styles.promoTitle}>Reserve & dine, 20% off</Text>
                <Text style={styles.promoSubtitle}>A little more occasion in every meal.</Text>
                <View style={styles.promoButton}>
                  <Feather name="calendar" size={SIZE.iconSmall} color={COLORS.surface} />
                  <Text style={styles.promoButtonText}>Book a table</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>

          <View style={[styles.sectionHeader, styles.cuisineSectionHeader]}>
            <Text style={styles.sectionTitle}>Explore cuisines</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CUISINE_CATEGORIES.map((category) => {
              const isSelected = selectedCuisine === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  style={[styles.categoryTab, isSelected && styles.selectedCategoryTab]}
                  activeOpacity={INTERACTION.pressOpacity}
                  onPress={() => setSelectedCuisine(category.id)}
                >
                  <Text style={[styles.categoryText, isSelected && styles.selectedCategoryText]}>
                    {category.label}
                  </Text>
                  {isSelected && <View style={styles.categoryUnderline} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular dishes</Text>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={INTERACTION.pressOpacity}
              onPress={() => navigation.navigate('SearchTab')}
            >
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dishList}
          >
            {loading && popularDishes.length === 0
              ? [0, 1].map((placeholder) => <DishSkeleton key={placeholder} />)
              : popularDishes.slice(0, 3).map((item) => {
                const targetRest = restaurants.find((restaurant) => restaurant.id === item.restaurantId) || {
                  id: item.restaurantId,
                  name: 'Featured Restaurant',
                  deliveryFee: 2.5,
                };
                const inCart = cartItems.find((cartItem) => cartItem.id === item.id)?.quantity || 0;

                return (
                  <DishCard
                    key={item.id}
                    item={item}
                    currentCartQuantity={inCart}
                    onAddToCart={() => addItem(item, targetRest, 1)}
                  />
                );
              })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCuisine === 'all' ? 'Featured restaurants' : `${selectedCuisine} restaurants`}
            </Text>
            <Text style={styles.resultCount}>{filteredRestaurants.length}</Text>
          </View>

          {loading ? (
            [0, 1].map((placeholder) => <RestaurantSkeleton key={placeholder} />)
          ) : filteredRestaurants.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="map-pin" size={SIZE.icon} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No restaurants match this cuisine yet.</Text>
            </View>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
                onBookTable={() => navigation.navigate('BookingModal', { restaurant })}
              />
            ))
          )}
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACE.screen,
    paddingVertical: SIZE.headerVertical,
  },
  headerText: {
    flex: 1,
  },
  appName: {
    fontFamily: FONTS.heading,
    fontSize: TYPE.display,
    lineHeight: TYPE.displayLineHeight,
    color: COLORS.primary,
  },
  greeting: {
    marginTop: SPACE.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.label,
    letterSpacing: TYPE.labelLetterSpacing,
  },
  firstName: {
    marginTop: SPACE.xxs,
    fontFamily: FONTS.headingRegular,
    fontSize: TYPE.title,
    lineHeight: TYPE.titleLineHeight,
    color: COLORS.text,
  },
  profileButton: {
    width: SIZE.avatar,
    height: SIZE.avatar,
    marginLeft: SPACE.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    paddingHorizontal: SPACE.screen,
    paddingBottom: SPACE.xl,
  },
  searchBar: {
    minHeight: SIZE.searchBar,
    marginTop: SPACE.xs,
    marginBottom: SPACE.md,
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  searchPlaceholder: {
    flex: 1,
    marginHorizontal: SPACE.sm,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
  },
  promoBanner: {
    height: SIZE.promoBanner,
    marginBottom: SPACE.lg,
    overflow: 'hidden',
    borderRadius: RADIUS.large,
    backgroundColor: COLORS.primaryDark,
    ...SHADOW,
  },
  promoImageBackground: {
    flex: 1,
  },
  promoImage: {
    borderRadius: RADIUS.large,
  },
  promoOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: SPACE.lg,
  },
  promoBadge: {
    marginBottom: SPACE.xs,
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.label,
    letterSpacing: TYPE.labelLetterSpacing,
  },
  promoTitle: {
    maxWidth: '92%',
    marginBottom: SPACE.xs,
    color: COLORS.surface,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
    lineHeight: TYPE.titleLineHeight,
  },
  promoSubtitle: {
    marginBottom: SPACE.md,
    color: COLORS.surface,
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
  },
  promoButton: {
    minHeight: SIZE.promoButtonHeight,
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.surface,
    borderRadius: RADIUS.small,
  },
  promoButtonText: {
    marginLeft: SPACE.xs,
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  sectionHeader: {
    marginTop: SPACE.md,
    marginBottom: SPACE.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuisineSectionHeader: {
    marginBottom: SPACE.xs,
  },
  sectionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
    lineHeight: TYPE.titleLineHeight,
  },
  seeAll: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  categoryScroll: {
    paddingBottom: SPACE.xs,
  },
  categoryTab: {
    minHeight: SIZE.categoryTabHeight,
    marginRight: SPACE.lg,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.background,
  },
  selectedCategoryTab: {
    borderBottomColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.body,
  },
  selectedCategoryText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
  },
  categoryUnderline: {
    height: SIZE.borderWidth,
    width: '100%',
    backgroundColor: COLORS.primary,
  },
  dishList: {
    paddingBottom: SPACE.xs,
  },
  dishCard: {
    width: SIZE.dishCardWidth,
    height: SIZE.dishCardHeight,
    marginRight: SPACE.md,
    padding: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  dishImage: {
    width: SIZE.dishImage,
    height: SIZE.dishImage,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.border,
  },
  dishDetails: {
    flex: 1,
    height: '100%',
    marginLeft: SPACE.sm,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  dishTitleRow: {
    minHeight: SIZE.dishIndicatorRow,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietIndicator: {
    width: SIZE.dietIndicator,
    height: SIZE.dietIndicator,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: SIZE.borderWidth,
    borderRadius: RADIUS.tiny,
  },
  dietDot: {
    width: SIZE.dietDot,
    height: SIZE.dietDot,
    borderRadius: RADIUS.round,
  },
  popularLabel: {
    marginLeft: SPACE.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.micro,
    letterSpacing: TYPE.microLetterSpacing,
  },
  dishName: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.body,
    lineHeight: TYPE.dishNameLineHeight,
  },
  dishDescription: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.micro,
  },
  dishFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dishPrice: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.body,
  },
  addButton: {
    width: SIZE.dishAddButton,
    height: SIZE.dishAddButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.primary,
  },
  dishSkeleton: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  dishImageSkeleton: {
    width: SIZE.dishImage,
    height: SIZE.dishImage,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.border,
  },
  skeletonDetails: {
    flex: 1,
    marginLeft: SPACE.sm,
    justifyContent: 'space-evenly',
  },
  skeletonShortLine: {
    width: SIZE.skeletonShortWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  skeletonLongLine: {
    width: SIZE.skeletonLongWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  resultCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
  },
  restaurantSkeleton: {
    height: SIZE.skeletonRestaurantHeight,
    marginBottom: SPACE.md,
    overflow: 'hidden',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  restaurantImageSkeleton: {
    height: SIZE.restaurantSkeletonImageHeight,
    backgroundColor: COLORS.border,
  },
  restaurantSkeletonDetails: {
    flex: 1,
    padding: SPACE.md,
    justifyContent: 'space-between',
  },
  emptyState: {
    minHeight: SIZE.emptyStateHeight,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACE.lg,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  emptyText: {
    marginTop: SPACE.sm,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.body,
    textAlign: 'center',
  },
});
