import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function RestaurantCard({ restaurant, onPress, onBookTable }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={INTERACTION.pressOpacity}
      onPress={onPress}
    >
      <Image source={{ uri: restaurant.imageUrl }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{restaurant.name}</Text>
          <View style={styles.rating}>
            <Feather name="star" size={SIZE.iconSmall} color={COLORS.accent} />
            <Text style={styles.ratingText}>{restaurant.rating?.toFixed(1) || '4.8'}</Text>
          </View>
        </View>

        <View style={styles.metaHeader}>
          <Text style={styles.cuisine} numberOfLines={1}>
            {restaurant.cuisine} · {restaurant.address?.split(',')[0]}
          </Text>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{restaurant.priceRange || '$$'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.metaItem}>
            <Feather name="clock" size={SIZE.iconSmall} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{restaurant.deliveryTime || '25-40 min'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Feather name="truck" size={SIZE.iconSmall} color={COLORS.textMuted} />
            <Text style={styles.metaText}>${restaurant.deliveryFee?.toFixed(2) || '2.50'}</Text>
          </View>
          {restaurant.hasVegetarianOptions && (
            <View style={styles.vegBadge}>
              <Text style={styles.vegText}>Veg options</Text>
            </View>
          )}
        </View>

        {onBookTable && (
          <TouchableOpacity
            style={styles.bookButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={(event) => {
              event.stopPropagation();
              onBookTable(restaurant);
            }}
          >
            <Feather name="calendar" size={SIZE.iconSmall} color={COLORS.primary} />
            <Text style={styles.bookButtonText}>Book a table</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACE.md,
    overflow: 'hidden',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  image: {
    width: '100%',
    height: SIZE.restaurantImageHeight,
    backgroundColor: COLORS.border,
  },
  content: {
    padding: SPACE.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    flex: 1,
    marginRight: SPACE.sm,
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.subtitle,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: SPACE.xxs,
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
  metaHeader: {
    marginTop: SPACE.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cuisine: {
    flex: 1,
    marginRight: SPACE.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
  },
  priceBadge: {
    paddingHorizontal: SPACE.xs,
    paddingVertical: SPACE.xxs,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.small,
  },
  priceText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.label,
  },
  infoRow: {
    marginTop: SPACE.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: SPACE.md,
    rowGap: SPACE.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: SPACE.xxs,
  },
  metaText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  vegBadge: {
    paddingHorizontal: SPACE.xs,
    paddingVertical: SPACE.xxs,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.successTint,
  },
  vegText: {
    color: COLORS.success,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.micro,
  },
  bookButton: {
    minHeight: SIZE.slimButtonHeight,
    marginTop: SPACE.md,
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: SPACE.xs,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  bookButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
});
