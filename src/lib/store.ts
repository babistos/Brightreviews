import type { AppState, Account } from './types';
import { freshState, CURRENT_MONTH } from './data';

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function familyName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

export function makeAccount(name: string, email: string): { name: string; email: string } {
  return { name: name.trim(), email: normalizeEmail(email) };
}

async function hashCode(str: string): Promise<number> {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

const REG_ACCOUNTS_KEY = 'br_accounts_v1';
const SEED_FAMILIES_KEY = 'br_seed_families_v1';
const STATE_KEY = 'br_state_v1';
const STATE_KEY_PREFIX = 'br_state_';

function stateKeyFor(email: string): string {
  return `${STATE_KEY_PREFIX}${normalizeEmail(email)}`;
}

export interface RegisteredFamily {
  family: string;
  count: number;
}

export function loadRegisteredFamilies(): RegisteredFamily[] {
  try {
    const raw = localStorage.getItem(REG_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function registerFamily(family: string): RegisteredFamily[] {
  const fam = familyName(family);
  if (!fam) return loadRegisteredFamilies();
  const list = loadRegisteredFamilies();
  const existing = list.find((f) => f.family === fam);
  if (existing) existing.count += 1;
  else list.push({ family: fam, count: 1 });
  try {
    localStorage.setItem(REG_ACCOUNTS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {
    /* ignore */
  }
  return list;
}

export function topFamilies(n: number): RegisteredFamily[] {
  return [...loadRegisteredFamilies()].sort((a, b) => b.count - a.count).slice(0, n);
}

export function loadState(account: Account): AppState {
  // Try account-scoped key first, then legacy single key.
  const keys = [stateKeyFor(account.email), STATE_KEY];
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as AppState;
      if (parsed && (!parsed.account || normalizeEmail(parsed.account.email) === normalizeEmail(account.email))) {
        if (parsed.usage.month !== CURRENT_MONTH) {
          parsed.usage = { month: CURRENT_MONTH, repliesUsed: 0, draftsUsed: 0 };
        }
        return parsed;
      }
    } catch {
      /* corrupted or no state */
    }
  }
  return freshState(account);
}

export function saveState(state: AppState): void {
  try {
    const email = state.account?.email || 'default';
    localStorage.setItem(stateKeyFor(email), JSON.stringify(state));
    // also mirror to legacy key for backward compatibility
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or blocked */
  }
}

export { hashCode };
