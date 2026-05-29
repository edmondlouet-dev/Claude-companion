import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession, signOut as authSignOut } from './services/auth';
import type { UserProfile } from './services/auth';
import {
  DEFAULT_STRUCTURAL, DEFAULT_SHELF,
  type StructuralMetrics, type ShelfItem,
} from './skin';

type AppMode = 'normal' | 'lookmax';

// ── Extended shelf product (barcode-scanned, full INCI data) ──────────────────
export interface ShelfProduct {
  id: string;
  name: string;
  brand: string;
  ingredients: string[];
  remainingVolume: number;  // 0–100
  purchaseUrl: string;
  barcode?: string;
  category?: string;
}

export interface SkinScores {
  overall: number; hydration: number; texture: number;
  pores: number; redness: number; oil: number; acne: number; tone: number;
}

interface UsageCounters {
  surfaceScansToday: number;
  structuralScansThisWeek: number;
  lastScanTimestamp: string | null;
  lastStructuralScanDate: string | null;
}

interface StoreState {
  authed: boolean;
  pitchSeen: boolean;
  questionnaireComplete: boolean;
  user: UserProfile | null;
  owned: string[];
  streak: number;
  lastScan: Date | null;
  lastScores: SkinScores | null;
  mode: AppMode;
  activeRitual: string | null;
  temperatureUnit: 'C' | 'F';
  structural: StructuralMetrics;
  shelf: ShelfItem[];
  // ── New global state ──────────────────────────────────────────────────────
  passiveTrackingEnabled: boolean;
  usageCounters: UsageCounters;
  userShelf: ShelfProduct[];
  ritualStreaks: Record<string, number>;
  showPremiumModal: boolean;
}

interface StoreComputed {
  userProfile: { isPremium: boolean; streakCount: number; passiveTrackingEnabled: boolean };
  faceMetrics: StructuralMetrics;
  selectedTraditionId: string | null;
}

interface StoreActions {
  login: (user: UserProfile) => void;
  logout: () => void;
  setPitchSeen: () => void;
  completeQuestionnaire: () => void;
  addProduct: (name: string) => void;
  removeProduct: (name: string) => void;
  setMode: (mode: AppMode) => void;
  setLastScores: (scores: SkinScores) => void;
  setActiveRitual: (key: string | null) => void;
  setTemperatureUnit: (unit: 'C' | 'F') => void;
  // ── Spec handlers ──────────────────────────────────────────────────────────
  updateMetrics: (metrics: Partial<StructuralMetrics>) => void;
  togglePassiveTracking: () => void;
  setPremiumStatus: (isPremium: boolean) => void;
  addBarcodeProduct: (product: ShelfProduct) => void;
  completeDailyRitual: (ritualKey: string) => void;
  incrementSurfaceScan: () => void;
  recordStructuralScan: () => void;
  openPremiumModal: () => void;
  dismissPremiumModal: () => void;
}

type FullStore = StoreState & StoreActions & StoreComputed;

const PITCH_KEY         = '@poreless_pitch_seen';
const QUESTIONNAIRE_KEY = '@poreless_questionnaire_done';

const DEFAULT_USER_SHELF: ShelfProduct[] = [
  {
    id: 'vitc',
    name: 'Vitamin C Serum',
    brand: 'The Ordinary',
    ingredients: ['ascorbic acid', 'propanediol', 'glycerin', 'hyaluronic acid'],
    remainingVolume: 65,
    purchaseUrl: 'https://www.amazon.co.uk/s?k=the+ordinary+vitamin+c&tag=poreless-20',
    category: 'antiox',
  },
  {
    id: 'retinol',
    name: 'Retinol 0.5%',
    brand: 'The Ordinary',
    ingredients: ['retinol', 'squalane', 'tocopherol', 'bisabolol'],
    remainingVolume: 18,
    purchaseUrl: 'https://www.amazon.co.uk/s?k=the+ordinary+retinol+0.5&tag=poreless-20',
    category: 'retinoid',
  },
  {
    id: 'ha',
    name: 'Hyaluronic Acid 2% + B5',
    brand: 'The Ordinary',
    ingredients: ['hyaluronic acid', 'sodium hyaluronate', 'pentylene glycol', 'water', 'panthenol'],
    remainingVolume: 80,
    purchaseUrl: 'https://www.amazon.co.uk/s?k=the+ordinary+hyaluronic+acid&tag=poreless-20',
    category: 'serum',
  },
];

const defaults: StoreState = {
  authed: false,
  pitchSeen: false,
  questionnaireComplete: false,
  user: null,
  owned: [
    'CeraVe Hydrating Cleanser',
    'The Ordinary Niacinamide 10%',
    'EltaMD UV Clear SPF 46',
    'La Roche-Posay Toleriane',
    'Differin (Adapalene 0.1%)',
  ],
  streak: 14,
  lastScan: new Date(Date.now() - 18 * 60 * 60 * 1000),
  lastScores: {
    overall: 78, hydration: 82, texture: 74,
    pores: 69, redness: 88, oil: 55, acne: 64, tone: 71,
  },
  mode: 'normal',
  activeRitual: null,
  temperatureUnit: 'C',
  structural: DEFAULT_STRUCTURAL,
  shelf: DEFAULT_SHELF,
  passiveTrackingEnabled: true,
  usageCounters: {
    surfaceScansToday: 0,
    structuralScansThisWeek: 0,
    lastScanTimestamp: null,
    lastStructuralScanDate: null,
  },
  userShelf: DEFAULT_USER_SHELF,
  ritualStreaks: {},
  showPremiumModal: false,
};

const StoreContext = createContext<FullStore>({} as FullStore);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(defaults);

  useEffect(() => {
    Promise.all([
      getSession(),
      AsyncStorage.getItem(QUESTIONNAIRE_KEY),
      AsyncStorage.getItem(PITCH_KEY),
    ]).then(([user, qDone, pSeen]) => {
      setState(s => ({
        ...s,
        authed: !!user,
        user: user ?? null,
        questionnaireComplete: !!(user || qDone),
        pitchSeen: !!pSeen,
      }));
    });
  }, []);

  const login = (user: UserProfile) =>
    setState(s => ({ ...s, authed: true, user }));

  const logout = async () => {
    await authSignOut();
    setState(s => ({ ...s, authed: false, user: null }));
  };

  const setPitchSeen = () => {
    AsyncStorage.setItem(PITCH_KEY, '1');
    setState(s => ({ ...s, pitchSeen: true }));
  };

  const completeQuestionnaire = () => {
    AsyncStorage.setItem(QUESTIONNAIRE_KEY, '1');
    setState(s => ({ ...s, questionnaireComplete: true }));
  };

  const addProduct = (name: string) =>
    setState(s => ({ ...s, owned: s.owned.includes(name) ? s.owned : [...s.owned, name] }));

  const removeProduct = (name: string) =>
    setState(s => ({ ...s, owned: s.owned.filter(n => n !== name) }));

  const setMode = (mode: AppMode) => setState(s => ({ ...s, mode }));

  const setLastScores = (scores: SkinScores) =>
    setState(s => ({ ...s, lastScores: scores, lastScan: new Date() }));

  const setActiveRitual = (key: string | null) =>
    setState(s => ({ ...s, activeRitual: key }));

  const setTemperatureUnit = (unit: 'C' | 'F') =>
    setState(s => ({ ...s, temperatureUnit: unit }));

  const updateMetrics = (metrics: Partial<StructuralMetrics>) =>
    setState(s => ({ ...s, structural: { ...s.structural, ...metrics } }));

  const togglePassiveTracking = () =>
    setState(s => ({ ...s, passiveTrackingEnabled: !s.passiveTrackingEnabled }));

  const setPremiumStatus = (isPremium: boolean) =>
    setState(s => ({ ...s, user: s.user ? { ...s.user, premium: isPremium } : s.user }));

  const addBarcodeProduct = (product: ShelfProduct) =>
    setState(s => ({
      ...s,
      userShelf: s.userShelf.some(p => p.id === product.id || (p.barcode && p.barcode === product.barcode))
        ? s.userShelf
        : [...s.userShelf, product],
    }));

  const completeDailyRitual = (ritualKey: string) =>
    setState(s => ({
      ...s,
      ritualStreaks: { ...s.ritualStreaks, [ritualKey]: (s.ritualStreaks[ritualKey] ?? 0) + 1 },
    }));

  const incrementSurfaceScan = () =>
    setState(s => ({
      ...s,
      usageCounters: {
        ...s.usageCounters,
        surfaceScansToday: s.usageCounters.surfaceScansToday + 1,
        lastScanTimestamp: new Date().toISOString(),
      },
    }));

  const recordStructuralScan = () =>
    setState(s => ({
      ...s,
      usageCounters: {
        ...s.usageCounters,
        structuralScansThisWeek: s.usageCounters.structuralScansThisWeek + 1,
        lastStructuralScanDate: new Date().toISOString(),
      },
    }));

  const openPremiumModal    = () => setState(s => ({ ...s, showPremiumModal: true }));
  const dismissPremiumModal = () => setState(s => ({ ...s, showPremiumModal: false }));

  const isPremium = state.user?.premium ?? false;

  return (
    <StoreContext.Provider value={{
      ...state,
      userProfile: { isPremium, streakCount: state.streak, passiveTrackingEnabled: state.passiveTrackingEnabled },
      faceMetrics: state.structural,
      selectedTraditionId: state.activeRitual,
      login, logout, setPitchSeen, completeQuestionnaire,
      addProduct, removeProduct, setMode,
      setLastScores, setActiveRitual, setTemperatureUnit,
      updateMetrics, togglePassiveTracking, setPremiumStatus,
      addBarcodeProduct, completeDailyRitual,
      incrementSurfaceScan, recordStructuralScan,
      openPremiumModal, dismissPremiumModal,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
