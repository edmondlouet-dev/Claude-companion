import React, { createContext, useContext, useState, ReactNode } from 'react';

type AppMode = 'normal' | 'lookmax';

interface StoreState {
  authed: boolean;
  onboarded: boolean;
  owned: string[];
  streak: number;
  lastScan: Date | null;
  mode: AppMode;
}

interface StoreActions {
  login: () => void;
  logout: () => void;
  finishOnboarding: () => void;
  addProduct: (name: string) => void;
  removeProduct: (name: string) => void;
  setMode: (mode: AppMode) => void;
}

const defaults: StoreState = {
  authed: false,
  onboarded: false,
  owned: [
    'CeraVe Hydrating Cleanser',
    'The Ordinary Niacinamide 10%',
    'EltaMD UV Clear SPF 46',
    'La Roche-Posay Toleriane',
    'Differin (Adapalene 0.1%)',
  ],
  streak: 14,
  lastScan: new Date(Date.now() - 18 * 60 * 60 * 1000),
  mode: 'normal',
};

const StoreContext = createContext<StoreState & StoreActions>(
  {} as StoreState & StoreActions
);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<StoreState>(defaults);

  const login = () => setState(s => ({ ...s, authed: true }));
  const logout = () => setState(s => ({ ...s, authed: false, onboarded: false }));
  const finishOnboarding = () => setState(s => ({ ...s, onboarded: true }));
  const addProduct = (name: string) =>
    setState(s => ({ ...s, owned: s.owned.includes(name) ? s.owned : [...s.owned, name] }));
  const removeProduct = (name: string) =>
    setState(s => ({ ...s, owned: s.owned.filter(n => n !== name) }));
  const setMode = (mode: AppMode) => setState(s => ({ ...s, mode }));

  return (
    <StoreContext.Provider value={{ ...state, login, logout, finishOnboarding, addProduct, removeProduct, setMode }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
