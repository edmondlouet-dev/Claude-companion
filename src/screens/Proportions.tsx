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
 * Minimalist single-line face — inspired by the one-stroke art style in the
 * reference image. Clean oval, one almond eye, subtle nose, simple lips.
 */
const MinimalistFace: React.FC<{ size: number }> = ({ size }) => {
  const s = { fill: 'none', stroke: C.ink3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const thin  = { ...s, strokeWidth: 0.9 };
  const thick = { ...s, strokeWidth: 1.0, stroke: C.ink2 };
  return (
    <Svg width={size} height={size} viewBox="0 0 200 230">
      {/* ── Face outline — clean oval ────────────────────────────────────── */}
      <Path
        d="M 100 26
           C 66 26 42 58 42 110
           C 42 162 64 203 100 208
           C 136 203 158 162 158 110
           C 158 58 134 26 100 26 Z"
        {...thick}
      />

      {/* ── One eye (right, almond) — two arcs meeting at corners ────────── */}
      <Path d="M 70 96 C 77 87 96 87 103 96" {...thin} />
      <Path d="M 70 96 C 77 103 96 103 103 96" {...thin} />
      {/* pupil dot */}
      <Circle cx={86} cy={96} r={2.8} fill={C.ink3} />

      {/* ── Nose — minimal bridge line ──────────────────────────────────── */}
      <Path d="M 99 112 C 97 126 95 134 97 140 C 101 145 104 145 107 140" {...thin} />

      {/* ── Lips — upper bow + lower arc ────────────────────────────────── */}
      {/* upper lip philtrum bow */}
      <Path d="M 80 161 Q 90 155 100 158 Q 110 155 120 161" {...thin} />
      {/* lower lip */}
      <Path d="M 80 161 Q 100 170 120 161" {...thin} />

      {/* ── Golden-ratio overlay lines (faint) ──────────────────────────── */}
      {/* vertical centre */}
      <Line x1={100} y1={30} x2={100} y2={205}
        stroke={C.accent} strokeOpacity={0.18} strokeWidth={0.5} strokeDasharray="3 5" />
      {/* horizontal eye line */}
      <Line x1={45} y1={96} x2={155} y2={96}
        stroke={C.accent} strokeOpacity={0.18} strokeWidth={0.5} strokeDasharray="3 5" />
      {/* third-line */}
      <Line x1={45} y1={158} x2={155} y2={158}
        stroke={C.accent} strokeOpacity={0.14} strokeWidth={0.5} strokeDasharray="3 5" />

      {/* ── Landmark accent dots ─────────────────────────────────────────── */}
      {[[100, 26], [86, 96], [100, 140], [100, 160], [100, 207]].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={2} fill={C.accentSoft} stroke={C.accent} strokeWidth={0.7} />
      ))}
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
