import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { MetricStrip } from '../components/MetricStrip';
import { FlutedGlass } from '../components/FlutedGlass';
import { C, R, T, S } from '../tokens';

const { width: W } = Dimensions.get('window');
const DIAGRAM_SIZE = Math.min(W - S.gutter * 2, 280);

const LM_METRICS = [
  { key: 'overall', value: '7.4', label: 'Overall', dot: 'good' as const },
  { key: 'jaw',     value: '6.8', label: 'Jaw',     dot: 'good' as const },
  { key: 'canthal', value: '8.1', label: 'Canthal', dot: 'good' as const },
  { key: 'midface', value: '7.2', label: 'Midface', dot: 'good' as const },
  { key: 'skin',    value: '7.8', label: 'Skin',    dot: 'good' as const },
];

/**
 * One-line art face matching the reference image:
 * floating eyebrow arches, almond eye with pupil, long flowing nose, nostril, lips.
 * No face oval — features float in space.
 */
const MinimalistFace: React.FC<{ size: number }> = ({ size }) => {
  const s = { fill: 'none', stroke: C.ink2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 200 250">
      {/* ── Eyebrow — two arching curves ────────────────────────────────── */}
      <Path d="M 44 56 C 80 36 138 38 168 54" {...s} strokeWidth={1.4} />
      <Path d="M 48 66 C 82 50 136 50 164 64" {...s} strokeWidth={0.9} />

      {/* ── Eye — almond shape (two arcs meeting at corners) ──────────── */}
      <Path d="M 56 92 C 82 70 138 70 158 88" {...s} strokeWidth={1.5} />
      <Path d="M 56 92 C 82 110 138 110 158 88" {...s} strokeWidth={1.5} />
      {/* iris ring */}
      <Circle cx={107} cy={90} r={12} {...s} strokeWidth={1.2} />
      {/* pupil */}
      <Circle cx={107} cy={90} r={4.5} fill={C.ink2} />

      {/* ── Nose — long flowing curve from inner eye downward ─────────── */}
      <Path d="M 102 112 C 98 130 94 152 92 170 C 90 184 94 194 103 200" {...s} strokeWidth={1.3} />

      {/* ── Nostril — small circle at nose base ───────────────────────── */}
      <Circle cx={103} cy={202} r={5} {...s} strokeWidth={1.1} />

      {/* ── Upper lip — cupid's bow ───────────────────────────────────── */}
      <Path d="M 68 228 C 82 214 98 222 108 218 C 118 222 134 214 148 228" {...s} strokeWidth={1.5} />
      {/* ── Lower lip — full arc ──────────────────────────────────────── */}
      <Path d="M 68 228 Q 108 246 148 228" {...s} strokeWidth={1.5} />
    </Svg>
  );
};

export const Proportions: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState('overall');

  return (
    <View style={styles.root}>
      <Background mode="lookmax" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <View style={styles.badgeRow}>
              <Text style={[T.kicker, { color: C.accent }]}>✦ PROPORTIONS MODE</Text>
            </View>
            <Text style={[T.h1, { fontSize: 34, marginTop: 4 }]}>
              facial{' '}
              <Text style={{ fontStyle: 'italic', color: C.accentInk }}>structure</Text>
            </Text>
            <Text style={[T.bodySm, { color: C.ink3, marginTop: 4 }]}>
              beyond skin · ratios · angles · improvements
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
            <Text style={{ fontSize: 18, color: C.ink3 }}>⚙</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 16 }}>
          <MetricStrip metrics={LM_METRICS} active={active} onPick={setActive} />
        </View>

        {/* Face diagram — minimalist line art */}
        <FlutedGlass padding={16} mode="lookmax" style={{ marginBottom: 14 }}>
          <View style={styles.diagramWrap}>
            <MinimalistFace size={DIAGRAM_SIZE} />
          </View>
        </FlutedGlass>

        <View style={styles.footer}>
          <Text style={[T.kicker, { color: C.ink3 }]}>METRICS — OVERALL</Text>
          <Text style={[T.kicker, { color: C.ink3 }]}>SCAN · 18H AGO</Text>
        </View>

        <Text style={[T.kicker, { marginBottom: 8, marginTop: 8 }]}>INSIGHTS</Text>
        {[
          {
            title: 'Canthal Tilt: +2.3°',
            body: 'Positive canthal tilt correlates with perceived attractiveness. Yours is mild positive — in the ideal range.',
            tag: 'Good', tagVariant: 'sage',
          },
          {
            title: 'Jaw Width: Moderate',
            body: 'A broader jaw-to-cheekbone ratio can be enhanced through facial exercises and lower body-fat levels.',
            tag: 'Moderate', tagVariant: 'warn',
          },
          {
            title: 'Midface Ratio: 1:1.1',
            body: 'Midface length is well-proportioned. Mewing and proper tongue posture help maintain this long-term.',
            tag: 'Good', tagVariant: 'sage',
          },
        ].map((ins, i) => (
          <FlutedGlass key={i} padding={12} mode="lookmax" style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[T.body, { fontWeight: '600', fontSize: 13, flex: 1 }]}>{ins.title}</Text>
              <View style={[styles.insightTag, { backgroundColor: ins.tagVariant === 'sage' ? C.sageSoft : '#FEF3E2' }]}>
                <Text style={[T.pill, { color: ins.tagVariant === 'sage' ? C.sage : C.warn }]}>{ins.tag}</Text>
              </View>
            </View>
            <Text style={[T.bodySm, { color: C.ink3, marginTop: 6, lineHeight: 17 }]}>{ins.body}</Text>
          </FlutedGlass>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: S.gutter },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  settingsBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  diagramWrap: { alignItems: 'center', backgroundColor: '#FAF8F3', borderRadius: R.md, paddingVertical: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  insightTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: R.pill, marginLeft: 8 },
});
