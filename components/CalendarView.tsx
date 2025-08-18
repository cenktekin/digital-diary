import React, { useState, useMemo } from 'react';
import { DiaryEntry } from '../types';

interface CalendarViewProps {
  savedEntries: DiaryEntry[];
  t: (key: string) => string;
  lang: 'tr' | 'en';
}

type CalendarMode = 'month' | 'year';

const CalendarView: React.FC<CalendarViewProps> = ({ savedEntries, t, lang }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<CalendarMode>('month');

  const entriesByDateStr = useMemo(() => new Map(savedEntries.map(entry => [
    new Date(entry.date).toDateString(),
    entry
  ])), [savedEntries]);
  
  const getAvgScore = (entry: DiaryEntry | undefined) => {
      if (!entry || !entry.scores || entry.scores.length === 0) return 0;
      const total = entry.scores.reduce((sum, s) => sum + s.score, 0);
      return total / entry.scores.length;
  };
  
  const getHeatmapColor = (score: number, baseOpacity: string = '50', hoverOpacity: string = '80') => {
      if (score === 0) return 'bg-slate-700/50 dark:bg-slate-800 hover:bg-slate-600/50 dark:hover:bg-slate-700';
      if (score < 2) return `bg-red-800/${baseOpacity} hover:bg-red-700/${hoverOpacity}`;
      if (score < 3) return `bg-yellow-700/${baseOpacity} hover:bg-yellow-600/${hoverOpacity}`;
      if (score < 4) return `bg-sky-700/${baseOpacity} hover:bg-sky-600/${hoverOpacity}`;
      return `bg-cyan-600/${baseOpacity} hover:bg-cyan-500/${hoverOpacity}`;
  };

  const changeMonth = (offset: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }
  
  const changeYear = (offset: number) => {
      setCurrentDate(prev => new Date(prev.getFullYear() + offset, prev.getMonth(), 1));
  }

  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDayOfWeek = (startOfMonth.getDay() + 6) % 7; // Monday = 0
    
    const daysInMonth = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      daysInMonth.push(null);
    }
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      daysInMonth.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    const weekDays = lang === 'tr' ? ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                {weekDays.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
                {daysInMonth.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className="w-full h-20 sm:h-24 rounded-md bg-slate-200 dark:bg-slate-800/50" />;

                const entry = entriesByDateStr.get(day.toDateString());
                const avgScore = getAvgScore(entry);
                const colorClass = getHeatmapColor(avgScore);
                
                return (
                    <div
                    key={day.toString()}
                    className={`w-full h-20 sm:h-24 p-2 rounded-md transition-colors ${colorClass} ${entry ? 'cursor-pointer' : ''} flex flex-col text-white`}
                    title={entry?.title || t('noData')}
                    >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{day.getDate()}</span>
                    {entry && (
                        <div className="text-xs text-slate-700 dark:text-slate-300 mt-auto text-left font-medium">
                            {t('avgScore')}: {avgScore.toFixed(1)}/5
                        </div>
                    )}
                    </div>
                );
                })}
            </div>
        </>
    );
  };
  
  const renderYearView = () => {
      const year = currentDate.getFullYear();
      const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
      
      return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {months.map(month => {
                  const monthName = month.toLocaleString(lang, { month: 'long' });
                  const startOfMonth = new Date(year, month.getMonth(), 1);
                  const endOfMonth = new Date(year, month.getMonth() + 1, 0);
                  const startDayOfWeek = (startOfMonth.getDay() + 6) % 7;
                  const days = Array.from({length: endOfMonth.getDate()}, (_, i) => new Date(year, month.getMonth(), i + 1));
                  
                  return (
                      <div key={month.getMonth()} className="bg-slate-200 dark:bg-slate-900/50 p-3 rounded-lg">
                          <button 
                            onClick={() => { setCurrentDate(month); setMode('month'); }}
                            className="font-bold text-center w-full mb-2 text-cyan-600 dark:text-cyan-400 hover:underline"
                          >
                              {monthName}
                          </button>
                          <div className="grid grid-cols-7 gap-1">
                              {Array(startDayOfWeek).fill(null).map((_, i) => <div key={`empty-${i}`} className="w-full aspect-square" />)}
                              {days.map(day => {
                                const entry = entriesByDateStr.get(day.toDateString());
                                const avgScore = getAvgScore(entry);
                                const color = getHeatmapColor(avgScore, '80', '100').replace(/bg-([a-z]+)-(\d+)\/(\d+)/, 'bg-$1-$2'); // Simplify color for small squares
                                
                                return <div key={day.toISOString()} title={day.toLocaleDateString(lang)} className={`w-full aspect-square rounded-sm ${color}`} />;
                              })}
                          </div>
                      </div>
                  )
              })}
          </div>
      );
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => mode === 'month' ? changeMonth(-1) : changeYear(-1)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200">&larr;</button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {mode === 'month' 
            ? currentDate.toLocaleString(lang, { month: 'long', year: 'numeric' })
            : currentDate.getFullYear()
          }
        </h2>
        <button onClick={() => mode === 'month' ? changeMonth(1) : changeYear(1)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200">&rarr;</button>
      </div>
       <div className="flex justify-center mb-4">
            <div className="p-1 bg-slate-200 dark:bg-slate-900 rounded-lg flex items-center gap-1">
                <button onClick={() => setMode('month')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'month' ? 'bg-cyan-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700/50'}`}>{t('monthView')}</button>
                <button onClick={() => setMode('year')} className={`px-3 py-1 text-sm rounded-md transition-colors ${mode === 'year' ? 'bg-cyan-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700/50'}`}>{t('yearView')}</button>
            </div>
        </div>

      {mode === 'month' ? renderMonthView() : renderYearView()}
    </div>
  );
};

export default CalendarView;