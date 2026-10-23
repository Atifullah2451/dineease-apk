
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, FONTS, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

const STATUS_STYLES = {
  placed: { backgroundColor: COLORS.blueTint, color: COLORS.blue, label: 'Order placed' },
  preparing: { backgroundColor: COLORS.warningTint, color: COLORS.accent, label: 'Preparing' },
  out_for_delivery: { backgroundColor: COLORS.purpleTint, color: COLORS.purple, label: 'Out for delivery' },
  delivered: { backgroundColor: COLORS.successTint, color: COLORS.success, label: 'Delivered' },
  cancelled: { backgroundColor: COLORS.dangerTint, color: COLORS.danger, label: 'Cancelled' },
};

export default function OrderCard({ order }) {
  const status = STATUS_STYLES[order.status] || {
    backgroundColor: COLORS.neutralTint,
    color: COLORS.textMuted,
    label: order.status,
  };
  const formattedDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) : 'Recently';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.restaurantName}>{order.restaurantName || 'Restaurant'}</Text>
          <Text style={styles.metaText}>{formattedDate} · #{order.id?.slice(-6)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.backgroundColor }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {order.items?.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.addressRow}>
          <Feather name="map-pin" size={SIZE.iconSmall} color={COLORS.textMuted} />
          <Text style={styles.addressText} numberOfLines={1}>{order.deliveryAddress}</Text>
        </View>
        <Text style={styles.totalAmount}>${order.total?.toFixed(2)}</Text>
      </View>
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
    alignItems: 'center',
    marginBottom: SPACE.sm,
  },
  heading: {
    flex: 1,
    marginRight: SPACE.xs,
  },
  restaurantName: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.body,
  },
  metaText: {
    marginTop: SPACE.xxs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  statusBadge: {
    paddingHorizontal: SPACE.xs,
    paddingVertical: SPACE.xxs,
    borderRadius: RADIUS.small,
  },
  statusText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.label,
  },
  itemsList: {
    marginVertical: SPACE.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACE.xxs,
  },
  itemName: {
    flex: 1,
    marginRight: SPACE.sm,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
  },
  itemPrice: {
    color: COLORS.text,
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
  },
  divider: {
    height: SIZE.borderWidth,
    marginVertical: SPACE.sm,
    backgroundColor: COLORS.border,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressRow: {
    flex: 1,
    marginRight: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    flex: 1,
    marginLeft: SPACE.xs,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
    fontSize: TYPE.label,
  },
  totalAmount: {
    color: COLORS.accent,
    fontFamily: FONTS.bodyBold,
    fontSize: TYPE.body,
  },
});
