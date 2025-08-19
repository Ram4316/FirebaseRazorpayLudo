import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors, typography, spacing, layout } from '../theme';
import { PrimaryButton, SecondaryButton } from '../components/PrimaryButton';

export const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const theme = colors.light; // TODO: Add dark mode support

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    // TODO: Implement Google OAuth
    Alert.alert('Coming Soon', 'Google authentication will be available soon');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.primary }]}>
              🎲 Ludo Game
            </Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>
              Play real-money Ludo with friends
            </Text>
          </View>

          {/* Auth Form */}
          <View style={[styles.formContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.formTitle, { color: theme.text }]}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Text>

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Email address"
              placeholderTextColor={theme.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email input"
            />

            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Password"
              placeholderTextColor={theme.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              accessibilityLabel="Password input"
            />

            {!isLogin && (
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                placeholder="Confirm password"
                placeholderTextColor={theme.muted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                accessibilityLabel="Confirm password input"
              />
            )}

            <PrimaryButton
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={handleEmailAuth}
              loading={loading}
              style={styles.authButton}
            />

            <SecondaryButton
              title="Continue with Google"
              onPress={handleGoogleAuth}
              style={styles.googleButton}
            />

            {/* Switch between login/signup */}
            <View style={styles.switchContainer}>
              <Text style={[styles.switchText, { color: theme.muted }]}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </Text>
              <PrimaryButton
                title={isLogin ? 'Sign Up' : 'Sign In'}
                onPress={() => setIsLogin(!isLogin)}
                style={[styles.switchButton, { backgroundColor: 'transparent' }]}
                textStyle={{ color: theme.primary }}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.muted }]}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logo: {
    fontSize: 48,
    fontFamily: typography.fonts.heading,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
  },
  formContainer: {
    borderRadius: layout.borderRadius * 2,
    padding: spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.sizes.h2,
    fontFamily: typography.fonts.heading,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 2,
    borderRadius: layout.borderRadius,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
    marginBottom: spacing.lg,
    minHeight: layout.touchTarget,
  },
  authButton: {
    marginBottom: spacing.lg,
  },
  googleButton: {
    marginBottom: spacing.xl,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  switchText: {
    fontSize: typography.sizes.body,
    fontFamily: typography.fonts.body,
  },
  switchButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 0,
    marginLeft: spacing.xs,
    minHeight: 'auto',
    elevation: 0,
    shadowOpacity: 0,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.caption,
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    lineHeight: typography.sizes.caption * 1.4,
  },
});

export default AuthScreen;