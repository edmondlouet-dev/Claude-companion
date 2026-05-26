import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
  Modal, FlatList, Image, ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FlutedGlass } from '../components/FlutedGlass';
import { Pill } from '../components/Pill';
import { useStore } from '../store';
import { CATALOG, registerProduct, type ProductCategory } from '../products';
import { searchProducts, type OBFProduct } from '../services/openbeauty';
import { C, R, T, S } from '../tokens';

const BackArrow = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M19 12H5M11 18l-6-6 6-6" stroke={C.ink} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const DropletIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path d="M12 3c-4 6-7 9-7 13a7 7 0 0 0 14 0c0-4-3-7-7-13z" stroke={C.ink3} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

interface ProductThumbProps { uri: string | null }
const ProductThumb: React.FC<ProductThumbProps> = ({ uri }) => {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={styles.thumbFallback}>
        <DropletIcon />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={styles.thumb}
      onError={() => setFailed(true)}
      resizeMode="contain"
    />
  );
};

interface Props {
  onBack: () => void;
}

export const Products: React.FC<Props> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { owned, addProduct, removeProduct } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<OBFProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.length < 2) { setResults([]); setSearched(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchProducts(text);
        setResults(data.filter(p => !owned.includes(p.name)));
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 420);
  }, [owned]);

  const handleAdd = (product: OBFProduct) => {
    registerProduct(product.name, product.category as ProductCategory);
    addProduct(product.name);
    setShowAdd(false);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const closeModal = () => {
    setShowAdd(false);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <View style={styles.root}>
      <Background />
      <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
        {/* Nav bar */}
        <View style={[styles.navBar, { paddingHorizontal: S.gutter }]}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <BackArrow />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[T.h2, { fontSize: 18, fontFamily: 'Inter_600SemiBold', letterSpacing: 0 }]}>
              My products
            </Text>
            <Text style={[T.kicker, { color: C.ink3, marginTop: 2 }]}>
              {owned.length} owned · routine auto-generates
            </Text>
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionH}>
            <Text style={T.kicker}>OWNED</Text>
            <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>{owned.length}</Text>
          </View>

          {owned.map(name => {
            const info = CATALOG[name];
            const toneLabel = info?.tone === 'both' ? 'AM/PM' : (info?.tone ?? 'AM/PM');
            return (
              <FlutedGlass key={name} padding={12} style={{ marginBottom: 8 }}>
                <View style={styles.productRow}>
                  <View style={styles.thumbFallback}>
                    <DropletIcon />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '600', fontSize: 13, color: C.ink }]} numberOfLines={1}>
                      {name}
                    </Text>
                    <View style={styles.pillRow}>
                      {info?.category && <Pill label={info.category} />}
                      <Pill label={toneLabel} />
                      {(info?.actives ?? []).slice(0, 2).map(a => (
                        <Pill key={a} label={a} variant="accent" />
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeProduct(name)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Text style={[T.body, { color: C.ink3, fontSize: 16 }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </FlutedGlass>
            );
          })}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.8}
          >
            <Text style={[T.button, { color: C.ink }]}>+ Add product</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Add product modal — live OBF search */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet" onRequestClose={closeModal}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={[T.h2, { fontSize: 18 }]}>Add product</Text>
            <TouchableOpacity onPress={closeModal} activeOpacity={0.7}>
              <Text style={[T.body, { color: C.ink3, fontSize: 18 }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search millions of products…"
              placeholderTextColor={C.ink3}
              value={query}
              onChangeText={handleSearch}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
            />
            {loading && <ActivityIndicator style={styles.searchSpinner} size="small" color={C.accent} />}
          </View>

          {!searched && !loading && (
            <View style={styles.emptyState}>
              <Text style={[T.kicker, { color: C.ink3, textAlign: 'center' }]}>
                SEARCH BY BRAND, NAME, OR INGREDIENT
              </Text>
              <Text style={[T.bodySm, { color: C.ink4, textAlign: 'center', marginTop: 6 }]}>
                Powered by Open Beauty Facts — millions of real products
              </Text>
            </View>
          )}

          {searched && results.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={[T.kicker, { color: C.ink3, textAlign: 'center' }]}>NO RESULTS</Text>
              <Text style={[T.bodySm, { color: C.ink4, textAlign: 'center', marginTop: 6 }]}>
                Try a different name or brand
              </Text>
            </View>
          )}

          <FlatList
            data={results}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.catalogRow}
                onPress={() => handleAdd(item)}
                activeOpacity={0.7}
              >
                <ProductThumb uri={item.imageUrl} />
                <View style={{ flex: 1 }}>
                  <Text style={[T.body, { fontWeight: '500', color: C.ink }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.brand ? (
                    <Text style={[T.bodySm, { color: C.ink3, marginTop: 1 }]} numberOfLines={1}>
                      {item.brand}
                    </Text>
                  ) : null}
                  <View style={styles.pillRow}>
                    <Pill label={item.category} />
                  </View>
                </View>
                <Text style={[T.button, { color: C.accent, flexShrink: 0, marginLeft: 8 }]}>+ Add</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.line }} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: S.gutter },
  sectionH: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: R.md,
    backgroundColor: C.surface2,
    flexShrink: 0,
  },
  thumbFallback: {
    width: 40,
    height: 40,
    borderRadius: R.md,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 5,
  },
  removeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtn: {
    borderWidth: 1,
    borderColor: C.line2,
    borderRadius: R.md,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: C.surface,
    marginTop: 4,
  },
  modal: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: S.gutter,
    marginBottom: 16,
  },
  searchWrap: {
    marginHorizontal: S.gutter,
    marginBottom: 12,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: C.surface2,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 36,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: C.ink,
  },
  searchSpinner: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  emptyState: {
    paddingTop: 48,
    paddingHorizontal: S.gutter,
    alignItems: 'center',
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.gutter,
    paddingVertical: 12,
    gap: 12,
  },
});
