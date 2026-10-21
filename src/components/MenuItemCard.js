import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function MenuItemCard({ item, onAddToCart, currentCartQuantity = 0 }) {
  const [quantity, setQuantity] = useState(1);
  const dietaryColor = item.isVegetarian ? COLORS.success : COLORS.danger;

  return (
    <View style={styles.card}>
      <View style={styles.details}>
        <View style={styles.tagRow}>
          <View style={[styles.dietBadge, { borderColor: dietaryColor }]}>
            <View style={[styles.dietDot, { backgroundColor: dietaryColor }]} />
          </View>
          {item.isPopular && <Text style={styles.popularText}>POPULAR</Text>}
        </View>

        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={() => onAddToCart(item, 1)}
        >
          <Feather name="plus" size={SIZE.iconSmall} color={COLORS.surface} />
          <Text style={styles.addButtonText}>
            {currentCartQuantity > 0 ? `Add (${currentCartQuantity} in cart)` : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACE.md,
    padding: SPACE.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  details: {
    flex: 1,
    paddingRight: SPACE.md,
  },
  tagRow: {
    minHeight: SIZE.dietIndicator,
    marginBottom: SPACE.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dietBadge: {
    width: SIZE.dietIndicator,
    height: SIZE.dietIndicator,
    borderWidth: SIZE.borderWidth,
    borderRadius: RADIUS.tiny,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietDot: {
    width: SIZE.dietDot,
    height: SIZE.dietDot,
    borderRadius: RADIUS.round,
  },
  popularText: {
    marginLeft: SPACE.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.micro,
    letterSpacing: TYPE.microLetterSpacing,
  },
  title: {
    marginBottom: SPACE.xxs,
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.body,
  },
  price: {
    marginBottom: SPACE.xs,
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.body,
  },
  description: {
    marginBottom: SPACE.sm,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
    lineHeight: TYPE.bodyLineHeight,
  },
  addButton: {
    minHeight: SIZE.smallButtonHeight,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.primary,
  },
  addButtonText: {
    marginLeft: SPACE.xs,
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.label,
  },
  image: {
    width: SIZE.menuItemImage,
    height: SIZE.menuItemImage,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.border,
  },
});
