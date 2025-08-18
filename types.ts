
export interface CategoryData {
  category: string;
  activities: number;
}

export interface Highlight {
  activity: string;
  icon: 'code' | 'news' | 'shop' | 'learn' | 'entertainment' | 'social' | 'research' | 'other';
}

export interface Score {
  area: 'Üretkenlik' | 'Öğrenme' | 'Keşif' | 'Eğlence';
  score: number; // out of 5
  feedback: string;
}

export interface DiaryEntry {
  date: string; // e.g., "25 Temmuz 2024, Perşembe"
  title: string;
  summary: {
    sabah: string;
    oglen: string;
    aksam: string;
  };
  highlights: Highlight[];
  categories: CategoryData[];
  scores: Score[];
}
