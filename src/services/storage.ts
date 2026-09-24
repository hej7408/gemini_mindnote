import { DiaryEntry, GASConfig } from '../types/diary';
import { SAMPLE_DIARIES } from '../data/emotions';

const STORAGE_KEY_DIARIES = 'edutech_mind_diaries_v1';
const STORAGE_KEY_CONFIG = 'edutech_mind_gas_config_v1';

export function loadStoredDiaries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DIARIES);
    if (!raw) {
      // Seed with initial sample diaries
      localStorage.setItem(STORAGE_KEY_DIARIES, JSON.stringify(SAMPLE_DIARIES));
      return SAMPLE_DIARIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_DIARIES;
  } catch (error) {
    console.error('Error reading diaries from localStorage:', error);
    return SAMPLE_DIARIES;
  }
}

export function saveStoredDiaries(diaries: DiaryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_DIARIES, JSON.stringify(diaries));
  } catch (error) {
    console.error('Error writing diaries to localStorage:', error);
  }
}

export function loadGASConfig(): GASConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      return {
        webAppUrl: '',
        sheetName: '마음일기',
        autoSync: true,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      webAppUrl: '',
      sheetName: '마음일기',
      autoSync: true,
    };
  }
}

export function saveGASConfig(config: GASConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving GAS config:', error);
  }
}
