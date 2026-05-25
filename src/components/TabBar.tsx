import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle, Defs, Pattern, Rect } from 'react-native-svg';
import { C, T, R } from '../tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabKey = 'today' | 'scan' | 'lookmax' | 'trend' | 'you';

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  mode?: 'normal' | 'lookmax';
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'today',   label: 'TODAY' },
  { key: 'scan',    label: 'SCAN' },
  { key: 'lookmax', label: 'LOOKMAX' },
  { key: 'trend',   label: 'TREND' },
  { key: 'you',     label: 'YOU' },
];

const TabIcon: React.FC<{ name: TabKey; active: boolean }> = ({ name, active }) => {
  const stroke = active ? C.ink : C.ink3;
  const sw = active ? 2 : 1.5;
  const s = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'today':
      return <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M3 12l9-8 9 8M5 10v9a1 1 0 0 0 1 1h3v-6h6v6h3a1 1 0 0 0 1-1v-9" {...s}/></Svg>;
    case 'scan':
      return <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" {...s}/><Circle cx={12} cy={12} r={4} {...s}/></Svg>;
    case 'lookmax':
      return <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z" {...s}/><Path d="M5 18l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" {...s}/></Svg>;
    case 'trend':
      return <Svg width={20} height={20} viewBox="0 0 24 24"><Path d="M3 19V9M9 19V5M15 19v-7M21 19v-3" {...s}/></Svg>;
    case 'you':
      return <Svg width={20} height={20} viewBox="0 0 24 24"><Circle cx={12} cy={8} r={4} {...s}/><Path d="M4 21a8 8 0 0 1 16 0" {...s}/></Svg>;
  }
};

export const TabBar: React.FC<Props> = ({ active, onChange, mode = 'normal' }) => {
  const insets = useSafeAreaInsets();
  const bgTint = mode === 'lookmax' ? 'rgba(250,248,243,0.55)' : 'rgba(255,255,253,0.50)';

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 18 }]}>
      {/* Blur base */}
      <BlurView style={StyleSheet.absoluteFill} intensity={55} tint="light" />
      {/* Tint + flute */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: bgTint }]} pointerEvents="none" />
      {/* Top border */}
      <View style={styles.topBorder} pointerEvents="none" />

      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.7}
          >
            <TabIcon name={tab.key} active={isActive} />
            <Text style={[T.tabLabel, { color: isActive ? C.ink : C.ink3 }]}>
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
    height: 70,
    paddingHorizontal: 8,
    paddingTop: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: C.glassBorder,
    zIndex: 2,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
