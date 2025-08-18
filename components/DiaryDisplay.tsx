import React, { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { DiaryEntry, Highlight, Score, ScoreArea } from '../types';
import CategoryChart from './CategoryChart';
import { 
  CodeIcon, NewsIcon, ShopIcon, LearnIcon, EntertainmentIcon, SocialIcon, ResearchIcon, OtherIcon, 
  ProductivityIcon, DiscoveryIcon, TimeIcon, MorningIcon, AfternoonIcon, EveningIcon,
  DownloadIcon, CopyIcon, ShareIcon, SaveIcon, CheckIcon, LoadingIcon
} from './icons';

interface DiaryDisplayProps {
  entries: DiaryEntry[];
  onSave: (entry: DiaryEntry) => void;
  isSaving: boolean;
  savedDates: string[];
  t: (key: string, options?: { [key: string]: string | number }) => string;
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

const scoreIcons: { [key in ScoreArea]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  'Productivity': ProductivityIcon,
  'Learning': LearnIcon,
  'Discovery': DiscoveryIcon,
  'Entertainment': EntertainmentIcon,
};

const ScoreCard: React.FC<{ scoreItem: Score; t: (key: string) => string }> = ({ scoreItem, t }) => {
  const Icon = scoreIcons[scoreItem.area] || OtherIcon;
  const scoreColor = scoreItem.score >= 4 ? 'bg-green-500' : scoreItem.score >= 2.5 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="bg-slate-200/50 dark:bg-slate-800/70 p-4 rounded-lg flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <Icon className="w-6 h-6 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex-grow">{t(scoreItem.area)}</h4>
        <span className="font-bold text-lg text-slate-900 dark:text-white">{scoreItem.score}<span className="text-sm text-slate-500 dark:text-slate-400">/5</span></span>
      </div>
      <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2.5">
        <div className={`${scoreColor} h-2.5 rounded-full`} style={{ width: `${scoreItem.score * 20}%` }}></div>
      </div>
      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{scoreItem.feedback}</p>
    </div>
  );
};

const HighlightCard: React.FC<{ highlight: Highlight }> = ({ highlight }) => {
    const Icon = highlightIcons[highlight.icon] || OtherIcon;
    return (
        <div className="flex items-center gap-3 bg-slate-200 dark:bg-slate-800/70 p-3 rounded-lg">
            <Icon className="w-6 h-6 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
            <p className="text-sm text-slate-700 dark:text-slate-300">{highlight.activity}</p>
        </div>
    );
};

const DiaryDisplay: React.FC<DiaryDisplayProps> = ({ entries, onSave, isSaving, savedDates, t }) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const diaryRef = useRef<HTMLDivElement>(null);

  if (!entries || entries.length === 0) {
    return null;
  }
  
  const selectedEntry = entries[selectedDayIndex];
  const isAlreadySaved = savedDates.includes(new Date(selectedEntry.date).toDateString());

  const handleDownloadPng = useCallback(() => {
    if (diaryRef.current === null) {
      return;
    }
    const isDarkMode = document.documentElement.classList.contains('dark');
    toPng(diaryRef.current, { cacheBust: true, backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        const safeDate = new Date(selectedEntry.date).toISOString().split('T')[0];
        link.download = `digital-diary-${safeDate}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error creating PNG:', err);
        alert(t('errorPngCreation'));
      });
  }, [diaryRef, selectedEntry.date, t]);

  const handleCopyText = useCallback(() => {
    const textToCopy = `
      **${selectedEntry.title}**\n
      *${t('dateLabel')}: ${selectedEntry.date}*\n\n
      **${t('timelineTitle')}**\n
      - **${t('morningLabel')}:** ${selectedEntry.summary.sabah}\n
      - **${t('afternoonLabel')}:** ${selectedEntry.summary.oglen}\n
      - **${t('eveningLabel')}:** ${selectedEntry.summary.aksam}\n\n
      **${t('highlightsTitle')}**\n
      ${selectedEntry.highlights.map(h => `- ${h.activity}`).join('\n')}\n\n
      **${t('scoresTitle')}**\n
      ${selectedEntry.scores.map(s => `- **${t(s.area)}:** ${s.score}/5 (${s.feedback})`).join('\n')}
    `.replace(/  +/g, ' ').trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [selectedEntry, t]);

  const handleShare = useCallback(async () => {
    if (diaryRef.current === null) return;

    try {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const dataUrl = await toPng(diaryRef.current, { cacheBust: true, backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' });
        const blob = await (await fetch(dataUrl)).blob();
        const safeDate = new Date(selectedEntry.date).toISOString().split('T')[0];
        const file = new File([blob], `digital-diary-${safeDate}.png`, { type: 'image/png' });

        const shareData = {
            title: t('shareTitle', { date: selectedEntry.date }),
            text: `${selectedEntry.title} - ${t('shareText')}`,
            files: [file],
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            alert(t('errorShare'));
        }
    } catch (err) {
        console.error('Share error:', err);
        alert(t('errorShareDetailed'));
    }
}, [selectedEntry.date, selectedEntry.title, t]);

  const ActionButtons: React.FC = () => (
      <div className="absolute -top-4 right-0 flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-2 rounded-full border border-slate-300 dark:border-slate-700 shadow-md">
        <button 
          onClick={() => onSave(selectedEntry)} 
          disabled={isSaving || isAlreadySaved}
          title={isAlreadySaved ? t('tooltipSaved') : t('tooltipSave')} 
          className="p-2 rounded-full bg-slate-300/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <LoadingIcon className="w-5 h-5 animate-spin" /> : (isAlreadySaved ? <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400" /> : <SaveIcon className="w-5 h-5"/>)}
        </button>
        <button onClick={handleDownloadPng} title={t('tooltipDownload')} className="p-2 rounded-full bg-slate-300/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
            <DownloadIcon className="w-5 h-5"/>
        </button>
        <button onClick={handleCopyText} title={copyStatus === 'idle' ? t('tooltipCopy') : t('tooltipCopied')} className="p-2 rounded-full bg-slate-300/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
            {copyStatus === 'idle' ? <CopyIcon className="w-5 h-5"/> : <CheckIcon className="w-5 h-5 text-green-500 dark:text-green-400"/>}
        </button>
        {navigator.share && (
            <button onClick={handleShare} title={t('tooltipShare')} className="p-2 rounded-full bg-slate-300/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                <ShareIcon className="w-5 h-5"/>
            </button>
        )}
      </div>
  );

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {entries.length > 1 && (
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-900/50 p-2 overflow-x-auto">
          <div className="flex space-x-2">
            {entries.map((entry, index) => (
              <button
                key={index}
                onClick={() => setSelectedDayIndex(index)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 whitespace-nowrap ${
                  selectedDayIndex === index
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {entry.date}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={diaryRef} className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white">
        <div className="relative mb-6">
          <ActionButtons/>
          <h2 className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 text-center">{selectedEntry.title}</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mt-2">{selectedEntry.date}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b-2 border-slate-200 dark:border-slate-700 pb-2 flex items-center gap-2"><TimeIcon className="w-6 h-6"/>{t('timelineTitle')}</h3>
                    <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                        {selectedEntry.summary.sabah && <div className="flex items-start gap-3"><MorningIcon className="w-5 h-5 mt-1 text-amber-500 dark:text-amber-300 flex-shrink-0" /><p><strong className="text-slate-900 dark:text-slate-100">{t('morningLabel')}:</strong> {selectedEntry.summary.sabah}</p></div>}
                        {selectedEntry.summary.oglen && <div className="flex items-start gap-3"><AfternoonIcon className="w-5 h-5 mt-1 text-orange-500 dark:text-orange-400 flex-shrink-0" /><p><strong className="text-slate-900 dark:text-slate-100">{t('afternoonLabel')}:</strong> {selectedEntry.summary.oglen}</p></div>}
                        {selectedEntry.summary.aksam && <div className="flex items-start gap-3"><EveningIcon className="w-5 h-5 mt-1 text-indigo-500 dark:text-indigo-400 flex-shrink-0" /><p><strong className="text-slate-900 dark:text-slate-100">{t('eveningLabel')}:</strong> {selectedEntry.summary.aksam}</p></div>}
                    </div>
                </div>

                {selectedEntry.highlights && selectedEntry.highlights.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{t('highlightsTitle')}</h3>
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
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{t('scoresTitle')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedEntry.scores.map((s, i) => <ScoreCard key={i} scoreItem={s} t={t} />)}
                    </div>
                  </div>
                )}

                {selectedEntry.categories && selectedEntry.categories.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{t('categoriesTitle')}</h3>
                    <div className="bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg">
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