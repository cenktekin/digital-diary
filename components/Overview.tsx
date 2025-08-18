import React, { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { DiaryEntry, OverallAnalysis, Persona } from '../types';
import { analyzeOverallHabits } from '../services/geminiService';
import { AnalyzeIcon, LoadingIcon, DiscoveryIcon, CodeIcon, LearnIcon, SocialIcon, EntertainmentIcon, OtherIcon, ChartBarIcon, DownloadIcon } from './icons';

interface OverviewProps {
  savedEntries: DiaryEntry[];
  t: (key: string, options?: { [key: string]: string | number }) => string;
  lang: 'tr' | 'en';
}

const personaIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  Discovery: DiscoveryIcon,
  Code: CodeIcon,
  Learn: LearnIcon,
  Social: SocialIcon,
  Entertainment: EntertainmentIcon,
  Other: OtherIcon,
};

const PersonaCard: React.FC<{ persona: Persona }> = ({ persona }) => {
  const Icon = personaIcons[persona.icon] || OtherIcon;
  return (
    <div className="bg-slate-200 dark:bg-slate-900/50 p-6 rounded-lg text-center flex flex-col items-center">
      <Icon className="w-16 h-16 mb-4 text-cyan-500 dark:text-cyan-400" />
      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{persona.title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mt-2">{persona.description}</p>
    </div>
  );
};

const Overview: React.FC<OverviewProps> = ({ savedEntries, t, lang }) => {
  const [analysis, setAnalysis] = useState<OverallAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const overviewRef = useRef<HTMLDivElement>(null);

  const handleAnalysis = useCallback(async () => {
    if (savedEntries.length < 3) {
      setError(t('errorMin3Entries'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeOverallHabits(savedEntries, lang);
      setAnalysis(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t('errorUnknown');
      setError(`${t('errorAnalysis')} ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [savedEntries, lang, t]);

  const handleDownload = useCallback(() => {
    if (overviewRef.current === null) {
      return;
    }
    const isDarkMode = document.documentElement.classList.contains('dark');
    toPng(overviewRef.current, { cacheBust: true, backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `digital-habits-overview.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error creating overview PNG:', err);
        alert(t('errorPngCreation'));
      });
  }, [overviewRef, t]);

  return (
    <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-3"><ChartBarIcon className="w-7 h-7" />{t('overviewTitle')}</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">{t('overviewSubtitle')}</p>

      {!analysis && (
        <div className="text-center">
          <button
            onClick={handleAnalysis}
            disabled={isLoading || savedEntries.length < 3}
            className="h-12 w-full max-w-sm flex items-center justify-center gap-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold px-4 rounded-lg transition-all duration-300 transform active:scale-95 shadow-lg shadow-cyan-500/30 dark:shadow-cyan-900/50"
          >
            {isLoading ? (
              <>
                <LoadingIcon className="w-5 h-5 animate-spin" />
                <span>{t('analyzing')}</span>
              </>
            ) : (
              <>
                <AnalyzeIcon className="w-5 h-5" />
                <span>{t('analyzeHabitsButton')}</span>
              </>
            )}
          </button>
           {savedEntries.length < 3 && <p className="text-amber-500 dark:text-amber-400 text-sm mt-4">{t('needMoreEntries', { count: 3 - savedEntries.length })}</p>}
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg animate-fade-in">
          <p><span className="font-bold">{t('error')}:</span> {error}</p>
        </div>
      )}

      {isLoading && (
          <div className="mt-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg animate-pulse">{t('interpretingHabits')}</p>
          </div>
      )}

      {analysis && (
        <div className="mt-8 animate-fade-in-up">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg relative">
                <div className="absolute top-4 right-4">
                    <button onClick={handleDownload} title={t('tooltipDownload')} className="p-2 rounded-full bg-slate-300/50 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                        <DownloadIcon className="w-5 h-5"/>
                    </button>
                </div>
                <div ref={overviewRef} className="p-6 sm:p-8 text-slate-800 dark:text-white">
                  <div className="space-y-8">
                      <div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{t('yourDigitalPersona')}</h3>
                          <PersonaCard persona={analysis.persona} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{t('observedTrends')}</h3>
                          <div className="space-y-4">
                              {analysis.trends.map((trend, i) => (
                              <div key={i} className="bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-cyan-600 dark:text-cyan-400">{trend.title}</h4>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{trend.description}</p>
                              </div>
                              ))}
                          </div>
                          </div>

                          <div>
                          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b-2 border-slate-200 dark:border-slate-700 pb-2">{t('recommendationsForYou')}</h3>
                          <div className="space-y-4">
                              {analysis.recommendations.map((rec, i) => (
                              <div key={i} className="bg-slate-200 dark:bg-slate-900/50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-amber-600 dark:text-amber-300">{rec.title}</h4>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{rec.description}</p>
                              </div>
                              ))}
                          </div>
                          </div>
                      </div>
                  </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Overview;