
import React, { useState, useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { DiaryEntry, Highlight, Score } from '../types';
import CategoryChart from './CategoryChart';
import { 
  CodeIcon, NewsIcon, ShopIcon, LearnIcon, EntertainmentIcon, SocialIcon, ResearchIcon, OtherIcon, 
  ProductivityIcon, DiscoveryIcon, TimeIcon, MorningIcon, AfternoonIcon, EveningIcon,
  DownloadIcon, CopyIcon, ShareIcon
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
  'Eğrence': EntertainmentIcon,
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const diaryRef = useRef<HTMLDivElement>(null);

  if (!entries || entries.length === 0) {
    return null;
  }
  
  const selectedEntry = entries[selectedDayIndex];

  const handleDownloadPng = useCallback(() => {
    if (diaryRef.current === null) {
      return;
    }
    toPng(diaryRef.current, { cacheBust: true, backgroundColor: '#1e293b' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        const safeDate = selectedEntry.date.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        link.download = `dijital-gunluk-${safeDate}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('PNG oluşturulurken hata oluştu:', err);
        alert('Resim oluşturulurken bir hata oluştu.');
      });
  }, [diaryRef, selectedEntry.date]);

  const handleCopyText = useCallback(() => {
    const textToCopy = `
      **${selectedEntry.title}**\n
      *Tarih: ${selectedEntry.date}*\n\n
      **Zaman Akışı**\n
      - **Sabah:** ${selectedEntry.summary.sabah}\n
      - **Öğlen:** ${selectedEntry.summary.oglen}\n
      - **Akşam:** ${selectedEntry.summary.aksam}\n\n
      **Günün Önemli Anları**\n
      ${selectedEntry.highlights.map(h => `- ${h.activity}`).join('\n')}\n\n
      **Aktivite Puanları**\n
      ${selectedEntry.scores.map(s => `- **${s.area}:** ${s.score}/5 (${s.feedback})`).join('\n')}
    `.replace(/  +/g, ' ').trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  }, [selectedEntry]);

  const handleShare = useCallback(async () => {
    if (diaryRef.current === null) return;

    try {
        const dataUrl = await toPng(diaryRef.current, { cacheBust: true, backgroundColor: '#1e293b' });
        const blob = await (await fetch(dataUrl)).blob();
        const safeDate = selectedEntry.date.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const file = new File([blob], `dijital-gunluk-${safeDate}.png`, { type: 'image/png' });

        const shareData = {
            title: `Dijital Günlüğüm: ${selectedEntry.date}`,
            text: `${selectedEntry.title} - Dijital Günlük Asistanı ile günümü özetledim!`,
            files: [file],
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            await navigator.share(shareData);
        } else {
            // Fallback for browsers that can't share files
            alert('Tarayıcınız bu içeriği doğrudan paylaşmayı desteklemiyor. Lütfen önce PNG olarak indirip manuel olarak paylaşın.');
        }
    } catch (err) {
        console.error('Paylaşım hatası:', err);
        alert('İçerik paylaşılırken bir hata oluştu.');
    }
}, [selectedEntry.date, selectedEntry.title]);

  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
      {entries.length > 1 && (
        <div className="flex border-b border-slate-700 bg-slate-900/50 p-2 overflow-x-auto">
          <div className="flex space-x-2">
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
        </div>
      )}

      <div ref={diaryRef} className="p-6 sm:p-8 bg-slate-800">
        <div className="relative">
          <div className="absolute top-0 right-0 flex gap-2">
             <button onClick={handleDownloadPng} title="PNG Olarak İndir" className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-cyan-300 transition-colors">
                <DownloadIcon className="w-5 h-5"/>
            </button>
            <button onClick={handleCopyText} title="Özeti Kopyala" className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-cyan-300 transition-colors w-[90px]">
                {copyStatus === 'idle' ? <><CopyIcon className="w-5 h-5 inline-block mr-1"/> Kopyala</> : 'Kopyalandı!'}
            </button>
            {navigator.share && (
                <button onClick={handleShare} title="Paylaş" className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 text-slate-300 hover:text-cyan-300 transition-colors">
                    <ShareIcon className="w-5 h-5"/>
                </button>
            )}
          </div>
          <h2 className="text-3xl font-bold text-cyan-400 mb-6 text-center">{selectedEntry.title}</h2>
        </div>
        
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