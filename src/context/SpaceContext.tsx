import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Scope } from '@/types';

const STORAGE_KEY = 'nido_active_context';

type SpaceContextValue = {
  activeContext: Scope;
  setActiveContext: (ctx: Scope) => void;
};

const SpaceContext = createContext<SpaceContextValue>({
  activeContext: 'hogar',
  setActiveContext: () => {},
});

export function SpaceProvider({ children }: { children: React.ReactNode }) {
  const [activeContext, setActiveContextState] = useState<Scope>('hogar');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val === 'personal') setActiveContextState('personal');
    });
  }, []);

  const setActiveContext = (ctx: Scope) => {
    setActiveContextState(ctx);
    AsyncStorage.setItem(STORAGE_KEY, ctx);
  };

  return (
    <SpaceContext.Provider value={{ activeContext, setActiveContext }}>
      {children}
    </SpaceContext.Provider>
  );
}

export function useSpace() {
  return useContext(SpaceContext);
}
