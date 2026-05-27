/**
 * Liquid-glass bottom tab bar — redesigned icon set for Poreless:
 *
 * TODAY       — sun with rays (morning ritual)
 * SCAN        — face with horizontal scan lines (AI analysis)
 * PROPORTIONS — Fibonacci / golden spiral (sacred geometry)
 * RITUALS     — candle with teardrop flame (ceremony)
 * YOU         — oval hand mirror (personal beauty)
 *
 * Active tab: warm glow ring + brightened icon + heavier stroke.
 * Slow light-sweep shimmer every ~11s — "modern Greek" lens feel.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, {
  Path, Circle, Line, Ellipse,
  Defs, Pattern, Rect,
} from 'react-native-svg';
import { C, T, R } from '../tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabKey = 'today' | 'scan' | 'proportions' | 'rituals' | 'you';

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  mode?: 'normal' | 'lookmax';
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today',       label: 'TODAY' },
  { key: 'scan',        label: 'SCAN' },
  { key: 'proportions', label: 'PROPORTIONS' },
  { key: 'rituals',     label: 'RITUALS' },
  { key: 'you',         label: 'YOU' },
];

const TabIcon: React.FC<{ name: TabKey; active: boolean }> = ({ name, active }) => {
  const stroke = active ? C.ink : C.ink3;
  const sw = active ? 1.9 : 1.55;
  const s = {
    fill: 'none', stroke, strokeWidth: sw,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };

  switch (name) {
    // ── TODAY: sun (circle + 8 short rays) ──────────────────────────────────
    case 'today':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={4} {...s} />
          <Line x1={12} y1={2.5} x2={12} y2={5}   {...s} />
          <Line x1={12} y1={19} x2={12} y2={21.5} {...s} />
          <Line x1={2.5} y1={12} x2={5}   y2={12} {...s} />
          <Line x1={19}  y1={12} x2={21.5} y2={12} {...s} />
          <Line x1={5.6} y1={5.6}  x2={7.4} y2={7.4}   {...s} />
          <Line x1={16.6} y1={16.6} x2={18.4} y2={18.4} {...s} />
          <Line x1={18.4} y1={5.6}  x2={16.6} y2={7.4}  {...s} />
          <Line x1={7.4}  y1={16.6} x2={5.6}  y2={18.4} {...s} />
        </Svg>
      );

    // ── SCAN: face outline with 3 horizontal scan lines crossing it ─────────
    case 'scan':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          {/* face oval */}
          <Path d="M 12 4 C 7 4 5 7.5 5 12 C 5 17 7.5 21 12 21 C 16.5 21 19 17 19 12 C 19 7.5 17 4 12 4 Z" {...s} />
          {/* scan lines clipped to face width */}
          <Line x1={6.2} y1={10} x2={17.8} y2={10} {...s} strokeOpacity={0.55} strokeDasharray="1.5 1" />
          <Line x1={5.2} y1={13} x2={18.8} y2={13} {...s} strokeOpacity={0.85} />
          <Line x1={6.5} y1={16} x2={17.5} y2={16} {...s} strokeOpacity={0.55} strokeDasharray="1.5 1" />
        </Svg>
      );

    // ── PROPORTIONS: Fibonacci / golden spiral (logarithmic) ────────────────
    //    Points computed from r = φ^(2θ/π), scale=1.8, center=(8,9)
    case 'proportions':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path
            d="M 9.8 9.0 L 9.9 8.2 L 9.6 7.4 L 9.0 6.6 L 8.0 6.1
               L 6.7 6.0 L 5.4 6.4 L 4.1 7.4 L 3.3 9.0 L 3.1 11.0
               L 3.8 13.2 L 5.4 15.3 L 8.0 16.6 L 11.3 17.0
               L 14.9 15.9 L 18.1 13.2 L 20.3 9.0"
            fill="none"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    // ── RITUALS: candle with teardrop flame ──────────────────────────────────
    case 'rituals':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          {/* candle body */}
          <Path d="M 10 21 L 14 21 L 13.2 12 L 10.8 12 Z" {...s} />
          {/* wick */}
          <Line x1={12} y1={12} x2={12} y2={10} {...s} />
          {/* teardrop flame */}
          <Path d="M 12 10 C 12 8.5 14.5 7 13 4.5 C 11.5 6 9.5 7 9.5 9 C 9.5 10.5 10.6 11.5 12 11.5 C 13.4 11.5 14.5 10.5 14.5 9" {...s} />
          {/* base plate */}
          <Line x1={8} y1={21} x2={16} y2={21} {...s} />
        </Svg>
      );

    // ── YOU: oval hand mirror ────────────────────────────────────────────────
    case 'you':
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          {/* mirror oval */}
          <Ellipse cx={12} cy={9} rx={5.5} ry={6.5} {...s} />
          {/* handle */}
          <Path d="M 10.5 15.2 L 9.5 20" {...s} />
          <Path d="M 13.5 15.2 L 14.5 20" {...s} />
          <Path d="M 9.5 20 L 14.5 20" {...s} />
        </Svg>
      );
  }
};

export const TabBar: React.FC<Props> = ({ active, onChange, mode = 'normal' }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const shimmerX = useRef(new Animated.Value(-80)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, { toValue: width + 80, duration: 5000, useNativeDriver: true }),
        Animated.delay(6000),
        Animated.timing(shimmerX, { toValue: -80, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, [width]);

  const bgTint = mode === 'lookmax' ? 'rgba(250,248,243,0.45)' : 'rgba(255,255,253,0.42)';

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BlurView style={StyleSheet.absoluteFill} intensity={85} tint="light" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgTint }]} pointerEvents="none" />

      {/* Dense flute SVG overlay */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={70} style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="tabFlute" x="0" y="0" width="4" height="2" patternUnits="userSpaceOnUse">
              <Rect x="0.8" y="0" width="0.4" height="2" fill="rgba(255,255,255,0.55)" />
              <Rect x="2.2" y="0" width="0.6" height="2" fill="rgba(160,100,50,0.07)" />
            </Pattern>
          </Defs>
          <Rect width={width} height={70} fill="url(#tabFlute)" opacity={0.9} />
        </Svg>
      </View>

      {/* Light-sweep shimmer */}
      <Animated.View
        style={[styles.shimmer, { transform: [{ translateX: shimmerX }, { skewX: '-18deg' }] }]}
        pointerEvents="none"
      />

      {/* Top hairline */}
      <View style={styles.topBorder} pointerEvents="none" />

      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onChange(tab.key)} activeOpacity={0.75}>
            {isActive && <View style={styles.glowRing} />}
            <View style={styles.iconWrap}>
              <TabIcon name={tab.key} active={isActive} />
              <View style={styles.lensOverlay} pointerEvents="none" />
            </View>
            <Text style={[
              T.tabLabel, {
                fontSize: 9,
                color: isActive ? C.ink : C.ink3,
                marginTop: 2,
                letterSpacing: tab.label.length > 6 ? 0.1 : 0.4,
              },
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 10,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 70,
  },
  topBorder: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.80)',
    zIndex: 2,
  },
  shimmer: {
    position: 'absolute', top: 0, bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 1,
  },
  tab: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 1, zIndex: 3,
  },
  iconWrap: {
    position: 'relative', width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  lensOverlay: {
    position: 'absolute', width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 3, left: 3,
  },
  glowRing: {
    position: 'absolute', top: 4, width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(194,119,45,0.10)',
    borderWidth: 1, borderColor: 'rgba(194,119,45,0.20)',
  },
});
