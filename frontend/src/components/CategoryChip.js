import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function CategoryChip({ label, isSelected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.selectedChip]}
      activeOpacity={INTERACTION.pressOpacity}
      onPress={onPress}
    >
      <Text style={[styles.text, isSelected && styles.selectedText]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: SIZE.filterOptionHeight,
    paddingHorizontal: SPACE.md,
    justifyContent: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  selectedChip: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.successTint,
  },
  text: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
  },
  selectedText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
  },
});
