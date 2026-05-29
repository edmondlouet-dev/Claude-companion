import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal,
  ActivityIndicator, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, ScanBarcode, ShoppingBag, Check, TriangleAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ShelfProduct } from '../store';
import { C, R, T, S } from '../tokens';

// ── Ingredient safety ─────────────────────────────────────────────────────────
const HARSH_ACTIVES = [
  'retinol', 'retinyl', 'tretinoin', 'retinoic', 'adapalene',
  'glycolic acid', 'salicylic acid', 'benzoyl peroxide',
  'ascorbic acid', 'vitamin c', 'lactic acid', 'azelaic acid',
];

function harshActiveIn(ingredients: string[]): string | null {
  const lower = ingredients.map(i => i.toLowerCase());
  for (const h of HARSH_ACTIVES) {
    if (lower.some(ing => ing.includes(h))) return h;
  }
  return null;
}

// ── Amazon restock URL ────────────────────────────────────────────────────────
function getRestockUrl(name: string, brand = ''): string {
  const q = `${brand} ${name}`.trim();
  return `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}&tag=poreless-20`;
}

// ── Simulation fallback (when proxy is not reachable) ─────────────────────────
function simulatedProduct(barcode: string): ShelfProduct {
  const demos: ShelfProduct[] = [
    {
      id: barcode,
      barcode,
      name: 'CeraVe Hydrating Cleanser',
      brand: 'CeraVe',
      ingredients: ['water', 'glycerin', 'ceramide np', 'ceramide ap', 'ceramide eop', 'hyaluronic acid', 'niacinamide'],
      remainingVolume: 100,
      purchaseUrl: getRestockUrl('CeraVe Hydrating Cleanser', 'CeraVe'),
      category: 'cleanser',
    },
    {
      id: barcode,
      barcode,
      name: 'La Roche-Posay Toleriane Double Repair',
      brand: 'La Roche-Posay',
      ingredients: ['water', 'niacinamide', 'ceramide np', 'glycerin', 'squalane', 'shea butter'],
      remainingVolume: 100,
      purchaseUrl: getRestockUrl('Toleriane Double Repair', 'La Roche-Posay'),
      category: 'moisturizer',
    },
  ];
  return demos[Math.floor(Math.random() * demos.length)];
}

// ── INCI proxy call ───────────────────────────────────────────────────────────
const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL ?? 'http://localhost:3001';

async function fetchProductByBarcode(barcode: string): Promise<ShelfProduct | null> {
  try {
    const res = await fetch(`${PROXY_URL}/product/${encodeURIComponent(barcode)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const d = await res.json();
    const ingredients: string[] = (d.ingredients_text ?? d.ingredients ?? '')
      .split(/[,;]\s*/)
      .map((s: string) => s.trim().toLowerCase())
      .filter(Boolean);
    return {
      id: barcode,
      barcode,
      name: d.product_name ?? d.name ?? 'Unknown Product',
      brand: d.brands ?? d.brand ?? '',
      ingredients,
      remainingVolume: 100,
      purchaseUrl: getRestockUrl(d.product_name ?? '', d.brands ?? ''),
      category: d.category ?? 'moisturizer',
    };
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  barrierStatus: string;
  onClose: () => void;
  onProductAdded: (product: ShelfProduct) => void;
}

type ScanPhase = 'scanning' | 'loading' | 'preview';

export const ProductBarcodeScanner: React.FC<Props> = ({
  visible, barrierStatus, onClose, onProductAdded,
}) => {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<ScanPhase>('scanning');
  const [product, setProduct] = useState<ShelfProduct | null>(null);
  const scanLocked = useRef(false);
  const cardSlide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (!visible) {
      // Reset on close
      setPhase('scanning');
      setProduct(null);
      scanLocked.current = false;
    }
  }, [visible]);

  useEffect(() => {
    if (phase === 'preview') {
      Animated.spring(cardSlide, { toValue: 0, useNativeDriver: true, bounciness: 5 }).start();
    } else {
      cardSlide.setValue(300);
    }
  }, [phase]);

  const handleBarcode = async ({ data }: { data: string }) => {
    if (scanLocked.current || phase !== 'scanning') return;
    scanLocked.current = true;
    setPhase('loading');
    const result = (await fetchProductByBarcode(data)) ?? simulatedProduct(data);
    setProduct(result);
    setPhase('preview');
  };

  const handleAdd = () => {
    if (!product) return;
    onProductAdded(product);
    onClose();
  };

  const harshActive = product ? harshActiveIn(product.ingredients) : null;
  const barrierFatigued = /sensiti|fatig/i.test(barrierStatus);
  const showWarning = !!(harshActive && barrierFatigued);

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Camera */}
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'] }}
            onBarcodeScanned={phase === 'scanning' ? handleBarcode : undefined}
          />
        ) : (
          <View style={styles.noCam}>
            <ScanBarcode size={48} strokeWidth={1.2} color={C.ink3} />
            <Text style={[T.h2, { textAlign: 'center', marginTop: 16, color: C.ink }]}>Camera access needed</Text>
            <TouchableOpacity style={styles.allowBtn} onPress={requestPermission} activeOpacity={0.85}>
              <Text style={[T.button, { color: C.bg }]}>Allow camera →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Dark vignette overlay */}
        <View style={[StyleSheet.absoluteFill, styles.vignette]} pointerEvents="none" />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <Text style={[T.kicker, { color: 'rgba(255,255,255,0.85)', letterSpacing: 2 }]}>
            SCAN BARCODE
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <X size={24} strokeWidth={1.2} color="white" />
          </TouchableOpacity>
        </View>

        {/* Viewfinder bracket */}
        {phase === 'scanning' && (
          <View style={styles.viewfinderWrap} pointerEvents="none">
            <View style={styles.viewfinder}>
              {/* Corner marks */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.scanHint}>Point at a product barcode</Text>
          </View>
        )}

        {/* Loading spinner */}
        {phase === 'loading' && (
          <View style={styles.loadingWrap} pointerEvents="none">
            <ActivityIndicator size="large" color={C.accent} />
            <Text style={[T.kicker, { color: 'white', marginTop: 12 }]}>LOOKING UP INCI DATA…</Text>
          </View>
        )}

        {/* Product preview card */}
        {phase === 'preview' && product && (
          <Animated.View
            style={[styles.card, { transform: [{ translateY: cardSlide }] }]}
          >
            {/* Conflict warning */}
            {showWarning && (
              <View style={styles.warningBanner}>
                <TriangleAlert size={16} strokeWidth={1.2} color={C.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={[T.kicker, { color: C.danger, marginBottom: 3 }]}>BARRIER CONFLICT DETECTED</Text>
                  <Text style={[T.bodySm, { color: C.ink2, lineHeight: 16 }]}>
                    This product contains{' '}
                    <Text style={{ fontWeight: '600' }}>{harshActive}</Text>, which contradicts your
                    current Sensitive / Fatigued barrier status. Consider your Hyaluronic Acid as a
                    gentler alternative tonight.
                  </Text>
                </View>
              </View>
            )}

            {/* Product info */}
            <View style={styles.cardHead}>
              <View style={styles.productIcon}>
                <ShoppingBag size={24} strokeWidth={1.2} color={C.accentInk} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[T.body, { fontWeight: '600', fontSize: 15, color: C.ink }]}>{product.name}</Text>
                <Text style={[T.kicker, { color: C.ink3, marginTop: 3 }]}>{product.brand}</Text>
              </View>
            </View>

            {/* Top ingredients */}
            <Text style={[T.kicker, { marginBottom: 8 }]}>INCI INGREDIENTS</Text>
            <View style={styles.ingredientRow}>
              {product.ingredients.slice(0, 5).map(ing => (
                <View key={ing} style={[
                  styles.ingredientChip,
                  HARSH_ACTIVES.some(h => ing.includes(h)) && styles.ingredientChipWarn,
                ]}>
                  <Text style={[T.pill, {
                    color: HARSH_ACTIVES.some(h => ing.includes(h)) ? C.danger : C.ink2,
                    fontSize: 10,
                  }]}>
                    {ing}
                  </Text>
                </View>
              ))}
              {product.ingredients.length > 5 && (
                <Text style={[T.kicker, { color: C.ink3, fontSize: 9 }]}>
                  +{product.ingredients.length - 5} more
                </Text>
              )}
            </View>

            {/* CTA row */}
            <View style={styles.ctaRow}>
              <TouchableOpacity style={styles.rescanBtn} onPress={() => {
                setPhase('scanning');
                setProduct(null);
                scanLocked.current = false;
              }} activeOpacity={0.7}>
                <Text style={[T.button, { color: C.ink2, fontSize: 12 }]}>Rescan</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.85}>
                <Check size={16} strokeWidth={1.2} color={C.bg} />
                <Text style={[T.button, { color: C.bg, fontSize: 13 }]}>Add to Shelf</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const CORNER = 20;
const BORDER = 2;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0B08' },
  noCam: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, padding: 32 },
  allowBtn: { backgroundColor: C.ink, borderRadius: R.md, paddingVertical: 13, paddingHorizontal: 24, marginTop: 20 },
  vignette: {
    backgroundColor: 'transparent',
  },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: S.gutter,
    paddingBottom: 12,
  },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  viewfinderWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  viewfinder: { width: 260, height: 140, position: 'relative' },
  corner: {
    position: 'absolute', width: CORNER, height: CORNER,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  cornerTL: { top: 0, left: 0,  borderTopWidth: BORDER, borderLeftWidth: BORDER },
  cornerTR: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  cornerBL: { bottom: 0, left: 0,  borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },
  scanHint: {
    ...T.kicker, color: 'rgba(255,255,255,0.70)',
    marginTop: 18, letterSpacing: 1.5,
  },
  loadingWrap: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: C.bg,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  warningBanner: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#FBEEEA', borderRadius: R.md,
    borderWidth: 1, borderColor: 'rgba(178,63,44,0.26)',
    padding: 12, marginBottom: 14,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  productIcon: {
    width: 48, height: 48, borderRadius: R.md,
    backgroundColor: C.accentSoft,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  ingredientRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  ingredientChip: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: R.pill,
    backgroundColor: C.surface2,
    borderWidth: 1, borderColor: C.line,
  },
  ingredientChipWarn: {
    backgroundColor: '#FBEEEA',
    borderColor: 'rgba(178,63,44,0.30)',
  },
  ctaRow: { flexDirection: 'row', gap: 10 },
  rescanBtn: {
    flex: 1, borderWidth: 1, borderColor: C.line2,
    borderRadius: R.md, paddingVertical: 12, alignItems: 'center',
    backgroundColor: C.surface2,
  },
  addBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: C.ink, borderRadius: R.md, paddingVertical: 12,
  },
});
