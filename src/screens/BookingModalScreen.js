/**
 * DineEase Table Reservation Modal Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { useBooking } from '../context/BookingContext.js';
import { restaurantService } from '../services/restaurantService.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SHADOW, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function BookingModalScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const { user, userProfile } = useAuth();
  const { createBooking } = useBooking();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestId, setSelectedRestId] = useState(restaurant?.id || '');
  const [selectedDate, setSelectedDate] = useState(() => {
    // Tomorrow as default
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [customerName, setCustomerName] = useState(userProfile?.fullName || '');
  const [contactNumber, setContactNumber] = useState(userProfile?.phone || '+92 300 9876543');
  const [specialRequest, setSpecialRequest] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Load restaurants if not pre-provided
  useEffect(() => {
    async function loadAll() {
      try {
        const list = await restaurantService.getRestaurants();
        setRestaurants(list);
        if (!selectedRestId && list.length > 0) {
          setSelectedRestId(list[0].id);
        }
      } catch (e) {
        console.warn(e);
      }
    }
    loadAll();
  }, [selectedRestId]);

  const currentRestaurant =
    restaurant || restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const availableSlots = currentRestaurant?.availableSlots || [
    '01:00 PM',
    '02:30 PM',
    '07:00 PM',
    '08:30 PM',
    '09:30 PM',
  ];

  // Pick first slot by default if not picked
  useEffect(() => {
    if (availableSlots.length > 0 && !selectedTimeSlot) {
      setSelectedTimeSlot(availableSlots[0]);
    }
  }, [availableSlots, selectedTimeSlot]);

  // Next 5 upcoming dates
  const upcomingDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      iso: d.toISOString().split('T')[0],
      dayName: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: d.getDate(),
      month: d.toLocaleDateString(undefined, { month: 'short' }),
    };
  });

  const handleConfirmReservation = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to make a table reservation.', [
        { text: 'Sign In', onPress: () => navigation.navigate('Login') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    if (!customerName.trim()) {
      Alert.alert('Missing Field', 'Please enter your name.');
      return;
    }
    if (!contactNumber.trim()) {
      Alert.alert('Missing Field', 'Please enter your contact phone number.');
      return;
    }
    if (!selectedTimeSlot) {
      Alert.alert('Select Time', 'Please choose a dining time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createBooking({
        restaurantId: currentRestaurant.id,
        restaurantName: currentRestaurant.name,
        bookingDate: selectedDate,
        timeSlot: selectedTimeSlot,
        guestCount,
        customerName,
        contactNumber,
        specialRequest,
      });

      setBookingSuccess(res.bookingId);
    } catch (error) {
      Alert.alert('Reservation Failed', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <SafeAreaView style={styles.safeArea}>
      <View style={styles.successWrapper}>
        <View style={styles.successIcon}>
          <Feather name="check" size={SIZE.iconLarge} color={COLORS.surface} />
        </View>
        <Text style={styles.successTitle}>Table Reserved!</Text>
        <Text style={styles.successSubtitle}>
          Your table at {currentRestaurant?.name} is confirmed for {guestCount} guests.
        </Text>

        <View style={styles.confirmationCard}>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>Reservation ID</Text>
            <Text style={styles.confVal}>#{bookingSuccess.slice(-8)}</Text>
          </View>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>Date & Time</Text>
            <Text style={styles.confVal}>{selectedDate} at {selectedTimeSlot}</Text>
          </View>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>Party Size</Text>
            <Text style={styles.confVal}>{guestCount} Guests</Text>
          </View>
          <View style={styles.confRow}>
            <Text style={styles.confLabel}>Guest Name</Text>
            <Text style={styles.confVal}>{customerName}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={() => {
            navigation.goBack();
            navigation.navigate('BookingsTab');
          }}
        >
          <Text style={styles.primaryBtnText}>View in My Bookings</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Restaurant Header Badge */}
        <View style={styles.restBanner}>
          <Feather name="coffee" size={SIZE.iconMedium} color={COLORS.primary} />
          <View style={styles.restaurantBannerText}>
            <Text style={styles.restBannerName}>{currentRestaurant?.name}</Text>
            <Text style={styles.restBannerHours}>Open Hours: {currentRestaurant?.openingHours}</Text>
          </View>
        </View>

        {/* Date Selector */}
        <Text style={styles.sectionHeading}>1. Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
          {upcomingDates.map((item) => {
            const isSelected = selectedDate === item.iso;
            return (
              <TouchableOpacity
                key={item.iso}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => setSelectedDate(item.iso)}
              >
                <Text style={[styles.dayName, isSelected && styles.dateTextActive]}>{item.dayName}</Text>
                <Text style={[styles.dayNumber, isSelected && styles.dateTextActive]}>{item.dayNumber}</Text>
                <Text style={[styles.monthName, isSelected && styles.dateTextActive]}>{item.month}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Slot Selector */}
        <Text style={styles.sectionHeading}>2. Select Time Slot</Text>
        <View style={styles.timeSlotGrid}>
          {availableSlots.map((slot) => {
            const isSelected = selectedTimeSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                style={[styles.timeSlotPill, isSelected && styles.timeSlotActive]}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <Feather name="clock" size={SIZE.iconSmall} color={isSelected ? COLORS.surface : COLORS.textMuted} />
                <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Guest Count Selector */}
        <Text style={styles.sectionHeading}>3. Number of Guests</Text>
        <View style={styles.guestCounter}>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => setGuestCount(Math.max(1, guestCount - 1))}
          >
            <Feather name="minus" size={SIZE.iconSmall} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.guestInfo}>
            <Text style={styles.guestCountText}>{guestCount}</Text>
            <Text style={styles.guestSub}>{guestCount === 1 ? 'Person' : 'People'}</Text>
          </View>
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={() => setGuestCount(Math.min(20, guestCount + 1))}
          >
            <Feather name="plus" size={SIZE.iconSmall} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Guest Details Form */}
        <Text style={styles.sectionHeading}>4. Contact Details</Text>
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Customer Name</Text>
          <TextInput
            style={styles.inputField}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Your full name"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
          />

          <Text style={styles.fieldLabel}>Contact Phone</Text>
          <TextInput
            style={styles.inputField}
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="e.g. +92 300 1234567"
            keyboardType="phone-pad"
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
          />

          <Text style={styles.fieldLabel}>Special Request (Optional)</Text>
          <TextInput
            style={[styles.inputField, styles.multilineInput]}
            value={specialRequest}
            onChangeText={setSpecialRequest}
            placeholder="Window seat, anniversary, birthday decoration..."
            placeholderTextColor={COLORS.placeholder}
            selectionColor={COLORS.primary}
            multiline
          />
        </View>

        {/* Submit Reservation CTA */}
        <TouchableOpacity
          style={[styles.confirmBtn, submitting && styles.buttonDisabled]}
          disabled={submitting}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={handleConfirmReservation}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Confirm Table Reservation</Text>
              <Feather name="check-circle" size={SIZE.iconSmall} color={COLORS.surface} style={styles.confirmIcon} />
            </>
          )}
        </TouchableOpacity>
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
  scrollContent: {
    padding: SPACE.screen,
    paddingBottom: SPACE.xl,
  },
  restBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACE.md,
    borderRadius: RADIUS.card,
    marginBottom: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  restaurantBannerText: {
    flex: 1,
    marginLeft: SPACE.sm,
  },
  restBannerName: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  restBannerHours: {
    fontSize: TYPE.label,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    marginTop: SPACE.xxs,
  },
  sectionHeading: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.sm,
    marginTop: SPACE.xs,
  },
  dateScroll: {
    marginBottom: SPACE.md,
  },
  dateCard: {
    backgroundColor: COLORS.surface,
    width: SIZE.bookingDateWidth,
    height: SIZE.bookingDateHeight,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACE.sm,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  dateCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayName: {
    fontSize: TYPE.label,
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
  },
  dayNumber: {
    fontSize: TYPE.subtitle,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
    marginVertical: SPACE.xxs,
  },
  monthName: {
    fontSize: TYPE.micro,
    color: COLORS.textMuted,
    fontFamily: FONTS.body,
  },
  dateTextActive: {
    color: COLORS.surface,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: SPACE.xs,
    rowGap: SPACE.xs,
    marginBottom: SPACE.md,
  },
  timeSlotPill: {
    minHeight: SIZE.filterOptionHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACE.md,
    borderRadius: RADIUS.small,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    columnGap: SPACE.xs,
  },
  timeSlotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeSlotText: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyMedium,
    color: COLORS.text,
  },
  timeSlotTextActive: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
  },
  guestCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    justifyContent: 'space-between',
    marginBottom: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  guestBtn: {
    width: SIZE.stepperButton,
    height: SIZE.stepperButton,
    borderRadius: RADIUS.small,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInfo: {
    alignItems: 'center',
  },
  guestCountText: {
    fontSize: TYPE.title,
    fontFamily: FONTS.bodyBold,
    color: COLORS.text,
  },
  guestSub: {
    fontSize: TYPE.label,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    marginBottom: SPACE.lg,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  fieldLabel: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
    marginBottom: SPACE.xxs,
    marginTop: SPACE.xs,
  },
  inputField: {
    minHeight: SIZE.inputHeight,
    backgroundColor: COLORS.surface,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  multilineInput: {
    height: SIZE.multilineInputHeight,
    textAlignVertical: 'top',
  },
  confirmBtn: {
    minHeight: SIZE.primaryButtonHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.input,
    ...SHADOW,
  },
  buttonDisabled: {
    opacity: INTERACTION.disabledOpacity,
  },
  confirmBtnText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
  },
  confirmIcon: {
    marginLeft: SPACE.xs,
  },
  successWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: SIZE.contentMaxWidth,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
    padding: SPACE.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    width: SIZE.successIconCircle,
    height: SIZE.successIconCircle,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.md,
  },
  successTitle: {
    fontSize: TYPE.display,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.xs,
  },
  successSubtitle: {
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: TYPE.bodyLineHeight,
    marginBottom: SPACE.lg,
  },
  confirmationCard: {
    backgroundColor: COLORS.surface,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    width: '100%',
    marginBottom: SPACE.lg,
  },
  confRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACE.xs,
  },
  confLabel: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  confVal: {
    maxWidth: '60%',
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
    textAlign: 'right',
  },
  primaryBtn: {
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    borderRadius: RADIUS.input,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
  },
});
