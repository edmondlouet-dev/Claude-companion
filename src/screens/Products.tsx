import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, FlatList,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Background } from '../components/Background';
import { FlutedGlass } from '../components/FlutedGlass';
import { Pill } from '../components/Pill';
import { useStore } from '../store';
import { CATALOG } from '../products';
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

interface Props {
  onBack: () => void;
}

export const Products: React.FC<Props> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const { owned, addProduct, removeProduct } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const catalogNames = Object.keys(CATALOG);
  const filtered = catalogNames.filter(
    n => n.toLowerCase().includes(search.toLowerCase()) && !owned.includes(n)
  );

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
          {/* Section header */}
          <View style={styles.sectionH}>
            <Text style={T.kicker}>OWNED</Text>
            <Text style={[T.num, { fontSize: 10, color: C.ink3 }]}>{owned.length}</Text>
          </View>

          {/* Product list */}
          {owned.map(name => {
            const info = CATALOG[name];
            if (!info) return null;
            const toneLabel = info.tone === 'both' ? 'AM/PM' : info.tone;
            return (
              <FlutedGlass key={name} padding={12} style={{ marginBottom: 8 }}>
                <View style={styles.productRow}>
                  <View style={styles.iconWrap}>
                    <DropletIcon />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '600', fontSize: 13, color: C.ink }]} numberOfLines={1}>
                      {name}
                    </Text>
                    <View style={styles.pillRow}>
                      <Pill label={info.category} />
                      <Pill label={toneLabel} />
                      {info.actives.slice(0, 2).map(a => (
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

          {/* Add product button */}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowAdd(true)}
            activeOpacity={0.8}
          >
            <Text style={[T.button, { color: C.ink }]}>+ Add product</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Add product modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setShowAdd(false)}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={[T.h2, { fontSize: 18 }]}>Add product</Text>
            <TouchableOpacity onPress={() => { setShowAdd(false); setSearch(''); }} activeOpacity={0.7}>
              <Text style={[T.body, { color: C.ink3, fontSize: 18 }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products…"
            placeholderTextColor={C.ink3}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const info = CATALOG[item];
              return (
                <TouchableOpacity
                  style={styles.catalogRow}
                  onPress={() => { addProduct(item); setShowAdd(false); setSearch(''); }}
                  activeOpacity={0.7}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[T.body, { fontWeight: '500', color: C.ink }]} numberOfLines={1}>{item}</Text>
                    <View style={styles.pillRow}>
                      <Pill label={info?.category ?? ''} />
                      {info?.actives.slice(0, 2).map(a => <Pill key={a} label={a} variant="accent" />)}
                    </View>
                  </View>
                  <Text style={[T.button, { color: C.accent }]}>+ Add</Text>
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.line }} />}
            contentContainerStyle={{ paddingBottom: 40 }}
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
  iconWrap: {
    width: 32,
    height: 32,
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
  searchInput: {
    marginHorizontal: S.gutter,
    marginBottom: 12,
    backgroundColor: C.surface2,
    borderRadius: R.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: C.ink,
  },
  catalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.gutter,
    paddingVertical: 12,
    gap: 10,
  },
});
