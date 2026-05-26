import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getSession, signOut as authSignOut } from './services/auth';
import type { UserProfile } from './services/auth';

type AppMode = 'normal' | 'lookmax';

export interface SkinScores {
  overall: number; hydration: number; texture: number;
  pores: number; redness: number; oil: number; acne: number; tone: number;
}

interface StoreState {
  authed: boolean;
  questionnaireComplete: boolean;
  user: UserProfile | null;
  owned: string[];
  streak: number;
  lastScan: Date | null;
  lastScores: SkinScores | null;
  mode: AppMode;
  activeRitual: string | null;   // currently selected cultural ritual
}

interface StoreActions {
  login: (user: UserProfile) => void;
  logout: () => void;
  completeQuestionnaire: () => void;
  addProduct: (name: string) => void;
  removeProduct: (name: string) => void;
  setMode: (mode: AppMode) => void;
  setLastScores: (scores: SkinScores) => void;
  setActiveRitual: (key: string | null) => void;
}

const defaults: StoreState = {
  authed: false,
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
};

const StoreContext = createContext<StoreState & StoreActions>({} as StoreState & StoreActions);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(defaults);

  // Restore session on mount
  useEffect(() => {
    getSession().then(user => {
      if (user) setState(s => ({ ...s, authed: true, questionnaireComplete: true, user }));
    });
  }, []);

  const login = (user: UserProfile) =>
    setState(s => ({ ...s, authed: true, user }));

  const logout = async () => {
    await authSignOut();
    setState(s => ({ ...s, authed: false, user: null, questionnaireComplete: false }));
  };

  const completeQuestionnaire = () =>
    setState(s => ({ ...s, questionnaireComplete: true }));

  const addProduct = (name: string) =>
    setState(s => ({ ...s, owned: s.owned.includes(name) ? s.owned : [...s.owned, name] }));

  const removeProduct = (name: string) =>
    setState(s => ({ ...s, owned: s.owned.filter(n => n !== name) }));

  const setMode = (mode: AppMode) => setState(s => ({ ...s, mode }));

  const setLastScores = (scores: SkinScores) =>
    setState(s => ({ ...s, lastScores: scores, lastScan: new Date() }));

  const setActiveRitual = (key: string | null) =>
    setState(s => ({ ...s, activeRitual: key }));

  return (
    <StoreContext.Provider value={{
      ...state,
      login, logout, completeQuestionnaire,
      addProduct, removeProduct, setMode,
      setLastScores, setActiveRitual,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
