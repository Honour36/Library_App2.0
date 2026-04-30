import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export interface ReadingList {
  id: string;
  name: string;
  count: number;
}

export interface ReadingProgressEntry {
  documentId: string;
  title: string;
  pdfUrl: string;
  progress: number;
  minutesSpent: number;
  lastOpenedAt: string;
}

interface StudentProfileState {
  username: string;
  faculty: string | null;
  program: string | null;
  yearOfStudy: string | null;
  aspiration: string | null;
  onboardingComplete: boolean;
  pinnedBooks: string[];
  readingLists: ReadingList[];
  readingScore: number;
  booksRead: number;
  hoursRead: number;
  searchHistory: string[];
  documentViews: Record<string, number>;
  readingProgress: Record<string, ReadingProgressEntry>;
  darkMode: boolean;
  setDraftProfile: (payload: Partial<Omit<StudentProfileState, 'setDraftProfile' | 'completeOnboarding' | 'togglePinnedBook' | 'trackSearchTerm' | 'registerDocumentView' | 'recordReadingSession' | 'hydrate' | 'resetStudentProfile' | 'setDarkMode'>>) => Promise<void>;
  completeOnboarding: (payload: { faculty: string; program: string; yearOfStudy: string; aspiration: string }) => Promise<void>;
  togglePinnedBook: (bookId: string) => Promise<void>;
  trackSearchTerm: (term: string) => Promise<void>;
  registerDocumentView: (documentId: string) => Promise<void>;
  recordReadingSession: (payload: { documentId: string; title: string; pdfUrl: string; durationSeconds: number }) => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
  resetStudentProfile: () => Promise<void>;
}

const STORAGE_KEY = 'student_profile_state';

type PersistedStudentState = {
  username: string;
  faculty: string | null;
  program: string | null;
  yearOfStudy: string | null;
  aspiration: string | null;
  onboardingComplete: boolean;
  pinnedBooks: string[];
  readingLists: ReadingList[];
  readingScore: number;
  booksRead: number;
  hoursRead: number;
  searchHistory: string[];
  documentViews: Record<string, number>;
  readingProgress: Record<string, ReadingProgressEntry>;
  darkMode: boolean;
};

const defaultState: PersistedStudentState = {
  username: '',
  faculty: null,
  program: null,
  yearOfStudy: null,
  aspiration: null,
  onboardingComplete: false,
  pinnedBooks: [],
  readingLists: [
    { id: 'semester-2', name: 'Semester 2 Reads', count: 5 },
    { id: 'research', name: 'Research Materials', count: 3 },
  ],
  readingScore: 0,
  booksRead: 0,
  hoursRead: 0,
  searchHistory: [],
  documentViews: {},
  readingProgress: {},
  darkMode: false,
};

const normalizePersistedState = (value?: Partial<PersistedStudentState> | null): PersistedStudentState => ({
  ...defaultState,
  ...(value || {}),
  pinnedBooks: Array.isArray(value?.pinnedBooks) ? value!.pinnedBooks : defaultState.pinnedBooks,
  readingLists: Array.isArray(value?.readingLists) ? value!.readingLists : defaultState.readingLists,
  searchHistory: Array.isArray(value?.searchHistory) ? value!.searchHistory : defaultState.searchHistory,
  documentViews:
    value?.documentViews && typeof value.documentViews === 'object' ? value.documentViews : defaultState.documentViews,
  readingProgress:
    value?.readingProgress && typeof value.readingProgress === 'object' ? value.readingProgress : defaultState.readingProgress,
});

const withDerivedStats = (state: PersistedStudentState): PersistedStudentState => {
  const normalized = normalizePersistedState(state);
  const progressEntries = Object.values(normalized.readingProgress);
  const totalMinutes = progressEntries.reduce((sum, entry) => sum + entry.minutesSpent, 0);
  const completedBooks = progressEntries.filter((entry) => entry.progress >= 100).length;

  return {
    ...normalized,
    readingScore: totalMinutes > 0 ? completedBooks * 100 + totalMinutes * 5 : 0,
    booksRead: completedBooks,
    hoursRead: Number((totalMinutes / 60).toFixed(1)),
  };
};

const persist = async (payload: Partial<PersistedStudentState>) => {
  const current = await SecureStore.getItemAsync(STORAGE_KEY);
  const parsed = current ? normalizePersistedState(JSON.parse(current)) : defaultState;
  const next = withDerivedStats({ ...parsed, ...payload });
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  return next;
};

export const useStudentStore = create<StudentProfileState>((set, get) => ({
  ...defaultState,
  setDraftProfile: async (payload) => {
    const next = await persist(payload);
    set(next);
  },
  completeOnboarding: async (payload) => {
    const next = await persist({ ...payload, onboardingComplete: true });
    set(next);
  },
  togglePinnedBook: async (bookId) => {
    const exists = get().pinnedBooks.includes(bookId);
    const pinnedBooks = exists ? get().pinnedBooks.filter((id) => id !== bookId) : [bookId, ...get().pinnedBooks];
    const next = await persist({ pinnedBooks });
    set(next);
  },
  trackSearchTerm: async (term) => {
    const normalized = term.trim();
    if (!normalized) return;

    const searchHistory = [
      normalized,
      ...get().searchHistory.filter((item) => item.toLowerCase() !== normalized.toLowerCase()),
    ].slice(0, 8);

    const next = await persist({ searchHistory });
    set(next);
  },
  registerDocumentView: async (documentId) => {
    const documentViews = {
      ...get().documentViews,
      [documentId]: (get().documentViews[documentId] || 0) + 1,
    };

    const next = await persist({ documentViews });
    set(next);
  },
  recordReadingSession: async ({ documentId, title, pdfUrl, durationSeconds }) => {
    const minutesSpent = Math.max(1, Math.round(durationSeconds / 60));
    const current = get().readingProgress[documentId];
    const readingProgress = {
      ...get().readingProgress,
      [documentId]: {
        documentId,
        title,
        pdfUrl,
        progress: Math.min(100, (current?.progress || 0) + Math.max(8, Math.round(durationSeconds / 25))),
        minutesSpent: (current?.minutesSpent || 0) + minutesSpent,
        lastOpenedAt: new Date().toISOString(),
      },
    };

    const next = await persist({ readingProgress });
    set(next);
  },
  setDarkMode: async (value) => {
    const next = await persist({ darkMode: value });
    set(next);
  },
  hydrate: async () => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (raw) {
      set(withDerivedStats(normalizePersistedState(JSON.parse(raw))));
    }
  },
  resetStudentProfile: async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    set(defaultState);
  },
}));
