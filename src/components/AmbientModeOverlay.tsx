import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, ChevronRight } from 'lucide-react-native';
import { C, R, T, S } from '../tokens';

const { width: W } = Dimensions.get('window');
const STEP_DURATION = 30; // seconds per step

export interface AmbientStep {
  label: string;
  productName: string;
  duration?: number;
}

interface Props {
  steps: AmbientStep[];
  ritualKey?: string;
  onComplete: () => void;
  onDismiss: () => void;
}

export const AmbientModeOverlay: React.FC<Props> = ({
  steps, ritualKey, onComplete, onDismiss,
}) => {
  const [stepIdx, setStepIdx]     = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim     = useRef(new Animated.Value(0)).current;
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = steps.length;
  const current    = steps[stepIdx];
  const stepSecs   = current?.duration ?? STEP_DURATION;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Progress animation + countdown for current step
  useEffect(() => {
    if (!current) return;

    progressAnim.setValue(0);
    setSecondsLeft(stepSecs);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: stepSecs * 1000,
      useNativeDriver: false,
    }).start();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          advanceStep();
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [stepIdx]);

  const advanceStep = () => {
    setStepIdx(i => {
      const next = i + 1;
      if (next >= totalSteps) {
        // All done
        setTimeout(onComplete, 300);
        return i;
      }
      return next;
    });
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, W - S.gutter * 2 - 32],
  });

  return (
    <Animated.View style={[styles.root, { opacity: fadeAnim }]}>
      <BlurView style={StyleSheet.absoluteFill} intensity={96} tint="light" />
      <View style={[StyleSheet.absoluteFill, styles.warmTint]} />

      {/* Dismiss */}
      <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} activeOpacity={0.8}>
        <X size={24} strokeWidth={1.2} color={C.ink3} />
      </TouchableOpacity>

      {/* Step counter */}
      <Text style={[T.kicker, styles.stepCounter]}>
        AMBIENT MODE · STEP {stepIdx + 1} OF {totalSteps}
      </Text>

      {/* Large step display */}
      <View style={styles.centerBlock}>
        <Text style={[T.num, styles.countdown]}>{secondsLeft}</Text>
        <Text style={[T.kicker, { color: C.ink3, marginBottom: 12 }]}>SECONDS</Text>

        <Text style={[T.h1, styles.stepLabel]}>{current?.label}</Text>
        <Text style={[T.bodySm, styles.productName]}>{current?.productName}</Text>
      </View>

      {/* Progress track */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Step dots */}
      <View style={styles.dotRow}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.dot, i <= stepIdx && styles.dotActive]} />
        ))}
      </View>

      {/* Skip ahead */}
      <TouchableOpacity style={styles.skipBtn} onPress={advanceStep} activeOpacity={0.7}>
        <Text style={[T.kicker, { color: C.ink3 }]}>SKIP STEP</Text>
        <ChevronRight size={16} strokeWidth={1.2} color={C.ink3} />
      </TouchableOpacity>

      {ritualKey && (
        <Text style={[T.kicker, styles.ritualLabel]}>
          ✦ {ritualKey.toUpperCase()} RITUAL
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
  },
  warmTint: { backgroundColor: 'rgba(251,250,247,0.55)' },
  closeBtn: {
    position: 'absolute', top: 60, right: S.gutter,
    width: 36, height: 36,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.surface2, borderRadius: 18,
  },
  stepCounter: {
    position: 'absolute', top: 66,
    alignSelf: 'center',
    color: C.ink3,
  },
  centerBlock: { alignItems: 'center', paddingHorizontal: S.gutter },
  countdown: {
    fontSize: 88, fontWeight: '700',
    color: C.accent, lineHeight: 88,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 32, textAlign: 'center',
    marginBottom: 8, lineHeight: 38,
  },
  productName: {
    color: C.ink3, textAlign: 'center', fontSize: 13,
    fontStyle: 'italic',
  },
  progressTrack: {
    height: 2,
    backgroundColor: C.line,
    marginHorizontal: S.gutter + 16,
    marginTop: 40,
    borderRadius: 1, overflow: 'hidden',
  },
  progressFill: {
    height: 2, backgroundColor: C.accent, borderRadius: 1,
  },
  dotRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    marginTop: 14,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: C.line2,
  },
  dotActive: { backgroundColor: C.accent },
  skipBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    marginTop: 28,
  },
  ritualLabel: {
    color: C.accent, textAlign: 'center', marginTop: 18,
  },
});
