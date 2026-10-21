import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

const ICON_MAP = {
  'basket-outline': 'shopping-bag',
  'cart-outline': 'shopping-cart',
  'calendar-outline': 'calendar',
  'search-outline': 'search',
  'fast-food-outline': 'coffee',
};

export default function EmptyState({
  icon = 'basket-outline',
  title = 'No items found',
  message = 'Try adjusting your search filters or check back later.',
  buttonTitle,
  onButtonPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Feather name={ICON_MAP[icon] || icon} size={SIZE.emptyIcon} color={COLORS.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {buttonTitle && onButtonPress && (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonTitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACE.xl,
    marginVertical: SPACE.md,
  },
  iconCircle: {
    width: SIZE.emptyIconCircle,
    height: SIZE.emptyIconCircle,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.successTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.md,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.subtitle,
    marginBottom: SPACE.xs,
    textAlign: 'center',
  },
  message: {
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
    lineHeight: TYPE.bodyLineHeight,
    marginBottom: SPACE.md,
    textAlign: 'center',
  },
  button: {
    minHeight: SIZE.primaryButtonHeight,
    paddingHorizontal: SPACE.md,
    justifyContent: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.surface,
  },
  buttonText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.body,
  },
});
