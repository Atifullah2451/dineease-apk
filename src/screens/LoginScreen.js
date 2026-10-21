/**
 * DineEase Login Screen
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

export default function LoginScreen({ navigation }) {
  const { login, authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleLogin = async () => {
    clearError();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }
    if (!password) {
      setFormError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
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
        {/* Logo and Intro */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Feather name="coffee" size={SIZE.iconLarge} color={COLORS.surface} />
          </View>
          <Text style={styles.brandTitle}>DineEase</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to book tables and order food.</Text>
        </View>

        {/* Error Box */}
        {(formError || authError) ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={SIZE.iconSmall} color={COLORS.danger} />
            <Text style={styles.errorText}>{formError || authError}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
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

          <View style={styles.passwordHeader}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotLink}>Forgot?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
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

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            disabled={loading}
            activeOpacity={INTERACTION.pressOpacity}
            onPress={handleLogin}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Create Account link */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity activeOpacity={INTERACTION.pressOpacity} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Create Account</Text>
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
    alignItems: 'flex-start',
    marginBottom: SPACE.xl,
  },
  logoBadge: {
    width: SIZE.formBrand,
    height: SIZE.formBrand,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACE.md,
  },
  brandTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
    marginBottom: SPACE.lg,
  },
  title: {
    color: COLORS.text,
    fontFamily: FONTS.heading,
    fontSize: TYPE.display,
    lineHeight: TYPE.headingLineHeight,
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACE.xs,
  },
  forgotLink: {
    fontSize: TYPE.small,
    fontFamily: FONTS.bodySemiBold,
    color: COLORS.primary,
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
  signupLink: {
    color: COLORS.primary,
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyBold,
  },
});
