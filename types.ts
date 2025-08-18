
export interface CategoryData {
  category: string;
  activities: number;
}

export interface DiaryEntry {
  title: string;
  summary: string;
  categories: CategoryData[];
}
