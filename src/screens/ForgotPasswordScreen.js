/**
 * DineEase Forgot Password Screen
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
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { COLORS, FONTS, INTERACTION, RADIUS, SIZE, SPACE, TYPE } from '../theme/theme.js';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword, authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  const handleReset = async () => {
    clearError();
    setFormError('');

    if (!email.trim()) {
      setFormError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
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
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Feather name="key" size={SIZE.iconLarge} color={COLORS.primary} />
        </View>

        <Text style={styles.brandTitle}>DineEase</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the email associated with your DineEase account and we'll send you instructions to reset your password.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Feather name="mail" size={SIZE.iconMedium} color={COLORS.success} />
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successText}>
              A password reset link has been dispatched to {email}.
            </Text>
            <TouchableOpacity
              style={styles.backToLoginBtn}
              activeOpacity={INTERACTION.pressOpacity}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.backToLoginText}>Return to Sign In</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            {(formError || authError) ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={SIZE.iconSmall} color={COLORS.danger} />
                <Text style={styles.errorText}>{formError || authError}</Text>
              </View>
            ) : null}

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={SIZE.inputIcon} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. atif@example.com"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setFormError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.placeholder}
                selectionColor={COLORS.primary}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              disabled={loading}
              activeOpacity={INTERACTION.pressOpacity}
              onPress={handleReset}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.surface} />
              ) : (
                <Text style={styles.submitButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} activeOpacity={INTERACTION.pressOpacity} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: SPACE.screen,
    paddingTop: SPACE.xxxl,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: SIZE.formBrand,
    height: SIZE.formBrand,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.successTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  brandTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.heading,
    fontSize: TYPE.title,
    marginBottom: SPACE.lg,
  },
  title: {
    fontSize: TYPE.display,
    fontFamily: FONTS.heading,
    color: COLORS.text,
    marginBottom: SPACE.xs,
  },
  subtitle: {
    fontSize: TYPE.body,
    fontFamily: FONTS.body,
    color: COLORS.textMuted,
    lineHeight: TYPE.bodyLineHeight,
    marginBottom: SPACE.lg,
  },
  form: {
    width: '100%',
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
  cancelBtn: {
    alignItems: 'center',
    marginTop: SPACE.md,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontSize: TYPE.small,
    fontFamily: FONTS.bodyMedium,
  },
  successBox: {
    backgroundColor: COLORS.successTint,
    borderWidth: SIZE.borderWidth,
    borderColor: COLORS.success,
    borderRadius: RADIUS.card,
    padding: SPACE.lg,
    alignItems: 'center',
    width: '100%',
  },
  successTitle: {
    fontSize: TYPE.body,
    fontFamily: FONTS.heading,
    color: COLORS.success,
    marginTop: SPACE.md,
    marginBottom: SPACE.xs,
  },
  successText: {
    fontSize: TYPE.small,
    fontFamily: FONTS.body,
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SPACE.md,
  },
  backToLoginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACE.lg,
    minHeight: SIZE.primaryButtonHeight,
    justifyContent: 'center',
    borderRadius: RADIUS.input,
  },
  backToLoginText: {
    color: COLORS.surface,
    fontFamily: FONTS.bodySemiBold,
    fontSize: TYPE.small,
  },
});
