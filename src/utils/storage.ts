import { SharedAppState } from '../types';
import { initialDemoState } from '../services/mockData';

const STORAGE_KEY = 'lasa_shared_app_state_v1';

export function loadAppState(): SharedAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...initialDemoState,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Failed to load state from localStorage, using initial mock state.', err);
  }
  return initialDemoState;
}

export function saveAppState(state: SharedAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function clearAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear state:', err);
  }
}
