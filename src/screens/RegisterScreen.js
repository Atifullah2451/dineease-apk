/**
 * DineEase User Registration Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function RegisterScreen({ navigation }) {
  const { register, authError, clearError } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const validateEmail = (str) => {
    return /\S+@\S+\.\S+/.test(str);
  };

  const handleRegister = async () => {
    clearError();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!validateEmail(email)) {
      setFormError('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }
    if (!password) {
      setFormError('Please create a password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, phone);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.brandTitle}>DineEase</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DineEase to reserve tables and order delicious food</Text>
        </View>

        {(formError || authError) ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={SIZE.iconSmall} color={COLORS.danger} />
            <Text style={styles.errorText}>{formError || authError}</Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <Text style={styles.label}>Full Name *</Text>
          <View style={styles.inputContainer}>
            <Feather name="user" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Atif Khan"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                setFormError('');
              }}
              placeholderTextColor={COLORS.placeholder}
              selectionColor={COLORS.primary}
            />
          </View>

          <Text style={styles.label}>Email Address *</Text>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. atif@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setFormError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={COLORS.placeholder}
              selectionColor={COLORS.primary}
            />
          </View>

          <Text style={styles.label}>Phone Number (Optional)</Text>
          <View style={styles.inputContainer}>
            <Feather name="phone" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. +92 300 1234567"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.placeholder}
              selectionColor={COLORS.primary}
            />
          </View>

          <Text style={styles.label}>Password *</Text>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setFormError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor={COLORS.placeholder}
              selectionColor={COLORS.primary}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={SIZE.inputIcon} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.inputContainer}>
            <Feather name="shield" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setFormError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor={COLORS.placeholder}
              selectionColor={COLORS.primary}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            disabled={loading}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={handleRegister}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Create My Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity activeOpacity={INTERACTION.pressOpacity} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: SIZE.contentMaxWidth,
    alignSelf: 'center',
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACE.screen,
    paddingTop: SPACE.xxxl,
    flexGrow: 1,
  },
  header: {
    marginBottom: SPACE.lg,
  },
  brandTitle: {
    marginBottom: SPACE.lg,
    color: COLORS.primary,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
  },
  title: {
    fontSize: TYPE.display,
    fontFamily: FONTS.heading,
    lineHeight: TYPE.headingLineHeight,
    color: COLORS.text,
    marginBottom: SPACE.xs,
  },
  subtitle: {
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerTint,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.danger,
    padding: SPACE.md,
    borderRadius: RADIUS.input,
    marginBottom: SPACE.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyMedium,
    marginLeft: SPACE.xs,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.text,
    marginBottom: SPACE.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.border,
    borderRadius: RADIUS.input,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm,
    marginBottom: SPACE.md,
  },
  inputIcon: {
    marginRight: SPACE.xs,
  },
  input: {
    flex: 1,
    fontSize: TYPE.input,
    fontFamily: FONTS.body,
    color: COLORS.text,
  },
  submitButton: {
    minHeight: SIZE.primaryButtonHeight,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACE.xs,
  },
  buttonDisabled: {
    opacity: INTERACTION.disabledButtonOpacity,
  },
  submitButtonText: {
    color: COLORS.surface,
    fontSize: TYPE.body,
    fontFamily: FONTS.bodySemiBold,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACE.lg,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyBold,
  },
});
