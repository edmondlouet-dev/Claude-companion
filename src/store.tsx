import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSession, signOut as authSignOut } from './services/auth';
import type { UserProfile } from './services/auth';
import {
  DEFAULT_STRUCTURAL, DEFAULT_SHELF,
  type StructuralMetrics, type ShelfItem,
} from './skin';

type AppMode = 'normal' | 'lookmax';

export interface SkinScores {
  overall: number; hydration: number; texture: number;
  pores: number; redness: number; oil: number; acne: number; tone: number;
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
}

const PITCH_KEY         = '@poreless_pitch_seen';
const QUESTIONNAIRE_KEY = '@poreless_questionnaire_done';

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
};

const StoreContext = createContext<StoreState & StoreActions>({} as StoreState & StoreActions);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(defaults);

  // Restore session + persisted flags on mount
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
        // questionnaire: skip if they have a session OR if they already completed it once
        questionnaireComplete: !!(user || qDone),
        pitchSeen: !!pSeen,
      }));
    });
  }, []);

  const login = (user: UserProfile) =>
    setState(s => ({ ...s, authed: true, user }));

  const logout = async () => {
    await authSignOut();
    // Keep questionnaireComplete & pitchSeen — user shouldn't redo onboarding
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

  return (
    <StoreContext.Provider value={{
      ...state,
      login, logout, setPitchSeen, completeQuestionnaire,
      addProduct, removeProduct, setMode,
      setLastScores, setActiveRitual, setTemperatureUnit,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
