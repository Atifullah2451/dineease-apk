/**
 * DineEase Profile & Order History Screen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { useCart } from '../context/CartContext.js';
import { auth } from '../config/firebase.js';
import { orderService } from '../services/orderService.js';
import OrderCard from '../components/OrderCard.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

function OrderSkeleton() {
  return (
    <View style={styles.orderSkeleton}>
      <View style={styles.skeletonLineWide} />
      <View style={styles.skeletonLineShort} />
      <View style={styles.skeletonLineWide} />
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, userProfile, logout } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'account'

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        setLoadingOrders(true);
        try {
          const list = await orderService.getUserOrders(user.uid);
          setOrders(list);
        } catch (e) {
          console.warn('Orders fetch error:', e);
        } finally {
          setLoadingOrders(false);
        }
      }
    }
    fetchOrders();
  }, [user]);

  const performLogout = async () => {
    try {
      await logout();
      clearCart();
      console.log('signOut done, currentUser:', auth.currentUser);
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(error.message || 'Failed to sign out.');
      } else {
        Alert.alert('Sign Out Failed', error.message || 'Failed to sign out.');
      }
    }
  };

  const handleLogout = () => {
    console.log('Sign out pressed');
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out of DineEase?')) {
        void performLogout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to log out of DineEase?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => void performLogout(),
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account & Profile</Text>
        </View>
        <View style={styles.unauthContent}>
          <View style={styles.avatarPlaceholder}>
            <Feather name="user" size={SIZE.iconLarge} color={COLORS.primary} />
          </View>
          <Text style={styles.unauthTitle}>Welcome to DineEase</Text>
          <Text style={styles.unauthSub}>
            Sign in or create an account to view past orders, manage table bookings, and save your delivery details.
          </Text>

          <TouchableOpacity
            style={styles.signInButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={INTERACTION.pressOpacity}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={SIZE.iconSmall} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.fullName
                ? userProfile.fullName.split(' ').map((name) => name.charAt(0)).join('').slice(0, 2).toUpperCase()
                : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile?.fullName || 'Valued Guest'}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            {userProfile?.phone ? (
              <View style={styles.phoneRow}>
                <Feather name="phone" size={SIZE.iconSmall} color={COLORS.textMuted} />
                <Text style={styles.userPhone}>{userProfile.phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Tab Toggle (Orders vs Account Info) */}
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'orders' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Feather name="shopping-bag" size={SIZE.iconSmall} color={activeTab === 'orders' ? COLORS.primary : COLORS.textMuted} />
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'orders' && styles.toggleBtnTextActive,
              ]}
            >
              Order History ({orders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, activeTab === 'account' && styles.toggleBtnActive]}
            onPress={() => setActiveTab('account')}
          >
            <Feather name="user" size={SIZE.iconSmall} color={activeTab === 'account' ? COLORS.primary : COLORS.textMuted} />
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'account' && styles.toggleBtnTextActive,
              ]}
            >
              Account Details
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'orders' ? (
          <View style={styles.ordersSection}>
            {loadingOrders ? (
              <View>
                <OrderSkeleton />
                <OrderSkeleton />
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Feather name="shopping-bag" size={SIZE.iconLarge} color={COLORS.textMuted} />
                <Text style={styles.emptyOrdersTitle}>No past orders found</Text>
                <Text style={styles.emptyOrdersSub}>
                  Your confirmed delivery orders will appear here automatically.
                </Text>
                <TouchableOpacity
                  style={styles.orderNowBtn}
                  activeOpacity={INTERACTION.pressOpacity}
                  onPress={() => navigation.navigate('HomeTab')}
                >
                  <Text style={styles.orderNowText}>Order Now</Text>
                </TouchableOpacity>
              </View>
            ) : (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </View>
        ) : (
          <View style={styles.accountDetailsCard}>
            <Text style={styles.detailsHeading}>Firebase User Record</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>UID</Text>
              <Text style={styles.detailVal} numberOfLines={1}>{user.uid}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email</Text>
              <Text style={styles.detailVal}>{user.email}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Display Name</Text>
              <Text style={styles.detailVal}>{userProfile?.fullName || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Member Since</Text>
              <Text style={styles.detailVal}>
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Active Member'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Security Status</Text>
              <Text style={[styles.detailVal, styles.verifiedText]}>
                Verified & Rules Protected
              </Text>
            </View>
          </View>
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
    minHeight: SIZE.profileHeaderHeight,
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
    flex: 1,
    marginRight: SPACE.sm,
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
  },
  logoutBtn: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACE.sm,
    paddingVertical: SPACE.xs,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.small,
    backgroundColor: COLORS.surface,
  },
  logoutText: {
    color: COLORS.danger,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
    marginLeft: SPACE.xs,
  },
  scrollContent: {
    padding: SPACE.screen,
    paddingBottom: SPACE.xl,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  avatar: {
    width: SIZE.profileAvatar,
    height: SIZE.profileAvatar,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.successTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACE.md,
  },
  avatarText: {
    color: COLORS.primary,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: TYPE.subtitle,
    fontFamily: FONTS.heading,
    color: COLORS.text,
  },
  userEmail: {
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
    color: COLORS.textMuted,
    marginTop: SPACE.xxs,
  },
  userPhone: {
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
    color: COLORS.textMuted,
    marginLeft: SPACE.xs,
  },
  phoneRow: {
    marginTop: SPACE.xxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabToggle: {
    flexDirection: 'row',
    marginBottom: SPACE.md,
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  toggleBtn: {
    flex: 1,
    minHeight: SIZE.categoryTabHeight,
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: SPACE.xs,
  },
  toggleBtnActive: {
    borderBottomWidth: SIZE.borderWidth * 2,
    borderBottomColor: COLORS.primary,
  },
  toggleBtnText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
    color: COLORS.textMuted,
  },
  toggleBtnTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
  },
  ordersSection: {
    width: '100%',
  },
  emptyOrders: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACE.lg,
    borderRadius: RADIUS.card,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  emptyOrdersTitle: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginTop: SPACE.md,
  },
  emptyOrdersSub: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACE.xs,
    marginBottom: SPACE.md,
  },
  orderNowBtn: {
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    paddingHorizontal: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.input,
  },
  orderNowText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.body,
  },
  accountDetailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACE.md,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
  },
  detailsHeading: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACE.xs,
    borderBottomWidth: SIZE.borderWidth,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontFamily: FONTS.body,
    fontSize: TYPE.small,
    color: COLORS.textMuted,
  },
  detailVal: {
    fontFamily: FONTS.bodyMedium,
    fontSize: TYPE.small,
    color: COLORS.text,
    maxWidth: '65%',
  },
  verifiedText: {
    color: COLORS.success,
    fontFamily: FONTS.bodyBold,
  },
  unauthContent: {
    alignItems: 'center',
    padding: SPACE.xl,
    justifyContent: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: SIZE.emptyIconCircle,
    height: SIZE.emptyIconCircle,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.successTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  unauthTitle: {
    fontSize: TYPE.title,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.xs,
  },
  unauthSub: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: TYPE.bodyLineHeight,
    marginBottom: SPACE.lg,
  },
  signInButton: {
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    borderRadius: RADIUS.input,
    alignItems: 'center',
    marginBottom: SPACE.sm,
  },
  signInButtonText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
  },
  registerButton: {
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    width: '100%',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    alignItems: 'center',
  },
  registerButtonText: {
    color: COLORS.text,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
  },
  orderSkeleton: {
    height: SIZE.orderSkeletonHeight,
    marginBottom: SPACE.md,
    padding: SPACE.md,
    justifyContent: 'space-between',
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.card,
    backgroundColor: COLORS.surface,
  },
  skeletonLineWide: {
    width: SIZE.skeletonLongWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
  skeletonLineShort: {
    width: SIZE.skeletonShortWidth,
    height: SIZE.skeletonLineHeight,
    borderRadius: RADIUS.tiny,
    backgroundColor: COLORS.border,
  },
});
