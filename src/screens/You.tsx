import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FlutedGlass } from '../components/FlutedGlass';
import { useStore } from '../store';
import { C, R, T, S } from '../tokens';

const ChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path d="M9 6l6 6-6 6" stroke={C.ink3} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MENU_ITEMS = [
  { label: 'My products',      icon: '◈' },
  { label: 'Skin profile',     icon: '◉' },
  { label: 'Notifications',    icon: '◌' },
  { label: 'Privacy',          icon: '◐' },
  { label: 'About Poreless',   icon: '◯' },
];

interface Props {
  onProducts?: () => void;
}

export const You: React.FC<Props> = ({ onProducts }) => {
  const insets = useSafeAreaInsets();
  const { owned, streak, logout } = useStore();

  return (
    <View style={styles.root}>
      <Background />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.profileTop}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/scan-portrait.png')}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
          <Text style={[T.h2, { marginTop: 14 }]}>Alex Chen</Text>
          <Text style={[T.kicker, { color: C.ink3, marginTop: 6, textAlign: 'center' }]}>
            MEMBER · {streak + 73} DAYS · OAKLAND, CA
          </Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { value: String(streak), label: 'Day streak' },
            { value: '87', label: 'Routines done' },
            { value: '23', label: 'Scans taken' },
          ].map(stat => (
            <FlutedGlass key={stat.label} padding={12} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[T.num, { fontSize: 22, fontWeight: '600', textAlign: 'center' }]}>
                {stat.value}
              </Text>
              <Text style={[T.kicker, { color: C.ink3, textAlign: 'center', marginTop: 3, letterSpacing: 0.6 }]}>
                {stat.label}
              </Text>
            </FlutedGlass>
          ))}
        </View>

        {/* Menu list */}
        <View style={styles.menuList}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuRow,
                i < MENU_ITEMS.length - 1 && styles.menuRowBorder,
              ]}
              onPress={() => {
                if (item.label === 'My products') onProducts?.();
              }}
              activeOpacity={0.6}
            >
              <Text style={[T.body, { color: C.ink2, marginRight: 8 }]}>{item.icon}</Text>
              <Text style={[T.body, { flex: 1, fontWeight: '500', color: C.ink }]}>{item.label}</Text>
              <ChevronRight />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
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
  profileTop: {
    alignItems: 'center',
    marginBottom: 22,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: '#F5EBDE',
    borderWidth: 2,
    borderColor: C.glassBorder,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
  },
  menuList: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  signOut: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});
