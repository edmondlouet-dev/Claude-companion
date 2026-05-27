/**
 * Business pitch / value-prop onboarding screen.
 * Shown once on first install. Never shown again after account creation.
 */
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FaceLogo } from '../components/FaceLogo';
import { FlutedGlass } from '../components/FlutedGlass';
import { C, R, T, S } from '../tokens';

const FEATURES = [
  {
    icon: '⬡',
    title: 'AI scan. 28 biomarkers.',
    body: 'Our computer-vision model reads hydration, texture, pores, redness, tone and more from a single front-camera frame — in under 3 seconds.',
  },
  {
    icon: '◈',
    title: 'Your shelf. Your routine.',
    body: 'Add the products you already own. Poreless auto-generates a layered AM/PM routine ranked by actives — no guesswork, no upselling.',
  },
  {
    icon: '◉',
    title: 'Science from 7 civilisations.',
    body: 'Japanese mizu-no-te, Korean glass skin, Ayurvedic dinacharya and more — AI picks the ritual that matches your biology.',
  },
  {
    icon: '◐',
    title: 'Real data. Real progress.',
    body: 'Every scan logs 8 scores. Track trends over weeks and months with charts built from your actual skin — not stock photos.',
  },
];

interface Props { onContinue: () => void }

export const Pitch: React.FC<Props> = ({ onContinue }) => {
  const insets = useSafeAreaInsets();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <Background />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Logo + headline */}
          <View style={styles.hero}>
            <FaceLogo size={64} animated color={C.ink} />
            <Text style={styles.wordmark}>poreless.</Text>
            <Text style={[T.h2, { textAlign: 'center', marginTop: 6, fontSize: 22, color: C.ink }]}>
              backed by real science.
            </Text>
            <Text style={[T.bodySm, { color: C.ink3, textAlign: 'center', marginTop: 10, lineHeight: 18 }]}>
              Not guesswork. Not trends.{'\n'}
              Peer-reviewed research applied to your skin.
            </Text>
          </View>

          {/* Feature cards */}
          <View style={{ gap: 10, marginBottom: 28 }}>
            {FEATURES.map((f, i) => (
              <FlutedGlass key={i} padding={14}>
                <View style={styles.featureRow}>
                  <View style={styles.featureIconWrap}>
                    <Text style={[T.body, { color: C.accent, fontSize: 20 }]}>{f.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '600', fontSize: 14, color: C.ink }]}>
                      {f.title}
                    </Text>
                    <Text style={[T.bodySm, { color: C.ink3, marginTop: 4, lineHeight: 17 }]}>
                      {f.body}
                    </Text>
                  </View>
                </View>
              </FlutedGlass>
            ))}
          </View>

          {/* Social proof */}
          <FlutedGlass padding={14} style={{ marginBottom: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 28 }}>✦</Text>
              <View style={{ flex: 1 }}>
                <Text style={[T.body, { fontWeight: '600', color: C.ink }]}>
                  True results. No filters.
                </Text>
                <Text style={[T.bodySm, { color: C.ink3, marginTop: 3, lineHeight: 17 }]}>
                  Scores are derived from computer-vision models trained on dermatology datasets.
                  What you see is what your skin actually looks like.
                </Text>
              </View>
            </View>
          </FlutedGlass>

          {/* CTA */}
          <TouchableOpacity style={styles.cta} onPress={onContinue} activeOpacity={0.85}>
            <Text style={[T.button, { color: C.bg, fontSize: 15 }]}>Begin →</Text>
          </TouchableOpacity>

          {/* Legal disclaimers */}
          <Text style={styles.disclaimer}>
            Poreless is a wellness and skincare-tracking tool. It does not constitute medical
            advice and is not a substitute for professional dermatological assessment.
            AI skin scores are estimates based on image analysis — individual results vary.
            Consult a qualified dermatologist for clinical concerns, diagnosed conditions,
            or prescription treatment.{'\n\n'}
            Product efficacy claims are based on published literature and may not apply to
            all skin types. Poreless does not endorse any specific product brand.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: S.gutter },
  hero: { alignItems: 'center', marginBottom: 32 },
  wordmark: {
    fontFamily: 'CormorantGaramond_400Italic',
    fontSize: 52,
    letterSpacing: -1,
    color: C.ink,
    marginTop: 12,
  },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  featureIconWrap: {
    width: 36, height: 36,
    borderRadius: R.md,
    backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  cta: {
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disclaimer: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: C.ink4,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 8,
  },
});
