import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { MetricStrip } from '../components/MetricStrip';
import { FlutedGlass } from '../components/FlutedGlass';
import { PremiumModal } from '../components/PremiumModal';
import { useStore } from '../store';
import { C, R, T, S } from '../tokens';

function isWithin7Days(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
}

const { width: W } = Dimensions.get('window');
const DIAGRAM_SIZE = Math.min(W - S.gutter * 2, 280);

const LM_METRICS = [
  { key: 'overall', value: '7.4', label: 'Overall', dot: 'good' as const },
  { key: 'jaw',     value: '6.8', label: 'Jaw',     dot: 'good' as const },
  { key: 'canthal', value: '6.4', label: 'Canthal', dot: 'warn' as const },
  { key: 'midface', value: '6.9', label: 'Midface', dot: 'warn' as const },
  { key: 'skin',    value: '7.8', label: 'Skin',    dot: 'good' as const },
];

/**
 * Single-line abstract face (à la the reference line art): the features sit in
 * a 3/4 read — brows arch upper-right, one almond eye is offset to the right,
 * and a long nose flows down the centre-left into a small curl before the lips.
 * Deliberately asymmetric so it never reads as a centred "cyclops" eye.
 */
const MinimalistFace: React.FC<{ size: number }> = ({ size }) => {
  const s = { fill: 'none', stroke: C.ink2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size * 1.25} viewBox="0 0 200 250">
      {/* ── Brows — main arch above the eye + a softer lower-left brow ─── */}
      <Path d="M 92 58 C 120 42 158 44 182 60" {...s} strokeWidth={1.4} />
      <Path d="M 30 80 C 50 70 78 70 96 76" {...s} strokeWidth={1} />

      {/* ── Eye — almond, offset to the right ─────────────────────────── */}
      <Path d="M 104 96 C 128 80 162 80 184 96" {...s} strokeWidth={1.5} />
      <Path d="M 104 96 C 128 108 162 108 184 96" {...s} strokeWidth={1.5} />
      {/* iris ring */}
      <Circle cx={144} cy={95} r={11} {...s} strokeWidth={1.2} />
      {/* pupil */}
      <Circle cx={144} cy={95} r={4} fill={C.ink2} />

      {/* ── Nose — long flowing line from the left brow into a curl ───── */}
      <Path
        d="M 92 76 C 84 110 76 145 76 168 C 76 182 90 190 98 180 C 103 173 96 167 86 172"
        {...s}
        strokeWidth={1.3}
      />

      {/* ── Upper lip — cupid's bow ───────────────────────────────────── */}
      <Path d="M 78 216 C 94 204 106 211 114 207 C 122 211 134 204 150 216" {...s} strokeWidth={1.5} />
      {/* ── Lower lip — full arc ──────────────────────────────────────── */}
      <Path d="M 78 216 Q 114 235 150 216" {...s} strokeWidth={1.5} />
    </Svg>
  );
};

export const Proportions: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    structural, userProfile, usageCounters,
    recordStructuralScan, showPremiumModal, openPremiumModal, dismissPremiumModal,
  } = useStore();
  const [active, setActive]     = useState('overall');
  const [analysed, setAnalysed] = useState(false);

  const locked = !userProfile.isPremium &&
    usageCounters.structuralScansThisWeek >= 1 &&
    isWithin7Days(usageCounters.lastStructuralScanDate);

  const handleAnalyse = () => {
    if (locked) { openPremiumModal(); return; }
    recordStructuralScan();
    setAnalysed(true);
  };

  const tiltLabel = structural.canthalTilt < 0 ? 'Slightly Downward'
    : structural.canthalTilt > 0 ? 'Positive' : 'Neutral';

  const insights = [
    {
      title: `Canthal Tilt: ${structural.canthalTilt}° (${tiltLabel})`,
      body: structural.canthalTilt < 0
        ? 'A slightly downward outer-eye corner softens the gaze. When applying eye serum, press up-and-out toward the brow tail to lift the appearance — never drag inward.'
        : 'Positive canthal tilt correlates with a more alert, lifted eye area. Maintain with gentle upward eye-care movements.',
      tag: structural.canthalTilt < 0 ? 'Watch' : 'Good',
      tagVariant: structural.canthalTilt < 0 ? 'warn' : 'sage',
    },
    {
      title: `Midface Ratio: ${structural.midfaceRatio.toFixed(2)}${structural.midfaceRatio > 1.08 ? ' (Mild Asymmetry)' : ''}`,
      body: structural.midfaceRatio > 1.08
        ? 'A ratio above 1.08 reads as mild asymmetry. Sculpt the fuller cheek upward toward the temple with fewer passes on the lighter side to even the structure over time.'
        : 'Midface length is well-proportioned. Mewing and proper tongue posture help maintain this long-term.',
      tag: structural.midfaceRatio > 1.08 ? 'Moderate' : 'Good',
      tagVariant: structural.midfaceRatio > 1.08 ? 'warn' : 'sage',
    },
    {
      title: `Fluid Retention: ${structural.fluidRetention}`,
      body: structural.fluidRetention === 'Low'
        ? 'Lymphatic flow is clear. A light morning drainage keeps the midface defined.'
        : 'Trace lymph downward from the inner brow along the jaw to the collarbone — three slow passes per side before product — to de-puff and define.',
      tag: structural.fluidRetention === 'Low' ? 'Good' : 'Moderate',
      tagVariant: structural.fluidRetention === 'Low' ? 'sage' : 'warn',
    },
    {
      title: `Barrier: ${structural.barrierStatus}`,
      body: /sensiti|fatig/i.test(structural.barrierStatus)
        ? 'Your barrier reads reactive. Favour gentle, fragrance-free formulas and press the final layer in with warm palms rather than rubbing to calm reactivity.'
        : 'Barrier health is strong. Consistency compounds — protect it with daily SPF.',
      tag: /sensiti|fatig/i.test(structural.barrierStatus) ? 'Watch' : 'Good',
      tagVariant: /sensiti|fatig/i.test(structural.barrierStatus) ? 'warn' : 'sage',
    },
  ];

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

        <Text style={[T.kicker, { marginBottom: 8, marginTop: 8 }]}>INSIGHTS · FROM YOUR SCAN</Text>
        {insights.map((ins, i) => (
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

        {/* Structural scan CTA — gated for second scan within 7 days */}
        <TouchableOpacity
          style={[styles.analyseBtn, locked && styles.analyseBtnLocked]}
          onPress={handleAnalyse}
          activeOpacity={0.85}
        >
          <Text style={[T.button, { color: locked ? C.ink3 : C.bg, fontSize: 13 }]}>
            {analysed
              ? '✓  Structural analysis complete'
              : locked
                ? '⊘  Unlock structural rescan · Premium'
                : '⊙  Analyse facial structure'}
          </Text>
          {locked && (
            <Text style={[T.kicker, { color: C.ink4, marginTop: 5, fontSize: 9 }]}>
              Free scan used · resets in 7 days · or unlock Premium
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <PremiumModal
        visible={showPremiumModal}
        onClose={dismissPremiumModal}
        reason="structural"
      />
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
  analyseBtn: {
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  analyseBtnLocked: {
    backgroundColor: '#F0EDE8',
    borderWidth: 1,
    borderColor: '#DDD8D0',
  },
});
