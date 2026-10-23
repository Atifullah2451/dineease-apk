/**
 * DineEase My Bookings Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';
import BookingCard from '../components/BookingCard.js';
import EmptyState from '../components/EmptyState.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

function BookingSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonLineLarge} />
      <View style={styles.skeletonLineSmall} />
      <View style={styles.skeletonMeta} />
    </View>
  );
}

export default function BookingsScreen({ navigation }) {
  const { user } = useAuth();
  const { bookings, loading, refreshBookings, cancelBooking } = useBooking();
  const [cancellingId, setCancellingId] = useState(null);

  const handleCancel = (bookingId) => {
    Alert.alert(
      'Cancel Reservation',
      'Are you sure you want to cancel this table booking?',
      [
        { text: 'No, Keep It', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(bookingId);
            try {
              await cancelBooking(bookingId, 'Cancelled by customer');
              Alert.alert('Reservation Cancelled', 'Your table reservation has been cancelled.');
            } catch (e) {
              Alert.alert('Error', e.message);
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
        <EmptyState
          icon="calendar-outline"
          title="Sign in to view your bookings"
          message="Keep track of your upcoming restaurant tables and dining reservations."
          buttonTitle="Sign In"
          onButtonPress={() => navigation.navigate('Login')}
        />
      </View>
      </SafeAreaView>
    );
  }

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'cancelled' || b.status === 'completed'
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <Text style={styles.headerSub}>Manage your restaurant table reservations</Text>
        </View>
        <TouchableOpacity
          style={styles.newBookingBtn}
          onPress={() => navigation.navigate('BookingModal')}
        >
          <Feather name="plus" size={SIZE.iconSmall} color={COLORS.surface} />
          <Text style={styles.newBookingText}>New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshBookings} colors={[COLORS.primary]} />
        }
      >
        {loading && bookings.length === 0 ? (
          <View>
            <BookingSkeleton />
            <BookingSkeleton />
          </View>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No table reservations yet"
            message="Ready for a great meal? Reserve a table at our top partner restaurants."
            buttonTitle="Reserve a Table"
            onButtonPress={() => navigation.navigate('BookingModal')}
          />
        ) : (
          <>
            {/* Upcoming Section */}
            {upcomingBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Upcoming Reservations ({upcomingBookings.length})
                </Text>
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={() => handleCancel(booking.id)}
                  />
                ))}
              </View>
            )}

            {/* Past/Cancelled Section */}
            {pastBookings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Past & Cancelled ({pastBookings.length})
                </Text>
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </View>
            )}
          </>
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
    backgroundColor: COLORS.surface,
    paddingTop: SPACE.lg,
    paddingHorizontal: SPACE.screen,
    paddingBottom: SPACE.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
    color: COLORS.text,
  },
  headerSub: {
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
    color: COLORS.textMuted,
    marginTop: SPACE.xxs,
  },
  newBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.xs,
    borderRadius: RADIUS.small,
  },
  newBookingText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
    marginLeft: SPACE.xs,
  },
  scrollContent: {
    padding: SPACE.screen,
    paddingBottom: SPACE.xl,
  },
  section: {
    marginBottom: SPACE.md,
  },
  sectionTitle: {
    fontFamily: FONTS.heading,
    fontSize: TYPE.body,
    color: COLORS.text,
    marginBottom: SPACE.sm,
  },
  skeletonCard: {
    height: SIZE.bookingSkeletonHeight,
    marginBottom: SPACE.md,
    padding: SPACE.md,
    justifyContent: 'space-between',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  skeletonLineLarge: {
    width: SIZE.skeletonLongWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  skeletonLineSmall: {
    width: SIZE.skeletonShortWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  skeletonMeta: {
    height: SIZE.bookingSkeletonMetaHeight,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.background,
  },
});
