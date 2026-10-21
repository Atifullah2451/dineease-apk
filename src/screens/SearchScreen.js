/**
 * DineEase Search & Filter Screen
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { restaurantService } from '../services/restaurantService.js';
import RestaurantCard from '../components/RestaurantCard.js';
import MenuItemCard from '../components/MenuItemCard.js';
import EmptyState from '../components/EmptyState.js';
import { useCart } from '../context/CartContext.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

const CUISINES = ['All', 'Pakistani', 'Chinese', 'Italian', 'Fast Food', 'BBQ'];
const PRICE_TIERS = ['All', '$', '$$', '$$$'];
const SORT_OPTIONS = [
  { id: 'rating', label: 'Highest Rated' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'popularity', label: 'Most Popular' },
];

export default function SearchScreen({ navigation }) {
  const { addItem, items: cartItems } = useCart();
  const [query, setQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [minRating, setMinRating] = useState(0); // 0 or 4.5
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [searchTarget, setSearchTarget] = useState('restaurants'); // 'restaurants' or 'dishes'
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);

  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rests, menuItems] = await Promise.all([
          restaurantService.getRestaurants(),
          restaurantService.getAllMenuItems(),
        ]);
        setRestaurants(rests);
        setDishes(menuItems);
      } catch (e) {
        console.warn(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const resetFilters = () => {
    setQuery('');
    setSelectedCuisine('All');
    setSelectedPrice('All');
    setMinRating(0);
    setVegetarianOnly(false);
    setSortBy('rating');
  };

  const hasActiveFilters =
    query.trim() !== '' ||
    selectedCuisine !== 'All' ||
    selectedPrice !== 'All' ||
    minRating > 0 ||
    vegetarianOnly;

  // Filtered Restaurants
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q)
      );
    }

    if (selectedCuisine !== 'All') {
      result = result.filter(
        (r) => r.cuisine === selectedCuisine || r.cuisineTags?.includes(selectedCuisine)
      );
    }

    if (selectedPrice !== 'All') {
      result = result.filter((r) => r.priceRange === selectedPrice);
    }

    if (minRating > 0) {
      result = result.filter((r) => r.rating >= minRating);
    }

    if (vegetarianOnly) {
      result = result.filter((r) => r.hasVegetarianOptions);
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.priceRange?.length || 2) - (b.priceRange?.length || 2));
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    return result;
  }, [restaurants, query, selectedCuisine, selectedPrice, minRating, vegetarianOnly, sortBy]);

  // Filtered Dishes
  const filteredDishes = useMemo(() => {
    let result = [...dishes];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      );
    }

    if (vegetarianOnly) {
      result = result.filter((d) => d.isVegetarian);
    }

    // Filter by restaurant cuisine if cuisine is selected
    if (selectedCuisine !== 'All') {
      const matchingRests = restaurants
        .filter((r) => r.cuisine === selectedCuisine || r.cuisineTags?.includes(selectedCuisine))
        .map((r) => r.id);
      result = result.filter((d) => matchingRests.includes(d.restaurantId));
    }

    // Sort dishes
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else {
      result.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    }

    return result;
  }, [dishes, restaurants, query, vegetarianOnly, selectedCuisine, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
        <View style={styles.inputContainer}>
          <Feather name="search" size={SIZE.icon} color={COLORS.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="Search restaurants, cuisines, or dishes..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor={COLORS.placeholder}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity activeOpacity={INTERACTION.pressOpacity} onPress={() => setQuery('')}>
              <Feather name="x-circle" size={SIZE.iconSmall} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={styles.tabButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => setSearchTarget('restaurants')}
          >
            <Text
              style={[styles.tabButtonText, searchTarget === 'restaurants' && styles.tabButtonTextActive]}
            >
              Restaurants<Text style={styles.tabCount}> {filteredRestaurants.length}</Text>
            </Text>
            {searchTarget === 'restaurants' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => setSearchTarget('dishes')}
          >
            <Text
              style={[styles.tabButtonText, searchTarget === 'dishes' && styles.tabButtonTextActive]}
            >
              Dishes<Text style={styles.tabCount}> {filteredDishes.length}</Text>
            </Text>
            {searchTarget === 'dishes' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>
        </View>

        <View style={styles.filterActions}>
          <TouchableOpacity
            style={styles.filtersButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => setFiltersVisible(true)}
          >
            <Feather name="sliders" size={SIZE.iconSmall} color={COLORS.primary} />
            <Text style={styles.filtersButtonText}>Filters</Text>
            {hasActiveFilters && <View style={styles.filterIndicator} />}
          </TouchableOpacity>
          <View style={styles.filterDivider} />
          <TouchableOpacity
            style={styles.sortButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => setSortVisible(true)}
          >
            <Text style={styles.sortLabel}>Sort</Text>
            <Text style={styles.sortValue}>
              {SORT_OPTIONS.find((option) => option.id === sortBy)?.label || 'Highest Rated'}
            </Text>
            <Feather name="chevron-down" size={SIZE.iconSmall} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {hasActiveFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFilters}>
            {query.trim() !== '' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setQuery('')}>
                <Text style={styles.activeChipText}>“{query.trim()}”</Text>
                <Feather name="x" size={SIZE.iconSmall} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {vegetarianOnly && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setVegetarianOnly(false)}>
                <Text style={styles.activeChipText}>Vegetarian</Text>
                <Feather name="x" size={SIZE.iconSmall} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {minRating > 0 && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setMinRating(0)}>
                <Text style={styles.activeChipText}>{minRating}+ stars</Text>
                <Feather name="x" size={SIZE.iconSmall} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {selectedCuisine !== 'All' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setSelectedCuisine('All')}>
                <Text style={styles.activeChipText}>{selectedCuisine}</Text>
                <Feather name="x" size={SIZE.iconSmall} color={COLORS.primary} />
              </TouchableOpacity>
            )}
            {selectedPrice !== 'All' && (
              <TouchableOpacity style={styles.activeChip} onPress={() => setSelectedPrice('All')}>
                <Text style={styles.activeChipText}>{selectedPrice}</Text>
                <Feather name="x" size={SIZE.iconSmall} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        <ScrollView contentContainerStyle={styles.resultsContent} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingSkeleton}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonLineWide} />
              <View style={styles.skeletonLineShort} />
              <View style={styles.skeletonLineWide} />
            </View>
          ) : searchTarget === 'restaurants' ? (
            filteredRestaurants.length === 0 ? (
              <EmptyState
                icon="search-outline"
                title="No restaurants found"
                message="Try another search or adjust your filters."
                buttonTitle="Reset filters"
                onButtonPress={resetFilters}
              />
            ) : (
              filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onPress={() => navigation.navigate('RestaurantDetail', { restaurantId: restaurant.id })}
                  onBookTable={() => navigation.navigate('BookingModal', { restaurant })}
                />
              ))
            )
          ) : filteredDishes.length === 0 ? (
            <EmptyState
              icon="fast-food-outline"
              title="No dishes found"
              message="Try another search or adjust your filters."
              buttonTitle="Reset filters"
              onButtonPress={resetFilters}
            />
          ) : (
            filteredDishes.map((item) => {
              const targetRest = restaurants.find((restaurant) => restaurant.id === item.restaurantId) || {
                id: item.restaurantId,
                name: 'Restaurant',
                deliveryFee: 2.5,
              };
              const inCart = cartItems.find((cartItem) => cartItem.id === item.id)?.quantity || 0;
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  currentCartQuantity={inCart}
                  onAddToCart={() => addItem(item, targetRest, 1)}
                />
              );
            })
          )}
        </ScrollView>

        <Modal
          visible={filtersVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFiltersVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              accessibilityLabel="Close filters"
              onPress={() => setFiltersVisible(false)}
            />
            <View style={styles.filterSheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Refine your search</Text>
                <TouchableOpacity
                  accessibilityLabel="Close filters"
                  onPress={() => setFiltersVisible(false)}
                >
                  <Feather name="x" size={SIZE.icon} color={COLORS.text} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.switchRow}>
                  <View>
                    <Text style={styles.optionTitle}>Vegetarian options</Text>
                    <Text style={styles.optionDescription}>Show vegetarian restaurants and dishes</Text>
                  </View>
                  <Switch
                    value={vegetarianOnly}
                    onValueChange={setVegetarianOnly}
                    trackColor={{ false: COLORS.border, true: COLORS.primary }}
                    thumbColor={COLORS.surface}
                  />
                </View>

                <Text style={styles.filterLabel}>Minimum rating</Text>
                <View style={styles.optionRow}>
                  {[0, 4.7].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[styles.optionChip, minRating === rating && styles.optionChipSelected]}
                      onPress={() => setMinRating(rating)}
                    >
                      <Text style={[styles.optionChipText, minRating === rating && styles.optionChipTextSelected]}>
                        {rating === 0 ? 'Any' : `${rating}+`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterLabel}>Cuisine</Text>
                <View style={styles.optionRow}>
                  {CUISINES.map((cuisine) => (
                    <TouchableOpacity
                      key={cuisine}
                      style={[styles.optionChip, selectedCuisine === cuisine && styles.optionChipSelected]}
                      onPress={() => setSelectedCuisine(cuisine)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          selectedCuisine === cuisine && styles.optionChipTextSelected,
                        ]}
                      >
                        {cuisine}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.filterLabel}>Price range</Text>
                <View style={styles.optionRow}>
                  {PRICE_TIERS.map((tier) => (
                    <TouchableOpacity
                      key={tier}
                      style={[styles.optionChip, selectedPrice === tier && styles.optionChipSelected]}
                      onPress={() => setSelectedPrice(tier)}
                    >
                      <Text
                        style={[
                          styles.optionChipText,
                          selectedPrice === tier && styles.optionChipTextSelected,
                        ]}
                      >
                        {tier === 'All' ? 'Any' : tier}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setFiltersVisible(false)}
                >
                  <Text style={styles.applyButtonText}>Apply filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={sortVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setSortVisible(false)}
        >
          <View style={styles.sortModalBackdrop}>
            <TouchableOpacity
              style={styles.backdropDismiss}
              activeOpacity={1}
              accessibilityLabel="Close sort options"
              onPress={() => setSortVisible(false)}
            />
            <View style={styles.sortSheet}>
              <Text style={styles.sheetTitle}>Sort results</Text>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sortOption}
                  onPress={() => {
                    setSortBy(option.id);
                    setSortVisible(false);
                  }}
                >
                  <Text style={[styles.optionTitle, sortBy === option.id && styles.selectedSortText]}>
                    {option.label}
                  </Text>
                  {sortBy === option.id && <Feather name="check" size={SIZE.iconSmall} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
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
  header: {
    paddingHorizontal: SPACE.screen,
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.sm,
    backgroundColor: COLORS.background,
  },
  inputContainer: {
    minHeight: SIZE.searchBar,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.surface,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: TYPE.input,
    color: COLORS.text,
    marginLeft: SPACE.sm,
  },
  tabToggle: {
    marginTop: SPACE.md,
    flexDirection: 'row',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    minHeight: SIZE.categoryTabHeight,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.body,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
  },
  tabCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  tabUnderline: {
    position: 'absolute',
    right: SPACE.xl,
    bottom: SPACE.zero,
    left: SPACE.xl,
    height: SIZE.borderWidth * 2,
    backgroundColor: COLORS.primary,
  },
  filterActions: {
    minHeight: SIZE.filterRowHeight,
    paddingHorizontal: SPACE.screen,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filtersButton: {
    minHeight: SIZE.sortControlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACE.xs,
  },
  filtersButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  filterIndicator: {
    width: SIZE.filterIndicator,
    height: SIZE.filterIndicator,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.accent,
  },
  filterDivider: {
    width: SIZE.borderWidth,
    height: SIZE.filterDividerHeight,
    marginHorizontal: SPACE.md,
    backgroundColor: COLORS.border,
  },
  sortButton: {
    flex: 1,
    minHeight: SIZE.sortControlHeight,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACE.xs,
  },
  sortLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  sortValue: {
    flex: 1,
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.label,
  },
  activeFilters: {
    paddingHorizontal: SPACE.screen,
    paddingVertical: SPACE.sm,
    columnGap: SPACE.xs,
  },
  activeChip: {
    minHeight: SIZE.activeChipHeight,
    paddingHorizontal: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACE.xs,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  activeChipText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.label,
  },
  resultsContent: {
    paddingHorizontal: SPACE.screen,
    paddingTop: SPACE.md,
    paddingBottom: SPACE.xl,
  },
  loadingSkeleton: {
    height: SIZE.searchSkeletonHeight,
    padding: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  skeletonImage: {
    height: SIZE.searchSkeletonImageHeight,
    marginBottom: SPACE.md,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.border,
  },
  skeletonLineWide: {
    width: SIZE.skeletonLongWidth,
    height: SIZE.skeletonLineHeight,
    marginBottom: SPACE.sm,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  skeletonLineShort: {
    width: SIZE.skeletonShortWidth,
    height: SIZE.skeletonLineHeight,
    marginBottom: SPACE.sm,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.backdrop,
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  filterSheet: {
    maxHeight: SIZE.filterSheetMaxHeight,
    paddingHorizontal: SPACE.screen,
    paddingTop: SPACE.sm,
    paddingBottom: SPACE.xl,
    borderTopLeftRadius: RADIUS.large,
    borderTopRightRadius: RADIUS.large,
    backgroundColor: COLORS.surface,
  },
  sheetHandle: {
    width: SIZE.sheetHandleWidth,
    height: SIZE.sheetHandleHeight,
    alignSelf: 'center',
    marginBottom: SPACE.md,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.border,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  sheetTitle: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
  },
  switchRow: {
    minHeight: SIZE.switchRowHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  optionTitle: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.body,
  },
  optionDescription: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  filterLabel: {
    marginTop: SPACE.md,
    marginBottom: SPACE.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.label,
    letterSpacing: TYPE.labelLetterSpacing,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: SPACE.xs,
    rowGap: SPACE.xs,
  },
  optionChip: {
    minHeight: SIZE.filterOptionHeight,
    paddingHorizontal: SPACE.md,
    justifyContent: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  optionChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successTint,
  },
  optionChipText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
  },
  optionChipTextSelected: {
    color: COLORS.primary,
  },
  sheetActions: {
    marginTop: SPACE.md,
    flexDirection: 'row',
    columnGap: SPACE.sm,
  },
  resetButton: {
    minHeight: SIZE.primaryButtonHeight,
    paddingHorizontal: SPACE.lg,
    justifyContent: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
  },
  resetButtonText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.body,
  },
  applyButton: {
    flex: 1,
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.body,
  },
  sortModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACE.screen,
    backgroundColor: COLORS.backdrop,
  },
  sortSheet: {
    padding: SPACE.lg,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  sortOption: {
    minHeight: SIZE.sortOptionHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  selectedSortText: {
    color: COLORS.primary,
  },
});
