import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AppState, Account } from '../lib/types';
import { loadState, saveState } from '../lib/store';

interface AppCtx {
  state: AppState | null;
  account: Account | null;
  setDetail: (email: string) => void;
  setDemo: (email?: string) => void;
  logout: () => void;
  setState: (fn: (s: AppState) => AppState) => void;
  reload: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

const ACCOUNT_KEY = 'br_current_account';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Account | null>(() => {
    try {
      const raw = localStorage.getItem(ACCOUNT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [state, setStateRaw] = useState<AppState | null>(() => {
    if (account) return loadState(account);
    return null;
  });

  const setDetail = useCallback((email: string) => {
    const acct: Account = { name: 'User', email };
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acct));
    } catch { /* ignore */ }
    setAccount(acct);
    setStateRaw(loadState({ name: 'User', email }));
  }, []);

  const setDemo = useCallback((email?: string) => {
    const acct: Account = { name: 'Demo Owner', email: email || 'demo@brightreviews.app', demo: true };
    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(acct));
    } catch { /* ignore */ }
    setAccount(acct);
    const s = loadState(acct);
    // Demo preview: skip onboarding, mark as pro, and pre-fill an AI key if absent
    const demo = {
      ...s,
      onboarded: true,
      plan: 'pro' as const,
      profile: {
        ...s.profile,
        businessName: s.profile.businessName === 'BrightReviews' ? 'A2 Plumbing & Heating' : s.profile.businessName,
        city: 'Austin, TX',
        niche: 'plumbing & HVAC',
      },
    };
    saveState(demo);
    setStateRaw(demo);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(ACCOUNT_KEY);
    } catch { /* ignore */ }
    setAccount(null);
    setStateRaw(null);
  }, []);

  const setState = useCallback((fn: (s: AppState) => AppState) => {
    setStateRaw((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveState(next);
      return next;
    });
  }, []);

  const reload = useCallback(() => {
    if (account) setStateRaw(loadState(account));
  }, [account]);

  useEffect(() => {
    if (account) {
      setStateRaw(loadState(account));
    } else {
      setStateRaw(null);
    }
  }, [account]);

  return <Ctx.Provider value={{ state, account, setDetail, setDemo, logout, setState, reload }}>{children}</Ctx.Provider>;
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
