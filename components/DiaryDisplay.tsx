
import React, { useState } from 'react';
import { DiaryEntry, Highlight, Score } from '../types';
import CategoryChart from './CategoryChart';
import { 
  CodeIcon, NewsIcon, ShopIcon, LearnIcon, EntertainmentIcon, SocialIcon, ResearchIcon, OtherIcon, 
  ProductivityIcon, DiscoveryIcon, TimeIcon, MorningIcon, AfternoonIcon, EveningIcon 
} from './icons';

interface DiaryDisplayProps {
  entries: DiaryEntry[];
}

const highlightIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  code: CodeIcon,
  news: NewsIcon,
  shop: ShopIcon,
  learn: LearnIcon,
  entertainment: EntertainmentIcon,
  social: SocialIcon,
  research: ResearchIcon,
  other: OtherIcon,
};

const scoreIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'Üretkenlik': ProductivityIcon,
  'Öğrenme': LearnIcon,
  'Keşif': DiscoveryIcon,
  'Eğlence': EntertainmentIcon,
};

const ScoreCard: React.FC<{ scoreItem: Score }> = ({ scoreItem }) => {
  const Icon = scoreIcons[scoreItem.area] || OtherIcon;
  const scoreColor = scoreItem.score >= 4 ? 'bg-green-500' : scoreItem.score >= 2 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="bg-slate-800/70 p-4 rounded-lg flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
        <h4 className="font-semibold text-slate-200 flex-grow">{scoreItem.area}</h4>
        <span className="font-bold text-lg text-white">{scoreItem.score}<span className="text-sm text-slate-400">/5</span></span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div className={`${scoreColor} h-2.5 rounded-full`} style={{ width: `${scoreItem.score * 20}%` }}></div>
      </div>
      <p className="text-xs text-slate-400 mt-1">{scoreItem.feedback}</p>
    </div>
  );
};

const HighlightCard: React.FC<{ highlight: Highlight }> = ({ highlight }) => {
    const Icon = highlightIcons[highlight.icon] || OtherIcon;
    return (
        <div className="flex items-center gap-3 bg-slate-800/70 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
            <p className="text-sm text-slate-300">{highlight.activity}</p>
        </div>
    );
};

const DiaryDisplay: React.FC<DiaryDisplayProps> = ({ entries }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  if (!entries || entries.length === 0) {
    return null;
  }
  
  const selectedEntry = entries[selectedDayIndex];

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
      {entries.length > 1 && (
        <div className="flex border-b border-slate-700 bg-slate-900/50 p-2 space-x-2 overflow-x-auto">
          {entries.map((entry, index) => (
            <button
              key={index}
              onClick={() => setSelectedDayIndex(index)}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
                selectedDayIndex === index
                  ? 'bg-cyan-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {entry.date}
            </button>
          ))}
        </div>
      )}

      <div className="p-6 sm:p-8">
        <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">{selectedEntry.title}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b-2 border-slate-700 pb-2 flex items-center gap-2"><TimeIcon className="w-6 h-6"/>Zaman Akışın</h3>
                    <div className="space-y-4 text-slate-300 leading-relaxed text-sm">
                        {selectedEntry.summary.sabah && <div className="flex items-start gap-3"><MorningIcon className="w-5 h-5 mt-1 text-amber-300 flex-shrink-0" /><p><strong className="text-slate-100">Sabah:</strong> {selectedEntry.summary.sabah}</p></div>}
                        {selectedEntry.summary.oglen && <div className="flex items-start gap-3"><AfternoonIcon className="w-5 h-5 mt-1 text-orange-400 flex-shrink-0" /><p><strong className="text-slate-100">Öğlen:</strong> {selectedEntry.summary.oglen}</p></div>}
                        {selectedEntry.summary.aksam && <div className="flex items-start gap-3"><EveningIcon className="w-5 h-5 mt-1 text-indigo-400 flex-shrink-0" /><p><strong className="text-slate-100">Akşam:</strong> {selectedEntry.summary.aksam}</p></div>}
                    </div>
                </div>

                {selectedEntry.highlights && selectedEntry.highlights.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b-2 border-slate-700 pb-2">Günün Önemli Anları</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedEntry.highlights.map((h, i) => <HighlightCard key={i} highlight={h} />)}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
                {selectedEntry.scores && selectedEntry.scores.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b-2 border-slate-700 pb-2">Aktivite Puanlaması</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEntry.scores.map((s, i) => <ScoreCard key={i} scoreItem={s} />)}
                    </div>
                  </div>
                )}

                {selectedEntry.categories && selectedEntry.categories.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-200 mb-3 border-b-2 border-slate-700 pb-2">Aktivite Dağılımı</h3>
                    <div className="bg-slate-900/50 p-4 rounded-lg">
                      <CategoryChart data={selectedEntry.categories} />
                    </div>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryDisplay;
