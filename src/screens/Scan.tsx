import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, Dimensions,
} from 'react-native';
import Svg, { Ellipse, Line, G, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FlutedGlass } from '../components/FlutedGlass';
import { C, R, T, S } from '../tokens';

type Step = 'preview' | 'scanning' | 'done';

const { width: SCREEN_W } = Dimensions.get('window');
const PHOTO_H = Math.min(340, SCREEN_W * 0.85);

export const Scan: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>('preview');

  useEffect(() => {
    if (step !== 'scanning') return;
    const t = setTimeout(() => setStep('done'), 2400);
    return () => clearTimeout(t);
  }, [step]);

  const regionTabs = ['Forehead', 'T-Zone', 'Cheeks', 'Chin'];
  const [region, setRegion] = useState('Forehead');

  return (
    <View style={styles.root}>
      <Background />
      <View style={[styles.screen, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 }]}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: S.gutter }]}>
          <View>
            <Text style={T.kicker}>SCAN · DAILY</Text>
            <Text style={[T.h1, { fontSize: 30, marginTop: 4 }]}>
              face <Text style={{ fontStyle: 'italic', color: C.accentInk }}>scan</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.xBtn} activeOpacity={0.7} onPress={() => setStep('preview')}>
            <Text style={[T.body, { color: C.ink3, fontSize: 16 }]}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Portrait + overlay */}
        <View style={[styles.photoWrap, { marginHorizontal: S.gutter }]}>
          <Image
            source={require('../../assets/scan-portrait.png')}
            style={styles.photo}
            resizeMode="contain"
          />

          {/* SVG scan overlay */}
          <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${SCREEN_W - S.gutter * 2} ${PHOTO_H}`}>
            {/* Face oval */}
            <Ellipse
              cx={(SCREEN_W - S.gutter * 2) / 2}
              cy={PHOTO_H / 2}
              rx={(SCREEN_W - S.gutter * 2) * 0.28}
              ry={PHOTO_H * 0.42}
              fill="none"
              stroke={C.ink}
              strokeOpacity={0.4}
              strokeWidth={1}
              strokeDasharray="5 4"
            />
            {/* Corner brackets */}
            {([
              [16, 16, 1, 1], [SCREEN_W - S.gutter * 2 - 16, 16, -1, 1],
              [16, PHOTO_H - 16, 1, -1], [SCREEN_W - S.gutter * 2 - 16, PHOTO_H - 16, -1, -1],
            ] as [number, number, number, number][]).map(([x, y, sx, sy], i) => (
              <G key={i} stroke={C.ink} strokeOpacity={0.7} strokeWidth={1.4} fill="none">
                <Line x1={x} y1={y} x2={x + 14 * sx} y2={y} />
                <Line x1={x} y1={y} x2={x} y2={y + 14 * sy} />
              </G>
            ))}
            {/* Scanning sweep line */}
            {step === 'scanning' && (
              <Line
                x1="20"
                x2={(SCREEN_W - S.gutter * 2 - 20).toString()}
                y1="40"
                y2="40"
                stroke={C.accent}
                strokeWidth={1.4}
              >
                <animateMotion dur="1.2s" repeatCount="indefinite" path={`M0,0 L0,${PHOTO_H - 60}`} />
              </Line>
            )}
          </Svg>

          {/* Status pill */}
          <View style={styles.statusPill}>
            <Text style={[T.kicker, { color: 'white', letterSpacing: 1 }]}>
              {step === 'preview'  && '· good light · centred ·'}
              {step === 'scanning' && '· analysing · 28 markers ·'}
              {step === 'done'     && '· scan complete ·'}
            </Text>
          </View>
        </View>

        {/* Quality check */}
        <View style={[styles.qualityRow, { marginHorizontal: S.gutter }]}>
          {[
            { label: 'Light', value: 'Even' },
            { label: 'Angle', value: '+0°' },
            { label: 'Distance', value: '32 cm' },
          ].map(q => (
            <FlutedGlass key={q.label} padding={10} style={{ flex: 1 }}>
              <Text style={[T.kicker, { textAlign: 'center', marginBottom: 3 }]}>{q.label}</Text>
              <Text style={[T.num, { fontSize: 16, fontWeight: '600', textAlign: 'center', color: step === 'done' ? C.sage : C.ink }]}>
                {q.value}
              </Text>
            </FlutedGlass>
          ))}
        </View>

        {/* Region tabs (shown after scan) */}
        {step === 'done' && (
          <View style={[styles.regionRow, { marginHorizontal: S.gutter }]}>
            {regionTabs.map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.regionTab, r === region && styles.regionTabActive]}
                onPress={() => setRegion(r)}
                activeOpacity={0.7}
              >
                <Text style={[T.kicker, { color: r === region ? C.accentInk : C.ink3 }]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CTA */}
        <View style={{ paddingHorizontal: S.gutter }}>
          {step !== 'done' ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setStep(s => s === 'preview' ? 'scanning' : 'preview')}
              activeOpacity={0.85}
            >
              <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>
                {step === 'scanning' ? '✕  Cancel scan' : '⊙  Capture · single front photo'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: C.sage }]}
              onPress={() => setStep('preview')}
              activeOpacity={0.85}
            >
              <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>✓  Done · view results</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  xBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoWrap: {
    height: PHOTO_H,
    backgroundColor: '#F5EBDE',
    borderRadius: R.lg,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    opacity: 0.92,
  },
  statusPill: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: R.pill,
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  regionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  regionTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.line2,
    backgroundColor: C.surface,
  },
  regionTabActive: {
    backgroundColor: C.accentSoft,
    borderColor: C.accent,
  },
  primaryBtn: {
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
