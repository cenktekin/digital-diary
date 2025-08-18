
import React from 'react';
import { DiaryEntry } from '../types';
import CategoryChart from './CategoryChart';

interface DiaryDisplayProps {
  entry: DiaryEntry;
}

const DiaryDisplay: React.FC<DiaryDisplayProps> = ({ entry }) => {
  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-700">
      <h2 className="text-3xl font-bold text-cyan-400 mb-4 text-center">{entry.title}</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-200 mb-2 border-b-2 border-slate-700 pb-2">Günlük Özetin</h3>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.summary}</p>
        </div>
        
        {entry.categories && entry.categories.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b-2 border-slate-700 pb-2">Aktivite Dağılımı</h3>
            <div className="bg-slate-900/50 p-4 rounded-lg">
              <CategoryChart data={entry.categories} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryDisplay;
