/**
 * App background: paper-white base + three soft radial blobs + full-screen flute overlay.
 * The blobs are approximated with SVG radial gradients.
 */
import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Ellipse, Rect, Pattern } from 'react-native-svg';
import { C } from '../tokens';

interface Props {
  mode?: 'normal' | 'lookmax';
}

export const Background: React.FC<Props> = ({ mode = 'normal' }) => {
  const { width, height } = useWindowDimensions();
  const bgColor = mode === 'lookmax' ? '#F0EDE5' : C.bg;

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} pointerEvents="none">
      {/* Radial gradient blobs */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Blob 1 — warm peach upper-left */}
          <RadialGradient id="b1" cx="18%" cy="12%" rx="50%" ry="30%">
            <Stop offset="0%" stopColor="#F5C6A0" stopOpacity="0.55" />
            <Stop offset="100%" stopColor="#F5C6A0" stopOpacity="0" />
          </RadialGradient>
          {/* Blob 2 — cool teal lower-right */}
          <RadialGradient id="b2" cx="90%" cy="88%" rx="40%" ry="25%">
            <Stop offset="0%" stopColor="#A0BFC5" stopOpacity="0.40" />
            <Stop offset="100%" stopColor="#A0BFC5" stopOpacity="0" />
          </RadialGradient>
          {/* Blob 3 — warm amber center */}
          <RadialGradient id="b3" cx="60%" cy="50%" rx="25%" ry="20%">
            <Stop offset="0%" stopColor="#E8D5A8" stopOpacity="0.30" />
            <Stop offset="100%" stopColor="#E8D5A8" stopOpacity="0" />
          </RadialGradient>
          {/* Full-screen flute pattern */}
          <Pattern id="bgFlute" x="0" y="0" width="6" height="2" patternUnits="userSpaceOnUse">
            <Rect x="1"   y="0" width="0.5" height="2" fill="rgba(255,255,255,0.55)" />
            <Rect x="3"   y="0" width="1"   height="2" fill="rgba(180,160,130,0.06)" />
          </Pattern>
        </Defs>

        {/* Blobs */}
        <Ellipse cx={width * 0.18} cy={height * 0.12} rx={width * 0.50} ry={height * 0.30} fill="url(#b1)" />
        <Ellipse cx={width * 0.90} cy={height * 0.88} rx={width * 0.40} ry={height * 0.25} fill="url(#b2)" />
        <Ellipse cx={width * 0.60} cy={height * 0.50} rx={width * 0.25} ry={height * 0.20} fill="url(#b3)" />

        {/* Global flute overlay */}
        <Rect width={width} height={height} fill="url(#bgFlute)" opacity={0.7} />
      </Svg>
    </View>
  );
};
