import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Linking,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Wind } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FaceLogo } from '../components/FaceLogo';
import { MetricStrip } from '../components/MetricStrip';
import { RoutineRow } from '../components/RoutineRow';
import { FlutedGlass } from '../components/FlutedGlass';
import { LiveActivityWidget } from '../components/LiveActivityWidget';
import { AmbientModeOverlay, type AmbientStep } from '../components/AmbientModeOverlay';
import { useStore } from '../store';
import { buildRoutine, routineGaps, STEP_LABEL, type ProductCategory } from '../products';
import { getRitual, adaptRoutineForRitual } from '../rituals';
import { C, R, T, S } from '../tokens';

const METRICS = [
  { key: 'overall', value: '78', label: 'Overall',   dot: 'good' as const },
  { key: 'acne',    value: '64', label: 'Acne',      dot: 'warn' as const },
  { key: 'hydro',   value: '82', label: 'Hydration', dot: 'good' as const },
  { key: 'tone',    value: '71', label: 'Tone',      dot: 'good' as const },
  { key: 'pore',    value: '69', label: 'Pores',     dot: 'good' as const },
  { key: 'red',     value: '88', label: 'Calm',      dot: 'good' as const },
  { key: 'oil',     value: '55', label: 'Oil',       dot: 'warn' as const },
  { key: 'tex',     value: '74', label: 'Texture',   dot: 'good' as const },
];

const WHY: Partial<Record<string, string>> = {
  spf:         'UV index 6 today. SPF reduces UV-induced free radicals and prevents hyperpigmentation. Reapply every 2h outdoors.',
  antiox:      'Vitamin C neutralises free radicals. Layered before SPF it amplifies photoprotection by up to 8x.',
  serum:       'Treatment serums go on after cleansing so actives penetrate before heavier occlusives seal them out.',
  cleanser:    'A gentle cleanser removes overnight sebum without stripping the barrier.',
  moisturizer: 'Locking in moisture is non-negotiable. A compromised barrier lets everything else work less effectively.',
  retinoid:    'Adapalene accelerates cell turnover. PM only — UV degrades retinoids and increases photosensitivity.',
};

const BROWSE_URLS: Record<ProductCategory, string> = {
  cleanser:    'https://www.sephora.com/search?keyword=gentle+face+cleanser',
  moisturizer: 'https://www.sephora.com/search?keyword=face+moisturizer',
  spf:         'https://www.sephora.com/search?keyword=mineral+sunscreen+spf+face',
  serum:       'https://www.sephora.com/search?keyword=treatment+serum',
  antiox:      'https://www.sephora.com/search?keyword=vitamin+c+serum+face',
  retinoid:    'https://www.sephora.com/search?keyword=retinol+serum',
  exfoliant:   'https://www.sephora.com/search?keyword=chemical+exfoliant+BHA+AHA',
};

function getDailyInsight(scores: any, uv: number, tempUnit: string): string {
  if (!scores) return `UV ${uv} today — your SPF is your single most important product.`;
  if (scores.hydration < 70)
    return `Hydration ${scores.hydration} — apply HA serum within 60 sec of cleansing. Damp skin absorbs 2x more.`;
  if (scores.oil > 70)
    return `Oil elevated (${scores.oil}). Niacinamide regulates sebum by up to 52% with consistent AM use.*`;
  if (scores.acne < 65)
    return `Acne score ${scores.acne}. BHA (salicylic acid) penetrates pores and reduces comedones by ~50% in 8 weeks.*`;
  if (uv >= 6)
    return `UV ${uv} — free radicals peak 10am–2pm. Consistent SPF use reduces photoaging markers by up to 24%.*`;
  return `Skin score ${scores.overall} — barrier health is strong. Consistency compounds: 90 days beats any serum.`;
}

export const Today: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    owned, streak, activeRitual, user, lastScores, temperatureUnit,
    ritualStreaks, completeDailyRitual,
  } = useStore();
  const [activeMetric, setActiveMetric] = useState('overall');
  const [quickAdd, setQuickAdd]         = useState('');
  const [showAmbient, setShowAmbient]   = useState(false);

  const routine = buildRoutine(owned, 'AM');
  const gaps    = routineGaps(owned);

  const ritual   = activeRitual ? getRitual(activeRitual) : undefined;
  const tomorrow = activeRitual ? adaptRoutineForRitual(activeRitual, owned) : [];

  // Progressive decoupling: 7+ consecutive days on this ritual
  const ritualMastered = !!(activeRitual && (ritualStreaks[activeRitual] ?? 0) >= 7);

  // Ambient mode steps from the current morning routine
  const ambientSteps: AmbientStep[] = routine.map(s => ({
    label:       STEP_LABEL[s.category],
    productName: s.name,
    duration:    Math.max(s.mins * 20, 15),
  }));

  // Live Activity widget data
  const completedCount = routine.filter((_, i) => i < 2).length;
  const liveProgress   = routine.length > 0 ? completedCount / routine.length : 0;

  const today  = new Date();
  const days   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const dateStr = `${days[today.getDay()]} · ${months[today.getMonth()]} ${today.getDate()}`;
  const firstName = user?.name?.split(' ')[0]?.toLowerCase() ?? 'alex';

  const UV = 6;
  const tempC = 23;
  const tempDisplay = temperatureUnit === 'F' ? `${Math.round(tempC * 9 / 5 + 32)}°F` : `${tempC}°C`;
  const insight = getDailyInsight(lastScores, UV, temperatureUnit);

  return (
    <View style={styles.root}>
      <Background />

      {/* Ambient Mode overlay — full-screen, above everything */}
      {showAmbient && (
        <AmbientModeOverlay
          steps={ambientSteps}
          ritualKey={activeRitual ?? undefined}
          onComplete={() => {
            if (activeRitual) completeDailyRitual(activeRitual);
            setShowAmbient(false);
          }}
          onDismiss={() => setShowAmbient(false)}
        />
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 4, paddingBottom: 100 }]}
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
                fill="none" stroke={C.warn} strokeWidth={1.6}
                strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={[T.num, { fontSize: 13, fontWeight: '600', color: C.warn }]}>{streak}</Text>
          </View>
        </View>

        {/* Live Activity widget — always shown when routine is in progress */}
        {routine.length > 0 && (
          <LiveActivityWidget
            currentStep={STEP_LABEL[routine[Math.min(completedCount, routine.length - 1)]?.category] ?? ''}
            progress={liveProgress}
            streak={streak}
            ritualName={ritual?.name}
          />
        )}

        {/* Date + greeting */}
        <View style={{ marginBottom: 14 }}>
          <Text style={[T.kicker, { marginBottom: 5 }]}>{dateStr} · {tempDisplay} · UV {UV}</Text>
          <Text style={[T.h1, { fontSize: 30 }]}>
            good morning,{' '}
            <Text style={{ fontStyle: 'italic', color: C.accentInk }}>{firstName}</Text>
          </Text>
        </View>

        {/* DAILY BRIEF — science insight */}
        <FlutedGlass padding={14} style={{ marginBottom: 16 }}>
          <Text style={[T.kicker, { color: C.accent, marginBottom: 6 }]}>✦ DAILY BRIEF</Text>
          <Text style={[T.bodySm, { color: C.ink2, lineHeight: 18 }]}>{insight}</Text>
          {lastScores && (
            <View style={{ flexDirection: 'row', gap: 0, marginTop: 12 }}>
              {[
                { label: 'SKIN SCORE', value: String(lastScores.overall) },
                { label: 'HYDRATION',  value: String(lastScores.hydration) },
                { label: 'STREAK',     value: `${streak}d` },
              ].map((s, i) => (
                <View key={s.label} style={[
                  styles.briefStat,
                  i > 0 && { borderLeftWidth: 1, borderLeftColor: C.line },
                ]}>
                  <Text style={[T.num, { fontSize: 20, fontWeight: '700', color: C.ink }]}>{s.value}</Text>
                  <Text style={[T.kicker, { color: C.ink3, fontSize: 8, letterSpacing: 0.3, marginTop: 2 }]}>{s.label}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={[T.bodySm, { color: C.ink4, fontSize: 9, marginTop: 8 }]}>
            * Peer-reviewed research. Not medical advice. Individual results vary.
          </Text>
        </FlutedGlass>

        {/* Active ritual banner */}
        {ritual && (
          <FlutedGlass padding={10} style={{ marginBottom: 14, borderColor: C.accent }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[T.kicker, { color: C.accent, flex: 1 }]}>
                ✦ {ritual.culture.toUpperCase()} · {ritual.name}
                {ritualMastered ? ' · MASTERED' : ` · DAY ${(ritualStreaks[activeRitual!] ?? 0) + 1} OF 7`}
              </Text>
            </View>
          </FlutedGlass>
        )}

        {/* Score strip */}
        <View style={styles.sectionHeader}>
          <Text style={T.kicker}>SCORES</Text>
          <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>last scan · 18h ago</Text>
        </View>
        <View style={{ marginBottom: 16 }}>
          <MetricStrip metrics={METRICS} active={activeMetric} onPick={setActiveMetric} />
        </View>

        {/* Routine */}
        <View style={styles.sectionHeader}>
          <Text style={[T.kicker, { flex: 1 }]}>THIS MORNING · AUTO-GENERATED</Text>
          <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>{routine.length} steps</Text>
        </View>

        {/* Ambient mode + quick-add row */}
        <View style={styles.routineToolbar}>
          <View style={styles.quickAdd}>
            <TextInput
              style={styles.quickInput}
              placeholder="add step…"
              placeholderTextColor={C.ink3}
              value={quickAdd}
              onChangeText={setQuickAdd}
              onSubmitEditing={() => setQuickAdd('')}
            />
            <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
              <Text style={[T.button, { color: C.ink, fontSize: 16, lineHeight: 18 }]}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.ambientBtn}
            onPress={() => setShowAmbient(true)}
            activeOpacity={0.8}
          >
            <Wind size={14} strokeWidth={1.2} color={C.accentInk} />
            <Text style={[T.button, { color: C.accentInk, fontSize: 11 }]}>Ambient</Text>
          </TouchableOpacity>
        </View>

        {/* ── Progressive decoupling: mastered ritual → single conclude button ── */}
        {ritualMastered && ritual ? (
          <TouchableOpacity
            style={styles.concludeBtn}
            onPress={() => completeDailyRitual(activeRitual!)}
            activeOpacity={0.85}
          >
            <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>
              ✦  Conclude Tonight's Mastered Ritual
            </Text>
            <Text style={[T.kicker, { color: 'rgba(255,255,255,0.55)', marginTop: 6, fontSize: 9 }]}>
              {ritual.name} · {ritualStreaks[activeRitual!]} day streak
            </Text>
          </TouchableOpacity>
        ) : (
          <>
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
          </>
        )}

        {/* TOMORROW — reshaped by the active ritual */}
        {ritual && tomorrow.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 18 }]}>
              <Text style={[T.kicker, { flex: 1, color: C.accent }]}>
                TOMORROW · {ritual.culture.toUpperCase()} METHOD
              </Text>
              <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>{tomorrow.length} steps</Text>
            </View>
            <Text style={[T.bodySm, { color: C.ink3, marginBottom: 10, lineHeight: 17 }]}>
              Your <Text style={{ fontStyle: 'italic', color: C.accentInk }}>{ritual.name}</Text> ritual
              reshapes tomorrow's routine — steps follow the tradition, matched to what's on your shelf.
            </Text>
            {tomorrow.map((t, i) => (
              <FlutedGlass key={`${t.step}-${i}`} padding={12} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <Text style={[T.num, { fontSize: 11, color: C.accent, width: 22 }]}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '600', fontSize: 13 }]}>{t.step}</Text>
                    <Text style={[T.bodySm, { color: C.ink3, marginTop: 2 }]}>{t.product}</Text>
                  </View>
                </View>
              </FlutedGlass>
            ))}
          </>
        )}

        {/* Gaps — with Browse links */}
        {gaps.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: 18 }]}>
              <Text style={T.kicker}>GAPS IN YOUR ROUTINE</Text>
              <Text style={[T.num, { fontSize: 10, color: C.warn }]}>{gaps.length} missing</Text>
            </View>
            <Text style={[T.bodySm, { color: C.ink3, marginBottom: 10, lineHeight: 17 }]}>
              Your stack is incomplete. Browse to find options on Sephora.
            </Text>
            {gaps.map(g => (
              <FlutedGlass key={g.key} padding={12} style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.gapDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '600', textTransform: 'capitalize' }]}>{g.label}</Text>
                    <Text style={[T.bodySm, { color: C.ink3, marginTop: 2, lineHeight: 16 }]}>{g.reason}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.browseBtn}
                    activeOpacity={0.7}
                    onPress={() => Linking.openURL(BROWSE_URLS[g.key as ProductCategory] ?? 'https://www.sephora.com')}
                  >
                    <Text style={[T.button, { fontSize: 11 }]}>Browse →</Text>
                  </TouchableOpacity>
                </View>
              </FlutedGlass>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: S.gutter },
  brandRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8, marginBottom: 4,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wordmark: {
    fontFamily: 'CormorantGaramond_400Italic',
    fontSize: 22, letterSpacing: -0.44, color: C.ink,
  },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  briefStat: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  routineToolbar: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'stretch' },
  quickAdd: { flex: 1, flexDirection: 'row', gap: 6 },
  quickInput: {
    flex: 1, backgroundColor: C.surface2, borderRadius: R.md,
    paddingHorizontal: 10, paddingVertical: 7,
    fontFamily: 'Inter_400Regular', fontSize: 12, color: C.ink,
  },
  addBtn: {
    width: 30, height: 30, borderRadius: R.md,
    borderWidth: 1, borderColor: C.line2,
    backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  ambientBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: R.md,
    backgroundColor: C.accentSoft,
    borderWidth: 1, borderColor: C.accent + '55',
  },
  concludeBtn: {
    backgroundColor: C.ink, borderRadius: R.md,
    paddingVertical: 16, alignItems: 'center',
    marginBottom: 14,
  },
  gapDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.warn, flexShrink: 0 },
  browseBtn: {
    borderWidth: 1, borderColor: C.accent + '80',
    borderRadius: R.md, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: C.accentSoft,
  },
});
