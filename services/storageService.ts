import { DiaryEntry } from '../types';

const ENTRIES_KEY = 'diaryEntries';
const USER_KEY = 'diaryUser';
const THEME_KEY = 'appTheme';
const LANG_KEY = 'appLang';

interface User {
  name: string;
  email: string;
  avatar: string;
}

// User Management
export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const clearUser = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ENTRIES_KEY); 
};


// Entry Management
export const getEntries = (): DiaryEntry[] => {
  const entries = localStorage.getItem(ENTRIES_KEY);
  return entries ? JSON.parse(entries) : [];
};

export const saveEntry = (newEntry: DiaryEntry): void => {
  const entries = getEntries();
  // Avoid duplicates by checking the date
  const entryExists = entries.some(entry => new Date(entry.date).toDateString() === new Date(newEntry.date).toDateString());
  if (!entryExists) {
    const updatedEntries = [...entries, newEntry];
    // Sort entries by date for consistency
    updatedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(updatedEntries));
  }
};

export const saveEntries = (newEntries: DiaryEntry[]): void => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(newEntries));
}

// Settings Management
export const getTheme = (): 'light' | 'dark' => {
    const theme = localStorage.getItem(THEME_KEY);
    return theme === 'light' || theme === 'dark' ? theme : 'dark';
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
    localStorage.setItem(THEME_KEY, theme);
};

export const getLanguage = (): 'tr' | 'en' => {
    const lang = localStorage.getItem(LANG_KEY);
    return lang === 'tr' || lang === 'en' ? lang : 'tr';
};

export const saveLanguage = (lang: 'tr' | 'en'): void => {
    localStorage.setItem(LANG_KEY, lang);
};