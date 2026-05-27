/**
 * RITUALS tab — cultural skincare traditions from around the world.
 * AI suggests which ritual best suits the user's current skin scores.
 * "Try this" button adapts the Today routine for 7 days.
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Line, Ellipse } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FlutedGlass } from '../components/FlutedGlass';
import { Pill } from '../components/Pill';
import { useStore } from '../store';
import { C, R, T, S } from '../tokens';

const { width: W } = Dimensions.get('window');

const RitualIcon: React.FC<{ id: string; size?: number; color?: string }> = ({ id, size = 30, color = C.ink3 }) => {
  const s = { fill: 'none', stroke: color, strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (id) {
    case 'japanese': // Three water waves
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Path d="M4 9 Q8 6 12 9 Q16 12 20 9 Q24 6 28 9" {...s} />
          <Path d="M4 16 Q8 13 12 16 Q16 19 20 16 Q24 13 28 16" {...s} />
          <Path d="M4 23 Q8 20 12 23 Q16 26 20 23 Q24 20 28 23" {...s} />
        </Svg>
      );
    case 'korean': // Snowflake asterisk
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Line x1={16} y1={4} x2={16} y2={28} {...s} />
          <Line x1={4} y1={16} x2={28} y2={16} {...s} />
          <Line x1={7.5} y1={7.5} x2={24.5} y2={24.5} {...s} />
          <Line x1={24.5} y1={7.5} x2={7.5} y2={24.5} {...s} />
          <Circle cx={16} cy={4} r={1.8} fill={color} />
          <Circle cx={16} cy={28} r={1.8} fill={color} />
          <Circle cx={4} cy={16} r={1.8} fill={color} />
          <Circle cx={28} cy={16} r={1.8} fill={color} />
        </Svg>
      );
    case 'french': // Caduceus — simplified staff + wings + snake cross
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {/* staff */}
          <Line x1={16} y1={6} x2={16} y2={28} {...s} />
          {/* left wing */}
          <Path d="M16 9 C12 6 6 7 7 11 C9 13 13 11 16 9" {...s} />
          {/* right wing */}
          <Path d="M16 9 C20 6 26 7 25 11 C23 13 19 11 16 9" {...s} />
          {/* snake left */}
          <Path d="M14 13 C10 15 10 19 14 21 C18 23 18 26 14 28" {...s} />
          {/* snake right */}
          <Path d="M18 13 C22 15 22 19 18 21 C14 23 14 26 18 28" {...s} />
        </Svg>
      );
    case 'ayurvedic': // Lotus flower
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {/* center petal */}
          <Path d="M16 26 C14 20 14 14 16 8 C18 14 18 20 16 26" {...s} />
          {/* left petals */}
          <Path d="M16 24 C12 20 6 20 5 14 C9 12 14 18 16 24" {...s} />
          <Path d="M16 24 C10 22 6 18 6 12 C10 11 15 17 16 24" {...s} />
          {/* right petals */}
          <Path d="M16 24 C20 20 26 20 27 14 C23 12 18 18 16 24" {...s} />
          <Path d="M16 24 C22 22 26 18 26 12 C22 11 17 17 16 24" {...s} />
          {/* base */}
          <Path d="M10 27 Q16 29 22 27" {...s} />
        </Svg>
      );
    case 'african': // Tropical leaf with veins
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {/* leaf outline */}
          <Path d="M16 28 C7 22 5 12 14 5 C22 8 27 20 16 28" {...s} />
          {/* center vein */}
          <Line x1={16} y1={28} x2={15} y2={7} {...s} />
          {/* side veins */}
          <Line x1={15} y1={22} x2={9} y2={17} {...s} />
          <Line x1={15} y1={17} x2={9} y2={13} {...s} />
          <Line x1={15} y1={22} x2={21} y2={18} {...s} />
          <Line x1={15} y1={17} x2={21} y2={14} {...s} />
        </Svg>
      );
    case 'scandinavian': // Balance scales
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          {/* beam */}
          <Line x1={5} y1={10} x2={27} y2={10} {...s} />
          {/* post */}
          <Line x1={16} y1={10} x2={16} y2={26} {...s} />
          {/* base */}
          <Line x1={10} y1={26} x2={22} y2={26} {...s} />
          {/* left pan hanging cords */}
          <Line x1={7} y1={10} x2={6} y2={17} {...s} />
          <Line x1={12} y1={10} x2={13} y2={17} {...s} />
          {/* left pan arc */}
          <Path d="M6 17 Q9.5 21 13 17" {...s} />
          {/* right pan hanging cords */}
          <Line x1={20} y1={10} x2={19} y2={17} {...s} />
          <Line x1={25} y1={10} x2={26} y2={17} {...s} />
          {/* right pan arc */}
          <Path d="M19 17 Q22.5 21 26 17" {...s} />
        </Svg>
      );
    case 'greek': // Clock face
      return (
        <Svg width={size} height={size} viewBox="0 0 32 32">
          <Circle cx={16} cy={16} r={12} {...s} />
          {/* tick marks */}
          <Line x1={16} y1={5} x2={16} y2={8} {...s} />
          <Line x1={27} y1={16} x2={24} y2={16} {...s} />
          <Line x1={16} y1={27} x2={16} y2={24} {...s} />
          <Line x1={5} y1={16} x2={8} y2={16} {...s} />
          {/* hour hand */}
          <Line x1={16} y1={16} x2={16} y2={10} {...s} strokeWidth={1.8} />
          {/* minute hand */}
          <Line x1={16} y1={16} x2={22} y2={16} {...s} strokeWidth={1.4} />
          {/* centre dot */}
          <Circle cx={16} cy={16} r={1.5} fill={color} />
        </Svg>
      );
    default:
      return null;
  }
};

interface Ritual {
  key: string;
  culture: string;
  name: string;
  tagline: string;
  description: string;
  steps: string[];
  benefits: string[];
  bestFor: string[];        // skin concerns this ritual excels at
  duration: string;
  philosophy: string;
}

const RITUALS: Ritual[] = [
  {
    key: 'japanese',
    culture: 'Japanese',
    name: 'Mizu no Te',
    tagline: 'Water as ritual',
    description:
      'Japanese skincare is rooted in *mottainai* — nothing wasted. The focus is on gentle cleansing, deep hydration through layered toners (lotion), and a respect for the skin\'s natural state. Less is treated as more.',
    steps: ['Oil cleanse', 'Foam cleanse', 'Lotion (hydrating toner)', 'Essence', 'SPF (AM) / serum (PM)'],
    benefits: ['Exceptional hydration', 'Prevents over-stripping', 'Refined texture over time'],
    bestFor: ['dryness', 'texture', 'redness'],
    duration: '10 min',
    philosophy: 'Respect the barrier. Hydrate in layers.',
  },
  {
    key: 'korean',
    culture: 'Korean',
    name: 'Yuri Pibu',
    tagline: 'Glass skin method',
    description:
      'K-beauty popularised the concept of glass skin — a luminous, poreless finish achieved through a multi-step layering protocol. Ingredients like snail mucin, centella, and niacinamide are central.',
    steps: ['Double cleanse', 'Exfoliant (2–3×/week)', 'Toner', 'Essence', 'Sheet mask (2×/week)', 'Serum', 'Eye cream', 'Moisturiser', 'SPF'],
    benefits: ['Maximum glow', 'Deep pore care', 'Intensive ingredient layering'],
    bestFor: ['acne', 'pores', 'tone'],
    duration: '20 min',
    philosophy: 'More steps, more glow. Patience over shortcuts.',
  },
  {
    key: 'french',
    culture: 'French',
    name: 'La Pharmacie',
    tagline: 'Pharmacy over counter',
    description:
      'French dermatological tradition trusts science over trends. Micellar water, minimal actives, and pharmacy-grade formulas. Fewer products, clinically tested. The idea: a well-maintained skin doesn\'t need to hide.',
    steps: ['Micellar water (no rubbing)', 'Light moisturiser', 'SPF', 'Targeted serum PM only'],
    benefits: ['Reduced sensitivity', 'Clean barrier', 'No fragrance overload'],
    bestFor: ['redness', 'dryness', 'aging'],
    duration: '5 min',
    philosophy: 'Trust the pharmacy. Less product, more science.',
  },
  {
    key: 'ayurvedic',
    culture: 'Ayurvedic',
    name: 'Dinacharya',
    tagline: 'Daily sacred practice',
    description:
      'Rooted in 5,000 years of Vedic medicine, Ayurvedic skincare addresses the skin as a mirror of internal health. Abhyanga (self-massage with warm oils), turmeric, neem, and rose water are pillars of the practice.',
    steps: ['Cleanse with gram flour / neem paste', 'Rose water toner', 'Kumkumadi face oil (drops)', 'Turmeric-honey mask (2×/week)', 'Facial abhyanga massage'],
    benefits: ['Deep nourishment', 'Anti-inflammatory', 'Improves circulation', 'Mind-skin connection'],
    bestFor: ['darkspots', 'dryness', 'acne'],
    duration: '15 min',
    philosophy: 'The skin is the body\'s outermost mind.',
  },
  {
    key: 'african',
    culture: 'West African',
    name: 'Ubuntu Skin',
    tagline: 'What the earth gives',
    description:
      'West African skincare traditions lean on raw, whole ingredients — black soap from plantain ash and cocoa pod, shea butter from the karite tree, and moringa oil. These are among the richest natural actives known.',
    steps: ['African black soap cleanse', 'Rosehip oil serum', 'Shea butter moisturise', 'Moringa SPF blend (AM)'],
    benefits: ['Intense barrier repair', 'Hyperpigmentation fading', 'Rich in vitamins A, E, F'],
    bestFor: ['darkspots', 'dryness', 'texture'],
    duration: '8 min',
    philosophy: 'Nature\'s chemistry, unprocessed.',
  },
  {
    key: 'scandinavian',
    culture: 'Scandinavian',
    name: 'Lagom',
    tagline: 'Not too much, not too little',
    description:
      'Scandinavian skincare embraces *lagom* — just the right amount. Cold water rinses, stripped-back routines, and a belief that skin heals best when left to its own devices. Inspired by Nordic climate survival.',
    steps: ['Cold water rinse', 'Gentle fragrance-free cleanser', 'Nordic cloudberry moisturiser', 'Mineral SPF'],
    benefits: ['Barrier strength', 'No fragrance irritation', 'Resilient to climate extremes'],
    bestFor: ['redness', 'acne', 'sensitive'],
    duration: '4 min',
    philosophy: 'Resilience over intervention.',
  },
  {
    key: 'greek',
    culture: 'Ancient Greek',
    name: 'Kairos',
    tagline: 'The right moment',
    description:
      'Ancient Greeks used olive oil, honey, and salt scrubs. Kairos means seizing the perfect moment — in skincare, this translates to seasonal adaptation and reading the skin\'s daily needs rather than following a fixed script.',
    steps: ['Honey & olive oil cleanse', 'Rosewater mist', 'Olive squalane serum', 'Beeswax balm (PM)'],
    benefits: ['Antioxidant-rich', 'Antibacterial honey', 'Deep olive polyphenols'],
    bestFor: ['aging', 'dryness', 'glow'],
    duration: '10 min',
    philosophy: 'Kairos — know when to act, when to rest.',
  },
];

function aiSuggestRitual(scores: { acne: number; hydration: number; redness: number; pores: number; tone: number } | null): string {
  if (!scores) return 'japanese';
  const { acne, hydration, redness, pores, tone } = scores;
  if (acne < 65 && pores < 65)  return 'korean';    // struggling with acne/pores
  if (hydration < 65)           return 'japanese';   // dry/dehydrated
  if (redness < 65)             return 'scandinavian'; // sensitive/red
  if (tone < 65)                return 'ayurvedic';  // uneven tone
  return 'french';                                    // balanced — minimal
}

export const Rituals: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { lastScores, activeRitual, setActiveRitual } = useStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const aiPick = aiSuggestRitual(lastScores);

  const tryRitual = (key: string) => {
    setActiveRitual(activeRitual === key ? null : key);
  };

  return (
    <View style={styles.root}>
      <Background />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <Text style={T.kicker}>GLOBAL RITUALS</Text>
          <Text style={[T.h1, { fontSize: 34, marginTop: 4 }]}>
            skin <Text style={{ fontStyle: 'italic', color: C.accentInk }}>traditions</Text>
          </Text>
          <Text style={[T.bodySm, { color: C.ink3, marginTop: 4, lineHeight: 18 }]}>
            Skincare wisdom from seven cultures. Try one for 7 days — your Today routine adapts automatically.
          </Text>
        </View>

        {/* AI recommendation */}
        <FlutedGlass padding={14} style={{ marginBottom: 20, borderColor: C.accent }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Text style={{ fontSize: 22 }}>✦</Text>
            <View style={{ flex: 1 }}>
              <Text style={[T.kicker, { color: C.accent, marginBottom: 4 }]}>AI RECOMMENDS FOR YOU</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <RitualIcon id={aiPick} size={20} color={C.accent} />
                <Text style={[T.body, { fontWeight: '600', color: C.ink }]}>
                  {RITUALS.find(r => r.key === aiPick)?.culture} — {RITUALS.find(r => r.key === aiPick)?.name}
                </Text>
              </View>
              <Text style={[T.bodySm, { color: C.ink3, marginTop: 3 }]}>
                Based on your latest scan scores.{' '}
                {lastScores
                  ? `Hydration ${lastScores.hydration}, Redness ${lastScores.redness}.`
                  : 'Run a scan for personalised picks.'}
              </Text>
            </View>
          </View>
        </FlutedGlass>

        {/* Ritual cards */}
        {RITUALS.map(r => {
          const isExpanded = expanded === r.key;
          const isActive   = activeRitual === r.key;
          const isAi       = r.key === aiPick;

          return (
            <FlutedGlass
              key={r.key}
              padding={14}
              style={[
                styles.card,
                isActive  && styles.cardActive,
                isAi && !isActive && styles.cardAi,
              ]}
            >
              {/* Card header */}
              <TouchableOpacity
                onPress={() => setExpanded(isExpanded ? null : r.key)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHead}>
                  <View style={styles.iconWrap}>
                    <RitualIcon id={r.key} size={26} color={isActive ? C.accent : C.ink3} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[T.kicker, { color: isActive ? C.accent : C.ink3 }]}>{r.culture.toUpperCase()}</Text>
                      {isAi    && <Pill label="AI PICK" variant="accent" />}
                      {isActive && <Pill label="ACTIVE" variant="on" />}
                    </View>
                    <Text style={[T.body, { fontWeight: '600', fontSize: 15, color: C.ink, marginTop: 2 }]}>{r.name}</Text>
                    <Text style={[T.bodySm, { color: C.ink3 }]}>{r.tagline}</Text>
                  </View>
                  <Text style={[T.body, { color: C.ink3 }]}>{isExpanded ? '↑' : '↓'}</Text>
                </View>
              </TouchableOpacity>

              {/* Expanded content */}
              {isExpanded && (
                <View style={styles.cardBody}>
                  <View style={styles.divider} />

                  <Text style={[T.bodySm, { color: C.ink2, lineHeight: 18, marginBottom: 14 }]}>
                    {r.description}
                  </Text>

                  <Text style={[T.kicker, { marginBottom: 8 }]}>THE ROUTINE · {r.duration}</Text>
                  {r.steps.map((step, i) => (
                    <View key={i} style={styles.stepRow}>
                      <Text style={[T.num, { fontSize: 10, color: C.ink3, width: 24 }]}>
                        {String(i + 1).padStart(2, '0')}
                      </Text>
                      <Text style={[T.bodySm, { flex: 1, color: C.ink2 }]}>{step}</Text>
                    </View>
                  ))}

                  <Text style={[T.kicker, { marginTop: 14, marginBottom: 6 }]}>BENEFITS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                    {r.benefits.map(b => <Pill key={b} label={b} variant="sage" />)}
                  </View>

                  <View style={styles.philosophyBox}>
                    <Text style={[T.kicker, { color: C.accent, marginBottom: 4 }]}>PHILOSOPHY</Text>
                    <Text style={[T.bodySm, { color: C.ink2, fontStyle: 'italic', lineHeight: 17 }]}>
                      "{r.philosophy}"
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.tryBtn, isActive && styles.tryBtnActive]}
                    onPress={() => tryRitual(r.key)}
                    activeOpacity={0.85}
                  >
                    <Text style={[T.button, { color: isActive ? C.ink : C.bg, fontSize: 13 }]}>
                      {isActive ? '✓  Currently active — tap to remove' : `Try ${r.name} for 7 days →`}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </FlutedGlass>
          );
        })}

        {/* Footer note */}
        <View style={styles.footerNote}>
          <Text style={[T.kicker, { color: C.ink4, textAlign: 'center', lineHeight: 16 }]}>
            ✦ ACTIVE RITUAL · adjusts your Today routine for 7 days{'\n'}
            AI analysis based on your latest scan scores
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: S.gutter },
  card: { marginBottom: 10, borderColor: C.line },
  cardActive: { borderColor: C.accent, backgroundColor: C.accentSoft },
  cardAi: { borderColor: C.accent + '66' },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  iconWrap: { width: 38, alignItems: 'center', paddingTop: 3 },
  cardBody: { marginTop: 12 },
  divider: { height: 1, backgroundColor: C.line, marginBottom: 12 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  philosophyBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: C.accentSoft,
    borderRadius: R.md,
    marginBottom: 14,
  },
  tryBtn: {
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tryBtnActive: {
    backgroundColor: C.surface2,
    borderWidth: 1,
    borderColor: C.line2,
  },
  footerNote: {
    marginTop: 16,
    padding: 12,
    backgroundColor: C.surface2,
    borderRadius: R.md,
  },
});
