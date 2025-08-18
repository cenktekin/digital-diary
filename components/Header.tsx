import React from 'react';
import { LogoIcon, CreateIcon, CalendarIcon, ChartBarIcon, LogoutIcon, SunIcon, MoonIcon, LanguageIcon } from './icons';

interface User {
  name: string;
  email: string;
  avatar: string;
}

type View = 'create' | 'calendar' | 'overview';
type Theme = 'light' | 'dark';
type Language = 'tr' | 'en';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  activeView: View;
  onSetView: (view: View) => void;
  theme: Theme;
  onToggleTheme: () => void;
  language: Language;
  onToggleLanguage: () => void;
  t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ 
    user, 
    onLogin, 
    onLogout, 
    activeView, 
    onSetView, 
    theme, 
    onToggleTheme, 
    language, 
    onToggleLanguage, 
    t 
}) => {
  
  const NavButton: React.FC<{
    viewName: View;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    text: string;
  }> = ({ viewName, icon: Icon, text }) => (
    <button
      onClick={() => onSetView(viewName)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
        activeView === viewName
          ? 'bg-cyan-600/20 text-cyan-400'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b border-slate-700 dark:border-slate-700">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <LogoIcon className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{t('appTitle')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('appSubtitle')}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
         <div className="flex items-center p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
             <button onClick={onToggleTheme} title={t('toggleTheme')} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md transition-colors">
                {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
            </button>
            <button onClick={onToggleLanguage} title={t('toggleLanguage')} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1">
                <LanguageIcon className="w-5 h-5" />
                <span className="text-sm font-bold">{language.toUpperCase()}</span>
            </button>
        </div>
        
        {user && (
          <nav className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg">
            <NavButton viewName="create" icon={CreateIcon} text={t('navCreate')} />
            <NavButton viewName="calendar" icon={CalendarIcon} text={t('navRecords')} />
            <NavButton viewName="overview" icon={ChartBarIcon} text={t('navOverview')} />
          </nav>
        )}
        
        <div className="flex items-center gap-3 pl-2">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500">{user.email}</p>
              </div>
              <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-slate-300 dark:border-slate-600" />
              <button onClick={onLogout} title={t('logout')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-900/50 rounded-full transition-colors duration-200">
                <LogoutIcon className="w-6 h-6"/>
              </button>
            </>
          ) : (
             <button onClick={onLogin} className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                {t('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;