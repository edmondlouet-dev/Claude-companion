import React, { useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Animated, Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FaceLogo } from '../components/FaceLogo';
import { FlutedGlass } from '../components/FlutedGlass';
import { useStore } from '../store';
import { C, R, T, S } from '../tokens';

const { width: W } = Dimensions.get('window');
const MAX_BAR_H = 80;

const DAYS_DATA = [
  { day: 'S', score: 71, isToday: false },
  { day: 'M', score: 74, isToday: false },
  { day: 'T', score: 72, isToday: false },
  { day: 'W', score: 75, isToday: false },
  { day: 'T', score: 76, isToday: false },
  { day: 'F', score: 77, isToday: false },
  { day: 'S', score: 78, isToday: true  },
];

const MiniAnimBar: React.FC<{ score: number; isToday: boolean; day: string; delay: number }> = ({
  score, isToday, day, delay,
}) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: false }).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);
  const h = anim.interpolate({ inputRange: [0,1], outputRange: [0, (score/100)*MAX_BAR_H] });
  return (
    <View style={styles.barCol}>
      <View style={[styles.barTrack, { height: MAX_BAR_H }]}>
        <Animated.View style={[styles.bar, { backgroundColor: isToday ? C.accent : C.ink, height: h }]} />
      </View>
      <Text style={[T.kicker, { color: C.ink3, marginTop: 3, letterSpacing: 0, fontSize: 9 }]}>{day}</Text>
    </View>
  );
};

const ChevronRight = () => (
  <Svg width={14} height={14} viewBox="0 0 24 24">
    <Path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const MENU_ITEMS = [
  { label: 'My products',    icon: '◈', screen: 'products' },
  { label: 'Skin profile',   icon: '◉', screen: null },
  { label: 'Notifications',  icon: '◌', screen: null },
  { label: 'Privacy',        icon: '◐', screen: null },
  { label: 'About Poreless', icon: '◯', screen: null },
];

interface Props {
  onProducts?: () => void;
}

export const You: React.FC<Props> = ({ onProducts }) => {
  const insets = useSafeAreaInsets();
  const { user, streak, lastScores, logout } = useStore();

  const displayName = user?.name ?? 'Alex Chen';
  const isPremium   = user?.premium ?? false;

  return (
    <View style={styles.root}>
      <Background />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar — face logo, not scan portrait */}
        <View style={styles.profileTop}>
          <View style={styles.avatarWrap}>
            <FaceLogo size={52} color={C.ink2} strokeWidth={1.2} />
          </View>
          {isPremium && (
            <View style={styles.premiumBadge}>
              <Text style={[T.pill, { color: C.accent }]}>✦ LIFETIME PREMIUM</Text>
            </View>
          )}
          <Text style={[T.h2, { marginTop: 10 }]}>{displayName}</Text>
          <Text style={[T.kicker, { color: C.ink3, marginTop: 5, textAlign: 'center' }]}>
            MEMBER · {streak + 73} DAYS
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { value: String(streak), label: 'Day streak' },
            { value: '87',           label: 'Routines done' },
            { value: '23',           label: 'Scans taken' },
          ].map(stat => (
            <FlutedGlass key={stat.label} padding={12} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[T.num, { fontSize: 22, fontWeight: '600', textAlign: 'center' }]}>
                {stat.value}
              </Text>
              <Text style={[T.kicker, { color: C.ink3, textAlign: 'center', marginTop: 3, letterSpacing: 0.4 }]}>
                {stat.label}
              </Text>
            </FlutedGlass>
          ))}
        </View>

        {/* Trend section (moved here from TREND tab) */}
        <Text style={[T.kicker, { marginBottom: 8 }]}>TREND · 7 DAYS</Text>
        <FlutedGlass padding={14} style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
            <Text style={[T.num, { fontSize: 36, fontWeight: '700' }]}>
              {lastScores?.overall ?? 78}
            </Text>
            <View style={{ backgroundColor: C.sageSoft, borderRadius: R.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={[T.pill, { color: C.sage }]}>+3 this week</Text>
            </View>
          </View>
          <View style={styles.chartRow}>
            {DAYS_DATA.map((d, i) => (
              <MiniAnimBar key={i} score={d.score} isToday={d.isToday} day={d.day} delay={i * 60} />
            ))}
          </View>
        </FlutedGlass>

        {/* Metric scores */}
        <Text style={[T.kicker, { marginBottom: 8 }]}>LATEST SCORES</Text>
        <View style={{ gap: 6, marginBottom: 18 }}>
          {[
            { l: 'Hydration', v: lastScores?.hydration ?? 82 },
            { l: 'Texture',   v: lastScores?.texture   ?? 74 },
            { l: 'Pores',     v: lastScores?.pores      ?? 69 },
            { l: 'Oil',       v: lastScores?.oil        ?? 55 },
            { l: 'Calm',      v: lastScores?.redness    ?? 88 },
          ].map(m => (
            <FlutedGlass key={m.l} padding={10}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[T.kicker, { flex: 1 }]}>{m.l}</Text>
                <View style={styles.miniBarRow}>
                  {[0.6, 0.65, 0.68, 0.7, 0.72, 0.74, m.v/100].map((p, i) => (
                    <View key={i} style={[styles.microBar, {
                      height: Math.round(14 * p),
                      backgroundColor: i === 6 ? C.accent : C.surface3,
                    }]} />
                  ))}
                </View>
                <Text style={[T.num, { fontSize: 18, fontWeight: '600', marginLeft: 12, width: 34, textAlign: 'right' }]}>
                  {m.v}
                </Text>
              </View>
            </FlutedGlass>
          ))}
        </View>

        {/* Menu list */}
        <Text style={[T.kicker, { marginBottom: 8 }]}>ACCOUNT</Text>
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i < MENU_ITEMS.length-1 && styles.menuRowBorder]}
              onPress={() => { if (item.screen === 'products') onProducts?.(); }}
              activeOpacity={0.6}
            >
              <Text style={[T.body, { color: C.ink3, marginRight: 10 }]}>{item.icon}</Text>
              <Text style={[T.body, { flex: 1, fontWeight: '500', color: C.ink }]}>{item.label}</Text>
              <ChevronRight />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOut} onPress={logout} activeOpacity={0.7}>
          <Text style={[T.button, { color: C.ink3 }]}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: S.gutter },
  profileTop: { alignItems: 'center', marginBottom: 20 },
  avatarWrap: {
    width: 88, height: 88,
    borderRadius: 44,
    backgroundColor: C.surface2,
    borderWidth: 1.5,
    borderColor: C.glassBorder,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  premiumBadge: {
    marginTop: 8,
    backgroundColor: C.accentSoft,
    borderRadius: R.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: C.accent + '44',
  },
  statsGrid: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  barCol: { alignItems: 'center', flex: 1 },
  barTrack: { width: 6, backgroundColor: C.surface3, borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' },
  bar: { width: 6, borderRadius: 3 },
  miniBarRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 18 },
  microBar: { width: 4, borderRadius: 2 },
  menuList: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1, borderColor: C.line,
    marginBottom: 16, overflow: 'hidden',
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  signOut: { alignItems: 'center', paddingVertical: 16 },
});
