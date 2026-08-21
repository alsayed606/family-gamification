import { useCallback, useEffect, useMemo, useState } from "react";
import { AR_ONLY, countLetters } from "../../../lib/arabic";
import { STORAGE_KEYS, store } from "../lib/storage";
import { DEFAULT_WORDS } from "../data/words";
import type { Category, MatchRecord, Word } from "../types";

type BankOverrides = { added: Word[]; removed: string[] };

const EMPTY_OVERRIDES: BankOverrides = { added: [], removed: [] };
const MAX_HISTORY = 25;

/**
 * بنك الكلمات القابل للتعديل من لوحة المشرف: القاعدة الثابتة (data/words.ts)
 * + إضافات المستخدم − المحذوفات، مخزّنة محلياً (لا خادم في Phase 1).
 */
export function useWordBank() {
  const [added, setAdded] = useState<Word[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [offCategories, setOffCategories] = useState<Category[]>([]);
  const [history, setHistory] = useState<MatchRecord[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [overrides, hist, offCats] = await Promise.all([
        store.get<BankOverrides>(STORAGE_KEYS.bank, EMPTY_OVERRIDES),
        store.get<MatchRecord[]>(STORAGE_KEYS.history, []),
        store.get<Category[]>(STORAGE_KEYS.disabledCategories, []),
      ]);
      setAdded(overrides.added || []);
      setRemoved(overrides.removed || []);
      setHistory(Array.isArray(hist) ? hist : []);
      setOffCategories(Array.isArray(offCats) ? offCats : []);
      setReady(true);
    })();
  }, []);

  const persistBank = (nextAdded: Word[], nextRemoved: string[]) =>
    store.set(STORAGE_KEYS.bank, { added: nextAdded, removed: nextRemoved });

  /** القاعدة + الإضافات − المحذوفات، بلا تكرار (الأسبق يفوز). */
  const bank = useMemo(() => {
    const all = [...DEFAULT_WORDS, ...added];
    const gone = new Set(removed);
    const seen = new Set<string>();
    return all.filter((x) => {
      if (gone.has(x.w) || seen.has(x.w)) return false;
      seen.add(x.w);
      return true;
    });
  }, [added, removed]);

  const playable = useMemo(
    () => bank.filter((x) => !offCategories.includes(x.c)),
    [bank, offCategories]
  );

  const catCounts = useMemo(() => {
    const m: Partial<Record<Category, number>> = {};
    bank.forEach((x) => {
      m[x.c] = (m[x.c] || 0) + 1;
    });
    return m as Record<Category, number>;
  }, [bank]);

  const toggleCategory = useCallback(
    (c: Category) => {
      setOffCategories((prev) => {
        const next = prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c];
        store.set(STORAGE_KEYS.disabledCategories, next);
        return next;
      });
    },
    []
  );

  const addWord = useCallback(
    (word: string, cat: Category): string | null => {
      const w = word.trim();
      if (!AR_ONLY.test(w)) return "تُقبل الحروف العربية فقط.";
      if (countLetters(w) < 6) return "الكلمة يجب ألا تقل عن 6 أحرف.";
      if (bank.some((x) => x.w === w)) return "الكلمة موجودة في البنك.";
      const nextAdded = [...added, { w, c: cat }];
      const nextRemoved = removed.filter((r) => r !== w);
      setAdded(nextAdded);
      setRemoved(nextRemoved);
      persistBank(nextAdded, nextRemoved);
      return null;
    },
    [bank, added, removed]
  );

  const deleteWord = useCallback(
    (w: string) => {
      const nextAdded = added.filter((x) => x.w !== w);
      const nextRemoved = removed.includes(w) ? removed : [...removed, w];
      setAdded(nextAdded);
      setRemoved(nextRemoved);
      persistBank(nextAdded, nextRemoved);
    },
    [added, removed]
  );

  const recordMatch = useCallback((record: MatchRecord) => {
    setHistory((h) => {
      const next = [record, ...h].slice(0, MAX_HISTORY);
      store.set(STORAGE_KEYS.history, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    store.set(STORAGE_KEYS.history, []);
  }, []);

  return {
    ready,
    bank,
    playable,
    catCounts,
    offCategories,
    toggleCategory,
    addWord,
    deleteWord,
    history,
    recordMatch,
    clearHistory,
  };
}
