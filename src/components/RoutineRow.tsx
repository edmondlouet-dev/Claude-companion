import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  LayoutAnimation, Platform, UIManager,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { FlutedGlass } from './FlutedGlass';
import { C, R, T } from '../tokens';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  idx: number;
  stepName: string;
  productName: string;
  time?: string;
  defaultDone?: boolean;
  why?: string;
}

export const RoutineRow: React.FC<Props> = ({
  idx, stepName, productName, time, defaultDone = false, why,
}) => {
  const [done, setDone] = useState(defaultDone);
  const [open, setOpen] = useState(false);
  // Fade content when done (no strikethrough — just dimmer + heavier glass)
  const contentOpacity = useRef(new Animated.Value(defaultDone ? 0.55 : 1)).current;

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !done;
    setDone(next);
    Animated.timing(contentOpacity, {
      toValue: next ? 0.55 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ marginBottom: 6 }}>
      <FlutedGlass
        padding={12}
        style={done ? styles.done : styles.normal}
      >
        <View style={styles.row}>
          {/* Checkbox */}
          <TouchableOpacity onPress={toggle} style={[styles.check, done && styles.checkDone]}>
            {done && (
              <Svg width={11} height={11} viewBox="0 0 24 24">
                <Path
                  d="M5 13l4 4L19 7"
                  stroke={C.bg}
                  strokeWidth={2.6}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </TouchableOpacity>

          {/* Content fades when done — no strikethrough */}
          <Animated.View style={{ flex: 1, opacity: contentOpacity }}>
            <View style={styles.titleRow}>
              <Text style={[T.body, styles.title]} numberOfLines={1}>
                <Text style={[T.num, { fontSize: 11, color: C.ink3 }]}>
                  {String(idx).padStart(2, '0')}{' '}
                </Text>
                {stepName}
              </Text>
              {time && (
                <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>{time}</Text>
              )}
            </View>
            <Text style={[T.bodySm, { color: C.ink3, marginTop: 1 }]}>{productName}</Text>

            {why && (
              <TouchableOpacity
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setOpen(o => !o);
                }}
                style={styles.whyBtn}
              >
                <Text style={styles.whyLabel}>✦ WHY {open ? '↑' : '↓'}</Text>
              </TouchableOpacity>
            )}

            {open && why && (
              <View style={styles.whyBox}>
                <Text style={[T.bodySm, { color: C.ink2, lineHeight: 17 }]}>{why}</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </FlutedGlass>
    </View>
  );
};

const styles = StyleSheet.create({
  normal: { borderColor: C.line },
  done: {
    // Slightly more opaque glass + border gone to read as "settled/done"
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,253,0.72)',
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  check: {
    width: 16, height: 16,
    borderRadius: 3,
    borderWidth: 1.4,
    borderColor: C.line3,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  checkDone: { backgroundColor: C.ink, borderColor: C.ink },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
    color: C.ink,
  },
  whyBtn: { marginTop: 6 },
  whyLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10.5,
    color: C.accent,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  whyBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: C.surface2,
    borderRadius: R.md,
  },
});
