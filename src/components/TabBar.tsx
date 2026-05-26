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

const TabIcon: React.FC<{ name: TabKey; active: boolean }> = ({ name, active }) => {
  const stroke = active ? C.ink : C.ink3;
  const sw = active ? 2 : 1.5;
  const s = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'today':
      return <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M3 12l9-8 9 8M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9" {...s}/></Svg>;
    case 'scan':
      return <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" {...s}/><Circle cx={12} cy={12} r={4} {...s}/></Svg>;
    case 'proportions':
      return <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z" {...s}/><Path d="M5 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" {...s}/></Svg>;
    case 'rituals':
      return <Svg width={22} height={22} viewBox="0 0 24 24"><Path d="M12 3c0 4-4 5-4 9a4 4 0 0 0 8 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 0-5 0-8z" {...s}/><Path d="M8 21h8M12 17v4" {...s}/></Svg>;
    case 'you':
      return <Svg width={22} height={22} viewBox="0 0 24 24"><Circle cx={12} cy={8} r={4} {...s}/><Path d="M4 21a8 8 0 0 1 16 0" {...s}/></Svg>;
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
