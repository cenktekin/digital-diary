export interface CategoryData {
  category: string;
  activities: number;
}

export interface Highlight {
  activity: string;
  icon: 'code' | 'news' | 'shop' | 'learn' | 'entertainment' | 'social' | 'research' | 'other';
}

export type ScoreArea = 'Productivity' | 'Learning' | 'Discovery' | 'Entertainment';

export interface Score {
  area: ScoreArea;
  score: number; // out of 5
  feedback: string;
}

export interface DiaryEntry {
  date: string; // e.g., "July 25, 2024, Thursday"
  isoDate: string; // e.g., "2024-07-25"
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

export interface Persona {
  title: string;
  description: string;
  icon: 'Discovery' | 'Code' | 'Learn' | 'Social' | 'Entertainment' | 'Other';
}

export interface Trend {
    title: string;
    description: string;
}

export interface Recommendation {
    title: string;
    description: string;
}

export interface OverallAnalysis {
  persona: Persona;
  trends: Trend[];
  recommendations: Recommendation[];
}
