import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  BookOpen, 
  History, 
  User, 
  Settings, 
  LogOut, 
  Moon, 
  Sun, 
  Languages,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { WeeklyActivityChart } from '../components/WeeklyActivityChart';
import { RecentAttempts } from '../components/RecentAttempts';
import { HTMLRenderer } from '../components/HTMLRenderer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Apply dark mode on mount and change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className="h-screen flex flex-col bg-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:bg-gradient-to-br relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-transparent dark:bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-transparent dark:bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-transparent dark:bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="flex-none z-50 bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-slate-900 dark:to-slate-900 dark:bg-slate-900 backdrop-blur-xl border-b border-emerald-600 dark:border-slate-700/50 shadow-lg shadow-emerald-500/30 dark:shadow-slate-900/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 dark:bg-gradient-to-br dark:from-emerald-400 dark:to-teal-500 rounded-xl blur-sm group-hover:blur-md transition-all dark:opacity-50"></div>
                <BookOpen className="w-8 h-8 text-white dark:text-emerald-400 relative drop-shadow-lg" />
              </div>
              <span className="text-xl font-black text-white dark:bg-gradient-to-r dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 dark:bg-clip-text dark:text-transparent drop-shadow-md">
                {t('common.appName')}
              </span>
            </Link>

            {/* Right Icons */}
            <div className="flex items-center space-x-2">
              {/* History */}
              <button
                onClick={() => navigate('/history')}
                className="p-2.5 text-white dark:text-emerald-400 hover:bg-white/20 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-110 hover:shadow-lg hover:shadow-white/30 dark:hover:shadow-emerald-900/50"
                title={t('nav.history')}
              >
                <History className="w-5 h-5" />
              </button>

              {/* Admin (only for ADMIN role) */}
              {user?.role?.toUpperCase() === 'ADMIN' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2.5 text-white dark:text-emerald-400 hover:bg-white/20 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-110 hover:shadow-lg hover:shadow-white/30 dark:hover:shadow-emerald-900/50"
                  title="Admin"
                >
                  <Shield className="w-5 h-5" />
                </button>
              )}

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center space-x-1 px-3 py-2.5 text-white dark:text-emerald-400 hover:bg-white/20 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-110 hover:shadow-lg hover:shadow-white/30 dark:hover:shadow-emerald-900/50"
                >
                  <Languages className="w-5 h-5" />
                  <span className="text-sm font-medium">{currentLanguage.flag}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showLangMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowLangMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-emerald-100 dark:border-slate-700 py-2 z-20 overflow-hidden">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center space-x-3 transition-all ${
                            i18n.language === lang.code ? 'text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50/50 dark:bg-emerald-900/10' : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <span className="text-xl">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 text-white dark:text-amber-400 hover:bg-white/20 dark:hover:bg-amber-900/20 rounded-xl transition-all hover:scale-110 hover:shadow-lg hover:shadow-white/30 dark:hover:shadow-amber-900/50 hover:rotate-12"
                title={t('settings.darkMode')}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 hover:bg-white/20 dark:hover:bg-emerald-900/20 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-white/30 dark:hover:shadow-emerald-900/50"
                >
                  {user?.urlAvatar ? (
                    <img
                      src={user.urlAvatar}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-emerald-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-gradient-to-br dark:from-emerald-600 dark:to-teal-700 flex items-center justify-center text-emerald-600 dark:text-white font-bold shadow-lg">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <ChevronDown className="w-4 h-4 text-white dark:text-emerald-400" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-emerald-100 dark:border-slate-700 py-2 z-20 overflow-hidden">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b-2 border-emerald-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                        <HTMLRenderer
                          content={user?.full_name || ''}
                          className="text-sm font-bold text-gray-900 dark:text-white"
                        />
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate mt-1">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/profile');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center space-x-3 transition-all group"
                        >
                          <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{t('nav.profile')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            navigate('/settings');
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 flex items-center space-x-3 transition-all group"
                        >
                          <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:rotate-45 transition-all" />
                          <span className="font-medium">{t('nav.settings')}</span>
                        </button>
                      </div>

                      <div className="border-t-2 border-emerald-100 dark:border-slate-700 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-all group font-medium"
                      >
                        <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span>{t('auth.logout')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Right Sidebar */}
      <div className="flex-1 flex max-w-screen-2xl mx-auto w-full relative overflow-hidden">
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {children}
        </main>

        {/* Fixed Right Sidebar - Always visible on desktop */}
        <aside className="hidden lg:block w-80 flex-none border-l-2 border-emerald-200 dark:border-slate-700 bg-gradient-to-b from-emerald-50/50 to-teal-50/30 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden shadow-xl">
          {/* Decorative accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent dark:from-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-400/10 to-transparent dark:from-teal-500/10 rounded-full blur-2xl"></div>
          
          <div className="h-full flex flex-col space-y-4 py-4 px-3 relative z-10">
            {/* Weekly Activity Chart - 33% */}
            <div className="h-[33%] flex-none group bg-white dark:bg-slate-800/80 rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-slate-700 p-4 hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden backdrop-blur-sm">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 rounded-xl"></div>
                <WeeklyActivityChart />
              </div>
            </div>

            {/* Recent Attempts - 75% */}
            <div className="flex-1 min-h-0 group bg-white dark:bg-slate-800/80 rounded-2xl shadow-lg border-2 border-emerald-200 dark:border-slate-700 p-4 hover:shadow-2xl hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-1 transition-all duration-300 overflow-hidden backdrop-blur-sm">
              <div className="relative h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-900/10 rounded-xl pointer-events-none"></div>
                <div className="relative h-full overflow-y-auto">
                  <RecentAttempts />
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
