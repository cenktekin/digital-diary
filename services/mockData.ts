import { DiaryEntry, ScoreArea } from '../types';

const randomElement = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number): number => Math.random() * (max - min) + min;

const scoreAreas: ScoreArea[] = ['Productivity', 'Learning', 'Discovery', 'Entertainment'];
const highlightIcons = ['code', 'news', 'shop', 'learn', 'entertainment', 'social', 'research', 'other'] as const;
const categories = ['Yazılım Geliştirme', 'Haberler', 'Sosyal Medya', 'Eğitim', 'Alışveriş', 'Araştırma', 'Teknoloji Blogları'];

const generateRandomScores = (): DiaryEntry['scores'] => {
    return scoreAreas.map(area => ({
        area,
        score: parseFloat(randomNumber(1.5, 4.9).toFixed(1)),
        feedback: 'Bu, demo verisinden otomatik oluşturulmuş bir geri bildirimdir.'
    }));
};

const generateRandomHighlights = (): DiaryEntry['highlights'] => {
    const count = Math.floor(randomNumber(3, 5));
    return Array.from({ length: count }, () => ({
        activity: `Örnek aktivite #${Math.floor(randomNumber(1, 100))}`,
        icon: randomElement(highlightIcons)
    }));
};

const generateRandomCategories = (): DiaryEntry['categories'] => {
    const count = Math.floor(randomNumber(4, categories.length));
    const shuffled = categories.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(category => ({
        category,
        activities: Math.floor(randomNumber(2, 15))
    }));
};

export const generateMockEntries = (lang: 'tr' | 'en'): DiaryEntry[] => {
    const entries: DiaryEntry[] = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) { // Generate data for the last 60 days
        if (Math.random() > 0.4) { // ~60% chance of an entry for a given day
            const date = new Date();
            date.setDate(today.getDate() - i);

            const isoDate = date.toISOString().split('T')[0];

            const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
            const formattedDate = date.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });

            entries.push({
                date: formattedDate,
                isoDate: isoDate,
                title: lang === 'tr' ? `Demo Günü: ${date.toLocaleDateString()}` : `Demo Day: ${date.toLocaleDateString()}`,
                summary: {
                    sabah: lang === 'tr' ? 'Demo verisi için sabah özeti.' : 'Morning summary for demo data.',
                    oglen: lang === 'tr' ? 'Demo verisi için öğlen özeti.' : 'Afternoon summary for demo data.',
                    aksam: lang === 'tr' ? 'Demo verisi için akşam özeti.' : 'Evening summary for demo data.'
                },
                scores: generateRandomScores(),
                highlights: generateRandomHighlights(),
                categories: generateRandomCategories()
            });
        }
    }
    return entries;
};