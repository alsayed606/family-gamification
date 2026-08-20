// طبقة تخزين قابلة للتبديل. النسخة الحالية تحفظ في localStorage (بلا خادم).
// عند بناء Phase 2 (Node/Express/Supabase) تُستبدل بـ StorageAdapter آخر يتحدث
// مع API دون تغيير أي كود في الشاشات أو الـ hooks.

export interface StorageAdapter {
  get<T>(key: string, fallback: T): Promise<T>;
  set<T>(key: string, value: T): Promise<boolean>;
}

class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}

export const store: StorageAdapter = new LocalStorageAdapter();

export const STORAGE_KEYS = {
  bank: "awc:bank-overrides",
  history: "awc:history",
  settings: "awc:settings",
  disabledCategories: "awc:disabled-cats",
} as const;
