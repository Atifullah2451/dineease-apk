import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

const STATUS_STYLES = {
  confirmed: { backgroundColor: COLORS.successTint, color: COLORS.success, label: 'Confirmed' },
  pending: { backgroundColor: COLORS.warningTint, color: COLORS.accent, label: 'Pending' },
  cancelled: { backgroundColor: COLORS.dangerTint, color: COLORS.danger, label: 'Cancelled' },
  completed: { backgroundColor: COLORS.blueTint, color: COLORS.blue, label: 'Completed' },
};

export default function BookingCard({ booking, onCancel }) {
  const statusStyle = STATUS_STYLES[booking.status] || {
    backgroundColor: COLORS.neutralTint,
    color: COLORS.textMuted,
    label: booking.status,
  };
  const isCancellable = booking.status === 'confirmed' || booking.status === 'pending';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.restaurantName}>{booking.restaurantName || 'Restaurant'}</Text>
          <Text style={styles.bookingId}>Booking ID: #{booking.id?.slice(-8)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.label}</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={SIZE.iconSmall} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{booking.bookingDate}</Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="clock" size={SIZE.iconSmall} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{booking.timeSlot}</Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="users" size={SIZE.iconSmall} color={COLORS.primary} />
          <Text style={styles.detailLabel}>Guests</Text>
          <Text style={styles.detailValue}>{booking.guestCount} people</Text>
        </View>
      </View>

      {booking.specialRequest ? (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Special request</Text>
          <Text style={styles.notesText}>{booking.specialRequest}</Text>
        </View>
      ) : null}

      {isCancellable && onCancel && (
        <TouchableOpacity
          style={styles.cancelButton}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={() => onCancel(booking.id)}
        >
          <Text style={styles.cancelText}>Cancel reservation</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: SPACE.md,
    padding: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACE.md,
  },
  heading: {
    flex: 1,
    marginRight: SPACE.xs,
  },
  restaurantName: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.subtitle,
  },
  bookingId: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  statusBadge: {
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.small,
  },
  statusText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.label,
  },
  detailsGrid: {
    padding: SPACE.sm,
    marginBottom: SPACE.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.background,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  detailValue: {
    marginTop: SPACE.xxs,
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.label,
    textAlign: 'center',
  },
  notesContainer: {
    padding: SPACE.sm,
    marginBottom: SPACE.sm,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.warningTint,
  },
  notesLabel: {
    color: COLORS.text,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.label,
  },
  notesText: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  cancelButton: {
    minHeight: SIZE.slimButtonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  cancelText: {
    color: COLORS.danger,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
});
