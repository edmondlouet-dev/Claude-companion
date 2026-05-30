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

export interface QuestionnaireAnswers {
  goals: string[];
  concern: string[];
  skintype: string[];
  frequency: string[];
  age: string[];
  source: string[];
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
  prevScores: SkinScores | null;   // the scan before lastScores — drives deltas
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
  questionnaireAnswers: QuestionnaireAnswers;
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
  removeBarcodeProduct: (id: string) => void;
  logRoutineUsage: () => void;          // decrement shelf volumes on a completed routine
  completeDailyRitual: (ritualKey: string) => void;
  incrementSurfaceScan: () => void;
  recordStructuralScan: () => void;
  saveQuestionnaire: (answers: QuestionnaireAnswers) => void;
  openPremiumModal: () => void;
  dismissPremiumModal: () => void;
}

type FullStore = StoreState & StoreActions & StoreComputed;

const PITCH_KEY          = '@poreless_pitch_seen';
const QUESTIONNAIRE_KEY  = '@poreless_questionnaire_done';
const ANSWERS_KEY        = '@poreless_questionnaire_answers';

const EMPTY_ANSWERS: QuestionnaireAnswers = {
  goals: [], concern: [], skintype: [], frequency: [], age: [], source: [],
};

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
  prevScores: {
    overall: 75, hydration: 78, texture: 72,
    pores: 67, redness: 84, oil: 58, acne: 61, tone: 69,
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
  questionnaireAnswers: EMPTY_ANSWERS,
};

const StoreContext = createContext<FullStore>({} as FullStore);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(defaults);

  useEffect(() => {
    Promise.all([
      getSession(),
      AsyncStorage.getItem(QUESTIONNAIRE_KEY),
      AsyncStorage.getItem(PITCH_KEY),
      AsyncStorage.getItem(ANSWERS_KEY),
    ]).then(([user, qDone, pSeen, answersRaw]) => {
      let answers = EMPTY_ANSWERS;
      if (answersRaw) { try { answers = { ...EMPTY_ANSWERS, ...JSON.parse(answersRaw) }; } catch {} }
      setState(s => ({
        ...s,
        authed: !!user,
        user: user ?? null,
        questionnaireComplete: !!(user || qDone),
        pitchSeen: !!pSeen,
        questionnaireAnswers: answers,
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
    setState(s => ({ ...s, prevScores: s.lastScores, lastScores: scores, lastScan: new Date() }));

  const saveQuestionnaire = (answers: QuestionnaireAnswers) => {
    AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
    setState(s => ({ ...s, questionnaireAnswers: answers }));
  };

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

  const removeBarcodeProduct = (id: string) =>
    setState(s => ({ ...s, userShelf: s.userShelf.filter(p => p.id !== id) }));

  // Each completed routine draws down the shelf a little, like real daily use.
  const logRoutineUsage = () =>
    setState(s => ({
      ...s,
      userShelf: s.userShelf.map(p => ({
        ...p,
        remainingVolume: Math.max(0, p.remainingVolume - (2 + Math.floor(Math.random() * 4))),
      })),
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
      addBarcodeProduct, removeBarcodeProduct, logRoutineUsage, completeDailyRitual,
      incrementSurfaceScan, recordStructuralScan, saveQuestionnaire,
      openPremiumModal, dismissPremiumModal,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
