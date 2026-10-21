
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_400Regular, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext.js';
import { CartProvider } from './src/context/CartContext.js';
import { BookingProvider } from './src/context/BookingContext.js';
import { AppNavigator } from './src/navigation/AppNavigator.js';
import { COLORS, FONTS } from './src/theme/theme.js';

export default function App() {
  const [fontsLoaded] = useFonts({
    [FONTS.heading]: Fraunces_600SemiBold,
    [FONTS.headingRegular]: Fraunces_400Regular,
    [FONTS.body]: DMSans_400Regular,
    [FONTS.bodyMedium]: DMSans_500Medium,
    [FONTS.bodySemiBold]: DMSans_600SemiBold,
    [FONTS.bodyBold]: DMSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <BookingProvider>
            <StatusBar style="dark" backgroundColor={COLORS.surface} />
            <AppNavigator />
          </BookingProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
