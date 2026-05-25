import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FaceLogo } from '../components/FaceLogo';
import { useStore } from '../store';
import { C, R, T, S } from '../tokens';

export const Login: React.FC = () => {
  const { login, finishOnboarding } = useStore();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('alex@hey.com');
  const [password, setPassword] = useState('••••••••••');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  const handleContinue = () => {
    login();
    finishOnboarding(); // Skip onboarding for demo — set onboarded=true directly
  };

  return (
    <View style={styles.root}>
      <Background />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero */}
          <View style={styles.hero}>
            <FaceLogo size={64} animated color={C.ink} />
            <Text style={styles.wordmark}>poreless</Text>
            <Text style={[T.kicker, { color: C.ink3, marginTop: 4, letterSpacing: 1.2, textAlign: 'center' }]}>
              small things, every day. that&apos;s the whole secret.
            </Text>
          </View>

          <View style={styles.form}>
            {/* Email */}
            <View>
              <Text style={[T.kicker, { marginBottom: 6 }]}>EMAIL</Text>
              <TextInput
                style={[
                  styles.input,
                  emailFocus && styles.inputFocus,
                ]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <View style={{ marginTop: 16 }}>
              <Text style={[T.kicker, { marginBottom: 6 }]}>PASSWORD</Text>
              <TextInput
                style={[
                  styles.input,
                  passFocus && styles.inputFocus,
                ]}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                secureTextEntry
              />
            </View>

            {/* Primary CTA */}
            <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.85}>
              <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>Continue →</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.line} />
              <Text style={[T.kicker, { color: C.ink4, marginHorizontal: 10 }]}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.7}>
                <Text style={[T.button, { color: C.ink2 }]}>Apple</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} activeOpacity={0.7}>
                <Text style={[T.button, { color: C.ink2 }]}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    paddingHorizontal: S.gutter,
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  wordmark: {
    fontFamily: 'CormorantGaramond_400Italic',
    fontSize: 44,
    letterSpacing: -0.88,
    color: C.ink,
    marginTop: 12,
  },
  form: {
    gap: 0,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: C.ink,
  },
  inputFocus: {
    borderColor: C.ink2,
    shadowColor: C.surface2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  primaryBtn: {
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 14,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: C.line,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  ghostBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: R.md,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: C.surface,
  },
});
