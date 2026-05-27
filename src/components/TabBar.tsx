/**
 * Liquid-glass bottom tab bar.
 *
 * Visual layers (bottom → top):
 *  1. BlurView (intensity 80) — heavy frosted base
 *  2. Semi-transparent warm tint
 *  3. Dense flute SVG overlay (4px period, not 6px)
 *  4. Slow light-sweep shimmer (every ~10s) — "modern Greek" lens feel
 *  5. Top hairline border
 *  6. Tab icons + labels
 *
 * Active icon: warm glow ring underneath + icon brightens.
 * All icons have a subtle convex-lens radial highlight overlay.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Defs, Pattern, Rect, RadialGradient, Stop } from 'react-native-svg';
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

// Cohesive premium line-art set — uniform 1.6/1.9 stroke, rounded joins,
// consistent 24px optical grid to match the app's delicate line aesthetic.
const TabIcon: React.FC<{ name: TabKey; active: boolean }> = ({ name, active }) => {
  const stroke = active ? C.ink : C.ink3;
  const sw = active ? 1.9 : 1.6;
  const s = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'today':
      // Sun / day — radiant ritual marker
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Circle cx={12} cy={12} r={4.5} {...s} />
          <Path d="M12 2.5v2.2M12 19.3v2.2M21.5 12h-2.2M4.7 12H2.5M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2L5.6 5.6" {...s} />
        </Svg>
      );
    case 'scan':
      // Focus reticle framing a soft face arc
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M3 8V6a2.5 2.5 0 0 1 2.5-2.5H7M17 3.5h1.5A2.5 2.5 0 0 1 21 6v2M21 16v2a2.5 2.5 0 0 1-2.5 2.5H17M7 20.5H5.5A2.5 2.5 0 0 1 3 18v-2" {...s} />
          <Path d="M9 14.5a3.2 3.2 0 0 0 6 0" {...s} />
          <Circle cx={9.3} cy={10} r={0.5} fill={stroke} stroke="none" />
          <Circle cx={14.7} cy={10} r={0.5} fill={stroke} stroke="none" />
        </Svg>
      );
    case 'proportions':
      // Twin sparkle / facets — refined structure
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z" {...s} />
          <Path d="M18.5 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" {...s} />
        </Svg>
      );
    case 'rituals':
      // Candle flame — ceremony
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Path d="M12 3c0 4-4 5-4 8.5A4 4 0 0 0 16 11.5c0-2-1-3-2-4 0 2-1 3-2 3 0-3 0-4.5 0-7.5z" {...s} />
          <Path d="M8.5 20.5h7M12 17v3.5" {...s} />
        </Svg>
      );
    case 'you':
      // Profile
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24">
          <Circle cx={12} cy={8.5} r={3.8} {...s} />
          <Path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" {...s} />
        </Svg>
      );
  }
};

export const TabBar: React.FC<Props> = ({ active, onChange, mode = 'normal' }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // ── Light-sweep shimmer ────────────────────────────────────────────────────
  const shimmerX = useRef(new Animated.Value(-80)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerX, {
          toValue: width + 80,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.delay(6000),
        Animated.timing(shimmerX, {
          toValue: -80,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [width]);

  const bgTint = mode === 'lookmax'
    ? 'rgba(250,248,243,0.45)'
    : 'rgba(255,255,253,0.42)';

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {/* 1. Heavy blur base */}
      <BlurView style={StyleSheet.absoluteFill} intensity={85} tint="light" />

      {/* 2. Warm tint */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgTint }]} pointerEvents="none" />

      {/* 3. Dense flute SVG overlay (4px period) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={70} style={StyleSheet.absoluteFill}>
          <Defs>
            <Pattern id="tabFlute" x="0" y="0" width="4" height="2" patternUnits="userSpaceOnUse">
              <Rect x="0.8" y="0" width="0.4" height="2" fill="rgba(255,255,255,0.55)" />
              <Rect x="2.2" y="0" width="0.6" height="2" fill="rgba(160,140,110,0.07)" />
            </Pattern>
          </Defs>
          <Rect width={width} height={70} fill="url(#tabFlute)" opacity={0.9} />
        </Svg>
      </View>

      {/* 4. Light-sweep shimmer */}
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX: shimmerX }, { skewX: '-18deg' }] },
        ]}
        pointerEvents="none"
      />

      {/* 5. Top hairline */}
      <View style={styles.topBorder} pointerEvents="none" />

      {/* 6. Tabs */}
      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
          >
            {/* Convex-lens glow behind active icon */}
            {isActive && (
              <View style={styles.glowRing} />
            )}

            {/* Icon with subtle lens highlight overlay */}
            <View style={styles.iconWrap}>
              <TabIcon name={tab.key} active={isActive} />
              {/* Radial lens highlight */}
              <View style={styles.lensOverlay} pointerEvents="none" />
            </View>

            <Text style={[
              T.tabLabel,
              {
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
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.80)',
    zIndex: 2,
  },
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.12)',
    zIndex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    zIndex: 3,
  },
  iconWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lensOverlay: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: 3, left: 3,
  },
  glowRing: {
    position: 'absolute',
    top: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(194,119,45,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(194,119,45,0.20)',
  },
});
