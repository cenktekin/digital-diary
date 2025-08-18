import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { DiaryEntry } from './types';
import { analyzeBrowsingHistory, analyzeOverallHabits } from './services/geminiService';
import * as storage from './services/storageService';

import Header from './components/Header';
import HistoryInput from './components/HistoryInput';
import DiaryDisplay from './components/DiaryDisplay';
import CalendarView from './components/CalendarView';
import Overview from './components/Overview';
import { InfoIcon, PrivacyIcon } from './components/icons';
import { generateMockEntries } from './services/mockData';

type View = 'create' | 'calendar' | 'overview';
type Theme = 'light' | 'dark';
type Language = 'tr' | 'en';

interface User {
  name: string;
  email: string;
  avatar: string;
}

const translations = {
  tr: {
    // App general
    appTitle: 'Dijital Günlük Asistanı',
    appSubtitle: 'Yapay Zeka ile Günlük Aktivitelerinizi Anlamlandırın',
    error: 'Hata',
    errorAnalysis: 'Analiz sırasında bir hata oluştu:',
    errorUnknown: 'Bilinmeyen bir hata oluştu.',
    // Header
    navCreate: 'Günlük Oluştur',
    navRecords: 'Kayıtlarım',
    navOverview: 'Genel Bakış',
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    toggleTheme: 'Temayı Değiştir',
    toggleLanguage: 'Dili Değiştir',
    // Login prompt
    welcome: 'Hoş Geldiniz!',
    loginPrompt: 'Günlüklerinizi kaydetmek, geçmiş aktivitelerinizi görmek ve genel analizlere erişmek için lütfen giriş yapın.',
    loginButton: 'Google ile Giriş Yap (Demo)',
    // How-to guide
    howItWorks: 'Nasıl Çalışır?',
    howToPrompt: 'Size en uygun yöntemi seçin:',
    method1: 'Yöntem 1: Dosya Yükle (.csv)',
    method1Desc: 'Tarayıcınız için "History Trends Unlimited" gibi bir eklentiyle geçmişinizi .csv olarak indirin ve aşağıdaki "Dosya Yükle" sekmesinden yükleyin.',
    method2: 'Yöntem 2: Kopyala & Yapıştır',
    method2Desc: 'Tarayıcı geçmişi sayfanızı açın (genellikle Ctrl+H), analiz etmek istediğiniz aktiviteleri seçip kopyalayın ve "Metin Yapıştır" sekmesindeki alana yapıştırın.',
    analyzeStep: 'Analiz Edin:',
    analyzeStepDesc: '"Günümü Analiz Et" butonuna tıklayarak kişisel dijital günlüğünüzün oluşturulmasını bekleyin.',
    privacyNote: 'Gizlilik Notu',
    privacyDesc: "Girdiğiniz veriler, analiz amacıyla Google Gemini API'sine gönderilir. Giriş yaptığınızda günlükleriniz sunucularımızda değil, sadece sizin tarayıcınızda saklanır.",
    // History Input
    inputTitle: 'Geçmiş Verilerinizi Girin',
    uploadFile: 'Dosya Yükle',
    pasteText: 'Metin Yapıştır',
    dragOrClick: 'Dosyayı buraya sürükleyin veya seçmek için tıklayın',
    csvOnly: 'Sadece CSV formatı desteklenmektedir',
    removeFile: 'Dosyayı kaldır',
    pastePlaceholder: 'Tarayıcı geçmişinizi buraya yapıştırın...',
    analyzing: 'Analiz Ediliyor...',
    analyzeButton: 'Günümü Analiz Et',
    errorOnlyCsv: 'Lütfen sadece .csv formatında bir dosya seçin.',
    errorFileReadEmpty: 'Dosya okunamadı veya boş.',
    errorFileRead: 'Dosya okunurken bir hata oluştu.',
    errorInvalidInput: 'Lütfen analiz için geçerli bir veri girin (dosya veya metin).',
    // Loading/Diary Display
    loadingDiary: 'Dijital günlüğünüz hazırlanıyor...',
    loadingDiarySub: 'Yapay zeka gününüzü analiz ediyor, bu işlem biraz zaman alabilir.',
    newAnalysis: '← Yeni Analiz Yap',
    errorPngCreation: 'PNG oluşturulurken bir hata oluştu.',
    dateLabel: 'Tarih',
    timelineTitle: 'Zaman Tüneli',
    morningLabel: 'Sabah',
    afternoonLabel: 'Öğlen',
    eveningLabel: 'Akşam',
    highlightsTitle: 'Öne Çıkanlar',
    scoresTitle: 'Puanlar',
    categoriesTitle: 'Kategori Dağılımı',
    shareTitle: 'Dijital Günlüğüm: {date}',
    shareText: 'Yapay zeka ile oluşturulan günlük özetim.',
    errorShare: 'Paylaşım özelliği tarayıcınızda desteklenmiyor.',
    errorShareDetailed: 'Paylaşım sırasında bir hata oluştu.',
    tooltipSaved: 'Zaten Kaydedildi',
    tooltipSave: 'Günlüğü Kaydet',
    tooltipDownload: 'PNG olarak indir',
    tooltipCopy: 'Metin olarak kopyala',
    tooltipCopied: 'Kopyalandı!',
    tooltipShare: 'Paylaş',
    alertLoginToSave: 'Lütfen günlüğünüzü kaydetmek için giriş yapın.',
    errorSaving: 'Günlük kaydedilirken bir hata oluştu.',
    // Score Areas
    Productivity: 'Üretkenlik',
    Learning: 'Öğrenme',
    Discovery: 'Keşif',
    Entertainment: 'Eğlence',
    // Calendar
    monthView: 'Ay',
    yearView: 'Yıl',
    noData: 'Veri Yok',
    avgScore: 'Ort Puan',
    // Overview
    overviewTitle: 'Genel Bakış ve Öneriler',
    overviewSubtitle: 'Kaydedilmiş günlüklerinizi analiz ederek dijital alışkanlıklarınız hakkında derinlemesine bilgi edinin ve kişiselleştirilmiş öneriler alın.',
    analyzeHabitsButton: 'Alışkanlıklarımı Analiz Et',
    needMoreEntries: 'Genel analiz için {count} gün daha kaydetmelisiniz.',
    errorMin3Entries: 'Genel bir analiz için en az 3 kayıtlı günlüğe ihtiyaç vardır.',
    interpretingHabits: 'Alışkanlıklarınız yorumlanıyor...',
    yourDigitalPersona: 'Dijital Kişiliğiniz',
    observedTrends: 'Gözlemlenen Trendler',
    recommendationsForYou: 'Sizin İçin Öneriler',
  },
  en: {
    // App general
    appTitle: 'Digital Diary Assistant',
    appSubtitle: 'Make Sense of Your Daily Activities with AI',
    error: 'Error',
    errorAnalysis: 'An error occurred during analysis:',
    errorUnknown: 'An unknown error occurred.',
    // Header
    navCreate: 'Create Diary',
    navRecords: 'My Records',
    navOverview: 'Overview',
    login: 'Login',
    logout: 'Logout',
    toggleTheme: 'Toggle Theme',
    toggleLanguage: 'Toggle Language',
    // Login prompt
    welcome: 'Welcome!',
    loginPrompt: 'Please log in to save your diaries, view your past activities, and access overall analytics.',
    loginButton: 'Login with Google (Demo)',
    // How-to guide
    howItWorks: 'How It Works',
    howToPrompt: 'Choose the method that suits you best:',
    method1: 'Method 1: Upload File (.csv)',
    method1Desc: 'Download your history as a .csv file using a browser extension like "History Trends Unlimited" and upload it from the "Upload File" tab below.',
    method2: 'Method 2: Copy & Paste',
    method2Desc: 'Open your browser history page (usually Ctrl+H), select and copy the activities you want to analyze, and paste them into the "Paste Text" tab.',
    analyzeStep: 'Analyze:',
    analyzeStepDesc: 'Click the "Analyze My Day" button and wait for your personal digital diary to be created.',
    privacyNote: 'Privacy Note',
    privacyDesc: 'The data you enter is sent to the Google Gemini API for analysis. When you log in, your diaries are stored only in your browser, not on our servers.',
    // History Input
    inputTitle: 'Enter Your History Data',
    uploadFile: 'Upload File',
    pasteText: 'Paste Text',
    dragOrClick: 'Drag & drop a file here, or click to select',
    csvOnly: 'Only CSV format is supported',
    removeFile: 'Remove file',
    pastePlaceholder: 'Paste your browser history here...',
    analyzing: 'Analyzing...',
    analyzeButton: 'Analyze My Day',
    errorOnlyCsv: 'Please select only a .csv format file.',
    errorFileReadEmpty: 'Could not read the file or it is empty.',
    errorFileRead: 'An error occurred while reading the file.',
    errorInvalidInput: 'Please enter valid data (file or text) for analysis.',
    // Loading/Diary Display
    loadingDiary: 'Preparing your digital diary...',
    loadingDiarySub: 'The AI is analyzing your day, this may take a moment.',
    newAnalysis: '← New Analysis',
    errorPngCreation: 'An error occurred while creating the PNG.',
    dateLabel: 'Date',
    timelineTitle: 'Timeline',
    morningLabel: 'Morning',
    afternoonLabel: 'Afternoon',
    eveningLabel: 'Evening',
    highlightsTitle: 'Highlights',
    scoresTitle: 'Scores',
    categoriesTitle: 'Category Distribution',
    shareTitle: 'My Digital Diary: {date}',
    shareText: 'My daily summary generated by AI.',
    errorShare: 'The share feature is not supported in your browser.',
    errorShareDetailed: 'An error occurred while sharing.',
    tooltipSaved: 'Already Saved',
    tooltipSave: 'Save Diary',
    tooltipDownload: 'Download as PNG',
    tooltipCopy: 'Copy as Text',
    tooltipCopied: 'Copied!',
    tooltipShare: 'Share',
    alertLoginToSave: 'Please log in to save your diary.',
    errorSaving: 'An error occurred while saving the diary.',
    // Score Areas
    Productivity: 'Productivity',
    Learning: 'Learning',
    Discovery: 'Discovery',
    Entertainment: 'Entertainment',
    // Calendar
    monthView: 'Month',
    yearView: 'Year',
    noData: 'No Data',
    avgScore: 'Avg Score',
    // Overview
    overviewTitle: 'Overview & Recommendations',
    overviewSubtitle: 'Get in-depth insights into your digital habits and receive personalized recommendations by analyzing your saved diaries.',
    analyzeHabitsButton: 'Analyze My Habits',
    needMoreEntries: 'You need to save {count} more day(s) for a general analysis.',
    errorMin3Entries: 'At least 3 saved diaries are needed for an overall analysis.',
    interpretingHabits: 'Interpreting your habits...',
    yourDigitalPersona: 'Your Digital Persona',
    observedTrends: 'Observed Trends',
    recommendationsForYou: 'Recommendations for You',
  }
};

const App: React.FC = () => {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<View>('create');
  const [user, setUser] = useState<User | null>(null);
  const [savedEntries, setSavedEntries] = useState<DiaryEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [theme, setTheme] = useState<Theme>(storage.getTheme());
  const [language, setLanguage] = useState<Language>(storage.getLanguage());

  const t = useCallback((key: string, options?: { [key: string]: string | number }) => {
    let text = translations[language][key as keyof typeof translations.tr] || key;
    if (options) {
        Object.keys(options).forEach(optKey => {
            text = text.replace(`{${optKey}}`, String(options[optKey]));
        });
    }
    return text;
  }, [language]);


  useEffect(() => {
    // Apply theme
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    storage.saveTheme(theme);
  }, [theme]);
  
  useEffect(() => {
    // Save language
    storage.saveLanguage(language);
  }, [language]);

  useEffect(() => {
    const loggedInUser = storage.getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
      let entries = storage.getEntries();
      // If demo user and no entries, add mock data
      if(loggedInUser.email === 'demo@example.com' && entries.length === 0){
          entries = generateMockEntries(language);
          storage.saveEntries(entries);
      }
      setSavedEntries(entries);
    }
  }, [language]);

  const handleAnalyze = useCallback(async (historyData: string) => {
    if (!historyData.trim()) {
      setError(t('errorInvalidInput'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiaryEntries(null);

    try {
      const result = await analyzeBrowsingHistory(historyData, language);
      setDiaryEntries(result);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : t('errorUnknown');
      setError(`${t('errorAnalysis')} ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [language, t]);

  const handleLogin = () => {
    const mockUser: User = {
      name: "Demo User",
      email: "demo@example.com",
      avatar: "https://i.pravatar.cc/150?u=demo@example.com"
    };
    storage.saveUser(mockUser);
    setUser(mockUser);
    let entries = storage.getEntries();
    if (entries.length === 0) {
        entries = generateMockEntries(language);
        storage.saveEntries(entries);
    }
    setSavedEntries(entries);
  };

  const handleLogout = () => {
    storage.clearUser();
    setUser(null);
    setSavedEntries([]);
    setView('create');
  };

  const handleSaveEntry = async (entryToSave: DiaryEntry) => {
    if (!user) {
      alert(t('alertLoginToSave'));
      return;
    }
    setIsSaving(true);
    try {
      await new Promise(res => setTimeout(res, 500));
      storage.saveEntry(entryToSave);
      const updatedEntries = storage.getEntries();
      setSavedEntries(updatedEntries);
    } catch (error) {
      console.error("Error saving entry:", error);
      alert(t('errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleToggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleToggleLanguage = () => setLanguage(prev => prev === 'tr' ? 'en' : 'tr');

  const resetToCreate = () => {
    setDiaryEntries(null);
    setError(null);
    setView('create');
  }
  
  const savedDates = useMemo(() => savedEntries.map(e => new Date(e.date).toDateString()), [savedEntries]);

  const renderView = () => {
    if (!user) {
      return (
        <div className="text-center bg-slate-100 dark:bg-slate-800 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t('welcome')}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{t('loginPrompt')}</p>
          <button onClick={handleLogin} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">
            {t('loginButton')}
          </button>
        </div>
      );
    }

    switch (view) {
      case 'calendar':
        return <CalendarView savedEntries={savedEntries} t={t} lang={language}/>;
      case 'overview':
        return <Overview savedEntries={savedEntries} t={t} lang={language} />;
      case 'create':
      default:
        return (
          <>
            {!diaryEntries && !isLoading && (
               <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mb-8">
                <div className="flex items-start gap-4 mb-4">
                  <InfoIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('howItWorks')}</h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{t('howToPrompt')}</p>
                      <ol className="list-decimal list-inside text-slate-600 dark:text-slate-400 text-sm space-y-2 mt-2">
                        <li>
                          <strong>{t('method1')}</strong><br/>
                          <span dangerouslySetInnerHTML={{ __html: t('method1Desc') }} />
                        </li>
                        <li>
                          <strong>{t('method2')}</strong><br/>
                          <span dangerouslySetInnerHTML={{ __html: t('method2Desc') }} />
                        </li>
                        <li>
                          <strong>{t('analyzeStep')}</strong> {t('analyzeStepDesc')}
                        </li>
                      </ol>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <PrivacyIcon className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{t('privacyNote')}</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">{t('privacyDesc')}</p>
                  </div>
                </div>
              </div>
            )}
            
            <HistoryInput onAnalyze={handleAnalyze} isLoading={isLoading} t={t} />
            
            {error && (
              <div className="mt-6 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 px-4 py-3 rounded-lg animate-fade-in">
                <p><span className="font-bold">{t('error')}:</span> {error}</p>
              </div>
            )}

            {isLoading && (
              <div className="mt-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-cyan-500 dark:border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-700 dark:text-slate-300 text-lg animate-pulse">{t('loadingDiary')}</p>
                <p className="text-slate-500 dark:text-slate-400">{t('loadingDiarySub')}</p>
              </div>
            )}

            {diaryEntries && !isLoading && (
              <div className="mt-8 animate-fade-in-up">
                 <div className="flex justify-end mb-4">
                    <button onClick={resetToCreate} className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300">
                      {t('newAnalysis')}
                    </button>
                  </div>
                <DiaryDisplay
                  entries={diaryEntries}
                  onSave={handleSaveEntry}
                  isSaving={isSaving}
                  savedDates={savedDates}
                  t={t}
                />
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto">
        <Header
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          activeView={view}
          onSetView={setView}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          t={t}
        />
        <main className="mt-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;