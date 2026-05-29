/**
 * AR Sculpting overlay — launched from a ritual's Structural Sculpting Blueprint.
 *
 * Opens the front camera and draws line-art guides + directional arrows over the
 * face showing exactly how to perform each movement (drainage / sculpt / lift /
 * soothe). Arrows have an animated "flow" dash so the direction of motion reads
 * at a glance; soothe steps render pulsing press-points instead of arrows.
 *
 * No frames are captured or stored — it's a live guide only.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Modal, Dimensions,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Path, Ellipse, Circle, G } from 'react-native-svg';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FaceLogo } from './FaceLogo';
import type { BlueprintIcon } from '../skin';
import { C, R, T, S } from '../tokens';

const { width: W, height: H } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export interface ARStep {
  icon: BlueprintIcon;
  title: string;
  body: string;
}

interface Arrow { d: string; head: string; }
interface Guide { arrows: Arrow[]; press: { x: number; y: number }[]; cue: string; }

// Arrowhead: a small chevron at tip (x,y) pointing along `angle` (deg, dir of travel).
function head(x: number, y: number, angle: number, len = 4.5): string {
  const a = (angle * Math.PI) / 180;
  const back = a + Math.PI;
  const wing = (deg: number) => {
    const w = back + (deg * Math.PI) / 180;
    return `${(x + len * Math.cos(w)).toFixed(1)} ${(y + len * Math.sin(w)).toFixed(1)}`;
  };
  return `M ${wing(28)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${wing(-28)}`;
}

// Geometry in a 100 × 150 portrait viewBox laid over the camera.
const GUIDES: Record<BlueprintIcon, Guide> = {
  drainage: {
    arrows: [
      { d: 'M 66 56 C 70 76 66 96 60 110', head: head(60, 110, 110) },
      { d: 'M 34 56 C 30 76 34 96 40 110', head: head(40, 110, 70) },
    ],
    press: [],
    cue: 'Trace down — inner brow → jaw → collarbone. Three slow passes per side.',
  },
  sculpt: {
    arrows: [
      { d: 'M 52 74 C 64 66 72 54 80 42', head: head(80, 42, -57) },
      { d: 'M 48 74 C 36 66 28 54 20 42', head: head(20, 42, -123) },
    ],
    press: [],
    cue: 'Sculpt the fuller cheek up toward the temple — fewer passes on the lighter side.',
  },
  lift: {
    arrows: [
      { d: 'M 64 52 C 72 48 78 44 84 38', head: head(84, 38, -40) },
      { d: 'M 36 52 C 28 48 22 44 16 38', head: head(16, 38, -140) },
    ],
    press: [],
    cue: 'Press up-and-out from the outer eye corner toward the brow tail — never inward.',
  },
  soothe: {
    arrows: [],
    press: [{ x: 36, y: 66 }, { x: 64, y: 66 }, { x: 50, y: 88 }],
    cue: 'Press — don\'t rub — the final layer in with warm palms to seal and calm.',
  },
};

const LABEL: Record<BlueprintIcon, string> = {
  drainage: 'LYMPHATIC DRAINAGE', sculpt: 'CHEEK SCULPT',
  lift: 'EYE LIFT', soothe: 'BARRIER PRESS',
};

interface Props {
  steps: ARStep[];
  ritualName?: string;
  onClose: () => void;
}

export const ARSculptOverlay: React.FC<Props> = ({ steps, ritualName, onClose }) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [idx, setIdx] = useState(0);

  const flow  = useRef(new Animated.Value(0)).current;   // arrow dash flow
  const pulse = useRef(new Animated.Value(0)).current;   // press-point pulse

  useEffect(() => {
    Animated.loop(
      Animated.timing(flow, { toValue: 1, duration: 1100, useNativeDriver: false }),
    ).start();
    Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: false }),
    ).start();
  }, []);

  const step  = steps[idx];
  const guide = step ? GUIDES[step.icon] : undefined;

  const dashOffset = flow.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const pulseR     = pulse.interpolate({ inputRange: [0, 1], outputRange: [3, 11] });
  const pulseO     = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} transparent={false}>
      <View style={styles.root}>
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFill} facing="front" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.placeholder]}>
            <FaceLogo size={W * 0.4} color="rgba(255,255,255,0.25)" strokeWidth={0.8} />
          </View>
        )}

        {/* Darkening so the line-art reads over any camera feed */}
        <View style={[StyleSheet.absoluteFill, styles.scrim]} pointerEvents="none" />

        {/* AR guide layer */}
        <Svg
          style={StyleSheet.absoluteFill}
          viewBox="0 0 100 150"
          preserveAspectRatio="xMidYMid slice"
          pointerEvents="none"
        >
          {/* face guide */}
          <Ellipse cx={50} cy={60} rx={28} ry={38} fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth={0.5} />
          <Path d="M 50 30 L 50 92" stroke="rgba(255,255,255,0.16)" strokeWidth={0.4} />

          {guide?.arrows.map((ar, i) => (
            <G key={i}>
              <AnimatedPath
                d={ar.d}
                fill="none"
                stroke={C.accent}
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeDasharray="6 6"
                strokeDashoffset={dashOffset}
              />
              <Path d={ar.head} fill="none" stroke={C.accent} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </G>
          ))}

          {guide?.press.map((p, i) => (
            <G key={`p-${i}`}>
              <AnimatedCircle cx={p.x} cy={p.y} r={pulseR} fill="none" stroke={C.accent} strokeWidth={0.8} opacity={pulseO} />
              <Circle cx={p.x} cy={p.y} r={2.4} fill={C.accent} />
            </G>
          ))}
        </Svg>

        {/* Top bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <View>
            <Text style={[T.kicker, { color: 'rgba(255,255,255,0.85)', letterSpacing: 2 }]}>
              AR SCULPT {ritualName ? `· ${ritualName.toUpperCase()}` : ''}
            </Text>
            <Text style={[T.kicker, { color: C.accent, marginTop: 4 }]}>
              {step ? LABEL[step.icon] : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={24} strokeWidth={1.2} color="white" />
          </TouchableOpacity>
        </View>

        {/* Instruction card */}
        <View style={[styles.card, { paddingBottom: insets.bottom + 16 }]}>
          {!permission?.granted && (
            <TouchableOpacity style={styles.allowBtn} onPress={requestPermission} activeOpacity={0.85}>
              <Text style={[T.button, { color: C.bg }]}>Enable camera for live AR →</Text>
            </TouchableOpacity>
          )}

          <Text style={[T.kicker, { color: C.accent, marginBottom: 6 }]}>
            STEP {idx + 1} OF {steps.length}
          </Text>
          <Text style={[T.h2, { color: 'white', fontSize: 20 }]}>{step?.title}</Text>
          <Text style={[T.bodySm, { color: 'rgba(255,255,255,0.8)', marginTop: 8, lineHeight: 18 }]}>
            {guide?.cue}
          </Text>

          {/* dots */}
          <View style={styles.dotRow}>
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === idx && styles.dotActive]} />
            ))}
          </View>

          {/* nav */}
          <View style={styles.navRow}>
            <TouchableOpacity
              style={[styles.navBtn, idx === 0 && styles.navBtnDisabled]}
              disabled={idx === 0}
              onPress={() => setIdx(i => Math.max(0, i - 1))}
              activeOpacity={0.8}
            >
              <ChevronLeft size={18} strokeWidth={1.4} color={idx === 0 ? 'rgba(255,255,255,0.3)' : 'white'} />
              <Text style={[T.button, { color: idx === 0 ? 'rgba(255,255,255,0.3)' : 'white', fontSize: 12 }]}>Back</Text>
            </TouchableOpacity>

            {idx < steps.length - 1 ? (
              <TouchableOpacity style={styles.navBtnPrimary} onPress={() => setIdx(i => i + 1)} activeOpacity={0.85}>
                <Text style={[T.button, { color: C.ink, fontSize: 12 }]}>Next movement</Text>
                <ChevronRight size={18} strokeWidth={1.4} color={C.ink} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.navBtnPrimary} onPress={onClose} activeOpacity={0.85}>
                <Text style={[T.button, { color: C.ink, fontSize: 12 }]}>✓  Finish</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0B08' },
  placeholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#16130F' },
  scrim: { backgroundColor: 'rgba(13,11,8,0.32)' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: S.gutter, paddingBottom: 12,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  card: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(13,11,8,0.78)',
    borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl,
    paddingHorizontal: S.gutter, paddingTop: 18,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  allowBtn: {
    backgroundColor: C.accent, borderRadius: R.md,
    paddingVertical: 12, alignItems: 'center', marginBottom: 14,
  },
  dotRow: { flexDirection: 'row', gap: 6, marginTop: 16, justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { backgroundColor: C.accent, width: 18 },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 8 },
  navBtnDisabled: {},
  navBtnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'white', borderRadius: R.md,
    paddingVertical: 12, paddingHorizontal: 18,
  },
});
