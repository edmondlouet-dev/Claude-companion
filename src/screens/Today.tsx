import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FaceLogo } from '../components/FaceLogo';
import { MetricStrip } from '../components/MetricStrip';
import { RoutineRow } from '../components/RoutineRow';
import { FlutedGlass } from '../components/FlutedGlass';
import { useStore } from '../store';
import { buildRoutine, routineGaps, STEP_LABEL } from '../products';
import { C, R, T, S } from '../tokens';

const METRICS = [
  { key: 'overall', value: '78', label: 'Overall', dot: 'good' as const },
  { key: 'acne',    value: '64', label: 'Acne',    dot: 'warn' as const },
  { key: 'hydro',   value: '82', label: 'Hydration', dot: 'good' as const },
  { key: 'tone',    value: '71', label: 'Tone',    dot: 'good' as const },
  { key: 'pore',    value: '69', label: 'Pores',   dot: 'good' as const },
  { key: 'red',     value: '88', label: 'Calm',    dot: 'good' as const },
  { key: 'oil',     value: '55', label: 'Oil',     dot: 'warn' as const },
  { key: 'tex',     value: '74', label: 'Texture', dot: 'good' as const },
];

const WHY: Partial<Record<string, string>> = {
  spf:         'UV index 6 today. SPF reduces UV-induced free radicals and prevents hyperpigmentation. Reapply every 2h while outdoors.',
  antiox:      'Vitamin C neutralises free radicals. Layered before SPF, it amplifies photoprotection by up to 8×.',
  serum:       'Treatment serums go on after cleansing so actives can penetrate before heavier occlusives seal them out.',
  cleanser:    'A gentle cleanser removes overnight sebum without stripping the barrier — sets a clean slate for actives.',
  moisturizer: 'Locking in moisture is non-negotiable. A compromised barrier lets everything else work less effectively.',
};

export const Today: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { owned, streak } = useStore();
  const [activeMetric, setActiveMetric] = useState('overall');
  const [quickAdd, setQuickAdd] = useState('');

  const routine = buildRoutine(owned, 'AM');
  const gaps = routineGaps(owned);

  const today = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dateStr = `${days[today.getDay()]} · ${months[today.getMonth()]} ${today.getDate()}`;

  return (
    <View style={styles.root}>
      <Background />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 4, paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand row */}
        <View style={styles.brandRow}>
          <View style={styles.brand}>
            <FaceLogo size={26} strokeWidth={1.4} />
            <Text style={styles.wordmark}>poreless</Text>
          </View>
          <View style={styles.streak}>
            <Svg width={14} height={14} viewBox="0 0 24 24">
              <Path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 0-5 0-8z"
                fill="none" stroke={C.warn} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[T.num, { fontSize: 13, fontWeight: '600', color: C.warn }]}>{streak}</Text>
          </View>
        </View>

        {/* Date + greeting */}
        <View style={{ marginBottom: 16 }}>
          <Text style={[T.kicker, { marginBottom: 5 }]}>{dateStr} · 73° · UV 6</Text>
          <Text style={[T.h1, { fontSize: 32 }]}>
            good morning, <Text style={{ fontStyle: 'italic', color: C.accentInk }}>alex</Text>
          </Text>
        </View>

        {/* Score strip */}
        <View style={styles.sectionHeader}>
          <Text style={T.kicker}>SCORES</Text>
          <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>last scan · 18h ago</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <MetricStrip metrics={METRICS} active={activeMetric} onPick={setActiveMetric} />
        </View>

        {/* Routine header */}
        <View style={styles.sectionHeader}>
          <Text style={[T.kicker, { flex: 1 }]}>THIS MORNING · AUTO-GENERATED FROM YOUR PRODUCTS</Text>
          <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>{routine.length} steps</Text>
        </View>

        {/* Quick-add input */}
        <View style={styles.quickAdd}>
          <TextInput
            style={styles.quickInput}
            placeholder="add step… (press T)"
            placeholderTextColor={C.ink3}
            value={quickAdd}
            onChangeText={setQuickAdd}
            onSubmitEditing={() => setQuickAdd('')}
          />
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
            <Text style={[T.button, { color: C.ink, fontSize: 16, lineHeight: 18 }]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Routine list */}
        {routine.map((step, i) => (
          <RoutineRow
            key={step.name}
            idx={i + 1}
            stepName={STEP_LABEL[step.category]}
            productName={step.name}
            time={i < 2 ? `7:4${i + 2}` : undefined}
            defaultDone={i < 2}
            why={WHY[step.category]}
          />
        ))}

        {/* Gaps */}
        {gaps.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 16 }]}>
              <Text style={T.kicker}>GAPS IN YOUR STACK</Text>
              <Text style={[T.num, { fontSize: 10, color: C.warn }]}>{gaps.length} flagged</Text>
            </View>
            {gaps.map(g => (
              <FlutedGlass key={g.key} padding={11} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.warn }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '500', textTransform: 'capitalize' }]}>
                      Add a {g.label}
                    </Text>
                    <Text style={[T.bodySm, { color: C.ink3, marginTop: 1 }]}>{g.reason}</Text>
                  </View>
                  <TouchableOpacity style={styles.browseBtn} activeOpacity={0.7}>
                    <Text style={[T.button, { fontSize: 11 }]}>Browse</Text>
                  </TouchableOpacity>
                </View>
              </FlutedGlass>
            ))}
          </>
        )}

        {/* Footer hint */}
        <View style={styles.hint}>
          <Text style={[T.kicker, { color: C.ink3, textAlign: 'center', lineHeight: 16 }]}>
            ✓ tap row = done · ✦ WHY = science · + quick add
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: S.gutter },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: {
    fontFamily: 'CormorantGaramond_400Italic',
    fontSize: 22,
    letterSpacing: -0.44,
    color: C.ink,
  },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAdd: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  quickInput: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: R.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: C.ink,
    borderWidth: 0,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.line2,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseBtn: {
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: R.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: C.surface,
  },
  hint: {
    marginTop: 16,
    padding: 10,
    backgroundColor: C.surface2,
    borderRadius: R.md,
  },
});
