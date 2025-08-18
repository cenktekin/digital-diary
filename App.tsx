
import React, { useState, useCallback } from 'react';
import { DiaryEntry } from './types';
import { analyzeBrowsingHistory } from './services/geminiService';
import HistoryInput from './components/HistoryInput';
import DiaryDisplay from './components/DiaryDisplay';
import { LogoIcon, PrivacyIcon, InfoIcon } from './components/icons';

const App: React.FC = () => {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (historyData: string) => {
    if (!historyData.trim()) {
      setError('Lütfen analiz için geçerli bir veri girin (dosya veya metin).');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiaryEntries(null);

    try {
      const result = await analyzeBrowsingHistory(historyData);
      setDiaryEntries(result);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen bir hata oluştu.';
      setError(`Analiz sırasında bir hata oluştu: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-slate-900 min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-slate-700">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <LogoIcon className="w-12 h-12 text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Dijital Günlük Asistanı</h1>
              <p className="text-slate-400">Yapay Zeka ile Günlük Aktivitelerinizi Anlamlandırın</p>
            </div>
          </div>
        </header>

        <main>
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 mb-8">
            <div className="flex items-start gap-4 mb-4">
               <InfoIcon className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
               <div>
                  <h2 className="text-lg font-semibold text-slate-200">Nasıl Çalışır?</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Size en uygun yöntemi seçin:
                  </p>
                  <ol className="list-decimal list-inside text-slate-400 text-sm space-y-2 mt-2">
                    <li>
                      <strong>Yöntem 1: Dosya Yükle (.csv)</strong><br/>
                      Tarayıcınız için "History Trends Unlimited" gibi bir eklentiyle geçmişinizi <strong className="text-amber-300">.csv</strong> olarak indirin ve aşağıdaki "Dosya Yükle" sekmesinden yükleyin.
                    </li>
                    <li>
                      <strong>Yöntem 2: Kopyala & Yapıştır</strong><br/>
                      Tarayıcı geçmişi sayfanızı açın (genellikle <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl</kbd>+<kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">H</kbd>), analiz etmek istediğiniz aktiviteleri seçip kopyalayın ve "Metin Yapıştır" sekmesindeki alana yapıştırın.
                    </li>
                     <li>
                      <strong>Analiz Edin:</strong> "Günümü Analiz Et" butonuna tıklayarak kişisel dijital günlüğünüzün oluşturulmasını bekleyin.
                    </li>
                  </ol>
               </div>
            </div>
            <div className="flex items-start gap-4">
              <PrivacyIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-slate-200">Gizlilik Notu</h2>
                <p className="text-slate-400 text-sm">
                  Girdiğiniz veriler, analiz amacıyla Google Gemini API'sine gönderilir ve sunucularımızda saklanmaz. Tarayıcı geçmişiniz size özeldir ve bu uygulama gizliliğinize saygı duyar.
                </p>
              </div>
            </div>
          </div>
          
          <HistoryInput
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
          />
          
          {error && (
            <div className="mt-6 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg animate-fade-in">
              <p><span className="font-bold">Hata:</span> {error}</p>
            </div>
          )}

          {isLoading && (
            <div className="mt-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-300 text-lg animate-pulse">Dijital günlüğünüz hazırlanıyor...</p>
              <p className="text-slate-400">Yapay zeka gününüzü analiz ediyor, bu işlem biraz zaman alabilir.</p>
            </div>
          )}

          {diaryEntries && !isLoading && (
            <div className="mt-8 animate-fade-in-up">
              <DiaryDisplay entries={diaryEntries} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
