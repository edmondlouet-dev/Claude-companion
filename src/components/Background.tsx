/**
 * App background: paper-white base + animated floating orange blobs + flute overlay.
 * Blobs drift slowly in sinusoidal paths — subtle, non-distracting.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Rect, Pattern } from 'react-native-svg';
import { C } from '../tokens';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

interface BlobConfig {
  cx0: number; cy0: number;   // start position (0-1 of screen)
  rx: number;  ry: number;    // radius (0-1 of screen)
  color: string;
  opacity: number;
  waypoints: [number, number][];  // drift waypoints (0-1 of screen)
  durations: number[];            // ms per leg
}

function useDriftingBlob(
  initial: number,
  waypoints: number[],
  durations: number[],
  width: number,
  toPixel: (v: number) => number,
) {
  const anim = useRef(new Animated.Value(toPixel(initial))).current;

  useEffect(() => {
    const sequence = waypoints.map((wp, i) =>
      Animated.timing(anim, {
        toValue: toPixel(wp),
        duration: durations[i] ?? 12000,
        useNativeDriver: false,
      })
    );
    Animated.loop(Animated.sequence(sequence)).start();
  }, [width]);

  return anim;
}

interface Props {
  mode?: 'normal' | 'lookmax';
}

export const Background: React.FC<Props> = ({ mode = 'normal' }) => {
  const { width, height } = useWindowDimensions();
  const bgColor = mode === 'lookmax' ? '#F0EDE5' : C.bg;

  const toX = (v: number) => v * width;
  const toY = (v: number) => v * height;

  // ── Blob 1: upper-left warm peach ──────────────────────────────────────────
  const b1x = useDriftingBlob(0.18, [0.26, 0.12, 0.22, 0.18], [14000, 18000, 16000, 14000], width, toX);
  const b1y = useDriftingBlob(0.10, [0.06, 0.18, 0.08, 0.10], [14000, 18000, 16000, 14000], height, toY);

  // ── Blob 2: lower-right cool teal ──────────────────────────────────────────
  const b2x = useDriftingBlob(0.88, [0.78, 0.92, 0.84, 0.88], [18000, 14000, 20000, 18000], width, toX);
  const b2y = useDriftingBlob(0.86, [0.92, 0.78, 0.88, 0.86], [18000, 14000, 20000, 18000], height, toY);

  // ── Blob 3: centre amber accent ────────────────────────────────────────────
  const b3x = useDriftingBlob(0.60, [0.68, 0.52, 0.62, 0.60], [22000, 18000, 20000, 22000], width, toX);
  const b3y = useDriftingBlob(0.48, [0.54, 0.42, 0.50, 0.48], [22000, 18000, 20000, 22000], height, toY);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} pointerEvents="none">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Warm peach blob */}
          <RadialGradient id="b1" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#F5A070" stopOpacity="0.52" />
            <Stop offset="60%"  stopColor="#F5B88A" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#F5C6A0" stopOpacity="0" />
          </RadialGradient>
          {/* Cool teal blob */}
          <RadialGradient id="b2" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#8ABFC5" stopOpacity="0.38" />
            <Stop offset="100%" stopColor="#8ABFC5" stopOpacity="0" />
          </RadialGradient>
          {/* Warm amber blob */}
          <RadialGradient id="b3" cx="50%" cy="50%" r="50%">
            <Stop offset="0%"   stopColor="#E8A060" stopOpacity="0.28" />
            <Stop offset="100%" stopColor="#E8D5A8" stopOpacity="0" />
          </RadialGradient>
          {/* Flute overlay pattern */}
          <Pattern id="bgFlute" x="0" y="0" width="6" height="2" patternUnits="userSpaceOnUse">
            <Rect x="1" y="0" width="0.5" height="2" fill="rgba(255,255,255,0.55)" />
            <Rect x="3" y="0" width="1"   height="2" fill="rgba(180,160,130,0.06)" />
          </Pattern>
        </Defs>

        {/* Animated blobs */}
        <AnimatedEllipse
          cx={b1x as any}
          cy={b1y as any}
          rx={width * 0.46}
          ry={height * 0.28}
          fill="url(#b1)"
        />
        <AnimatedEllipse
          cx={b2x as any}
          cy={b2y as any}
          rx={width * 0.38}
          ry={height * 0.22}
          fill="url(#b2)"
        />
        <AnimatedEllipse
          cx={b3x as any}
          cy={b3y as any}
          rx={width * 0.26}
          ry={height * 0.18}
          fill="url(#b3)"
        />

        {/* Global flute overlay */}
        <Rect width={width} height={height} fill="url(#bgFlute)" opacity={0.65} />
      </Svg>
    </View>
  );
};
