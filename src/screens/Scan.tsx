import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Svg, { Ellipse, Line, G, Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FaceLogo } from '../components/FaceLogo';
import { FlutedGlass } from '../components/FlutedGlass';
import { MetricStrip } from '../components/MetricStrip';
import { analyzeFrame } from '../services/vision';
import { useStore } from '../store';
import { VISION_ENABLED } from '../config/firebase';
import { C, R, T, S } from '../tokens';

type Step = 'preview' | 'scanning' | 'done';

const { width: SCREEN_W } = Dimensions.get('window');
const CAM_H = Math.min(340, SCREEN_W * 0.9);

export const Scan: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { setLastScores } = useStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep]   = useState<Step>('preview');
  const [scores, setScores] = useState<any>(null);
  const [region, setRegion] = useState('Forehead');
  const cameraRef = useRef<any>(null);

  const regionTabs = ['Forehead', 'T-Zone', 'Cheeks', 'Chin'];

  // ── Metrics built from scores ──────────────────────────────────────────────
  const metricsFromScores = (s: any) => [
    { key: 'overall',   value: String(s.overall),   label: 'Overall',   dot: 'good' as const },
    { key: 'hydration', value: String(s.hydration),  label: 'Hydration', dot: s.hydration < 65 ? 'warn' as const : 'good' as const },
    { key: 'texture',   value: String(s.texture),    label: 'Texture',   dot: 'good' as const },
    { key: 'pores',     value: String(s.pores),      label: 'Pores',     dot: s.pores < 65 ? 'warn' as const : 'good' as const },
    { key: 'redness',   value: String(s.redness),    label: 'Calm',      dot: 'good' as const },
    { key: 'oil',       value: String(s.oil),        label: 'Oil',       dot: s.oil < 55 ? 'warn' as const : 'good' as const },
    { key: 'acne',      value: String(s.acne),       label: 'Acne',      dot: s.acne < 65 ? 'warn' as const : 'good' as const },
    { key: 'tone',      value: String(s.tone),       label: 'Tone',      dot: 'good' as const },
  ];

  // ── Capture + analyse ──────────────────────────────────────────────────────
  const capture = async () => {
    setStep('scanning');
    try {
      let base64 = '';
      if (permission?.granted && cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.6 });
        base64 = photo.base64 ?? '';
      }
      const result = await analyzeFrame(base64);
      setScores(result);
      setLastScores(result);
      setStep('done');
    } catch {
      setStep('preview');
      Alert.alert('Scan failed', 'Please try again.');
    }
  };

  // ── Camera permission gate ─────────────────────────────────────────────────
  const PermissionPrompt = () => (
    <View style={styles.permBox}>
      <FaceLogo size={48} color={C.ink3} />
      <Text style={[T.h2, { textAlign: 'center', marginTop: 16 }]}>Camera access needed</Text>
      <Text style={[T.bodySm, { color: C.ink3, textAlign: 'center', marginTop: 8, lineHeight: 18 }]}>
        Poreless uses your front camera to analyse your skin in real time. No images are stored or sent without your permission.
      </Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission} activeOpacity={0.85}>
        <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>Allow camera →</Text>
      </TouchableOpacity>
    </View>
  );

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
          {!VISION_ENABLED && (
            <View style={styles.aiBadge}>
              <Text style={[T.kicker, { color: C.ink3, fontSize: 9 }]}>AI SIMULATED</Text>
            </View>
          )}
          {VISION_ENABLED && (
            <View style={[styles.aiBadge, { borderColor: C.accent }]}>
              <Text style={[T.kicker, { color: C.accent, fontSize: 9 }]}>AI ACTIVE</Text>
            </View>
          )}
        </View>

        {/* Camera / Face-art preview */}
        <View style={[styles.cameraWrap, { marginHorizontal: S.gutter }]}>
          {permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing="front"
            />
          ) : (
            // Face-art placeholder when no camera permission
            <View style={styles.logoPlaceholder}>
              <FaceLogo size={SCREEN_W * 0.35} color={C.ink3} strokeWidth={0.8} />
            </View>
          )}

          {/* Scan SVG overlay */}
          <Svg style={StyleSheet.absoluteFill} viewBox={`0 0 ${SCREEN_W - S.gutter * 2} ${CAM_H}`}>
            <Ellipse
              cx={(SCREEN_W - S.gutter * 2) / 2}
              cy={CAM_H / 2}
              rx={(SCREEN_W - S.gutter * 2) * 0.28}
              ry={CAM_H * 0.42}
              fill="none"
              stroke={step === 'done' ? C.sage : C.ink}
              strokeOpacity={step === 'done' ? 0.7 : 0.4}
              strokeWidth={step === 'done' ? 1.4 : 1}
              strokeDasharray={step === 'done' ? undefined : '5 4'}
            />
            {/* Corners */}
            {([
              [16, 16, 1, 1], [SCREEN_W - S.gutter*2 - 16, 16, -1, 1],
              [16, CAM_H-16, 1, -1], [SCREEN_W - S.gutter*2 - 16, CAM_H-16, -1, -1],
            ] as [number,number,number,number][]).map(([x,y,sx,sy], i) => (
              <G key={i} stroke={C.ink} strokeOpacity={0.7} strokeWidth={1.4} fill="none">
                <Line x1={x} y1={y} x2={x+14*sx} y2={y} />
                <Line x1={x} y1={y} x2={x} y2={y+14*sy} />
              </G>
            ))}
          </Svg>

          {/* Status pill */}
          <View style={styles.statusPill}>
            <Text style={[T.kicker, { color: 'white', letterSpacing: 0.8, fontSize: 9 }]}>
              {step === 'preview'  && '· good light · centred ·'}
              {step === 'scanning' && '· AI analysing · 28 markers ·'}
              {step === 'done'     && '· scan complete ·'}
            </Text>
          </View>

          {step === 'scanning' && (
            <View style={styles.scanningOverlay}>
              <ActivityIndicator color={C.accent} size="large" />
            </View>
          )}
        </View>

        {/* Permission prompt (shown inline if not granted) */}
        {!permission?.granted && <PermissionPrompt />}

        {/* Results */}
        {step === 'done' && scores && (
          <>
            <View style={[styles.aiMessage, { marginHorizontal: S.gutter }]}>
              <Text style={[T.kicker, { color: C.accent, marginBottom: 3 }]}>
                AI SUMMARY · {Math.round(scores.confidence * 100)}% CONFIDENCE
              </Text>
              <Text style={[T.bodySm, { color: C.ink2 }]}>{scores.message}</Text>
            </View>
            <View style={{ paddingHorizontal: S.gutter, marginBottom: 12 }}>
              <MetricStrip
                metrics={metricsFromScores(scores)}
                active="overall"
                onPick={() => {}}
              />
            </View>
            {/* Region tabs */}
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
          </>
        )}

        {/* Quality checks (preview only) */}
        {step === 'preview' && permission?.granted && (
          <View style={[styles.qualityRow, { marginHorizontal: S.gutter }]}>
            {[{ l: 'Light', v: 'Even' }, { l: 'Angle', v: '+0°' }, { l: 'Distance', v: '32 cm' }].map(q => (
              <FlutedGlass key={q.l} padding={10} style={{ flex: 1 }}>
                <Text style={[T.kicker, { textAlign: 'center', marginBottom: 3 }]}>{q.l}</Text>
                <Text style={[T.num, { fontSize: 15, fontWeight: '600', textAlign: 'center' }]}>{q.v}</Text>
              </FlutedGlass>
            ))}
          </View>
        )}

        {/* CTA */}
        {permission?.granted && (
          <View style={{ paddingHorizontal: S.gutter }}>
            {step !== 'done' ? (
              <TouchableOpacity
                style={[styles.primaryBtn, step === 'scanning' && { backgroundColor: C.ink3 }]}
                onPress={step === 'preview' ? capture : undefined}
                activeOpacity={0.85}
              >
                <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>
                  {step === 'scanning' ? '⏳  Analysing…' : '⊙  Capture · front camera'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: C.sage }]}
                onPress={() => setStep('preview')}
                activeOpacity={0.85}
              >
                <Text style={[T.button, { color: C.bg, fontSize: 14 }]}>✓  Done · scan again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
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
  aiBadge: {
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: R.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  cameraWrap: {
    height: CAM_H,
    backgroundColor: '#E8DDD0',
    borderRadius: R.lg,
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  logoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0EAE0',
  },
  statusPill: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.52)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: R.pill,
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251,250,247,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permBox: {
    marginHorizontal: S.gutter,
    alignItems: 'center',
    padding: 20,
    marginBottom: 14,
  },
  aiMessage: {
    backgroundColor: C.accentSoft,
    borderRadius: R.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.accent + '44',
  },
  qualityRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  regionRow: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  regionTab: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: R.pill,
    borderWidth: 1, borderColor: C.line2,
    backgroundColor: C.surface,
  },
  regionTabActive: { backgroundColor: C.accentSoft, borderColor: C.accent },
  primaryBtn: {
    backgroundColor: C.ink,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
