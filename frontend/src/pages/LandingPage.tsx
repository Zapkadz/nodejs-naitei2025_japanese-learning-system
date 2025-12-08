import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, TrendingUp, Award, ArrowRight, Moon, Sun, Globe } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { AuthModal } from '../components/AuthModal';
import { useAuthStore } from '../store/useAuthStore';

export function LandingPage(): React.ReactElement {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, token, user } = useAuthStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Redirect to appropriate page if already authenticated
  useEffect(() => {
    if (isAuthenticated && token && user) {
      const destination = user.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, token, user, navigate]);

  // Handle theme toggle
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleStart = () => {
    if (isAuthenticated && token && user) {
      const destination = user.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(destination);
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setTimeout(() => {
      const { user } = useAuthStore.getState();
      const destination = user?.role?.toUpperCase() === 'ADMIN' ? '/admin' : '/dashboard';
      navigate(destination);
    }, 100);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  return (
    <AuthLayout>
      <div className="h-screen w-full overflow-hidden relative">
        
        {/* Top Bar - Theme & Language */}
        <div className="absolute top-6 right-6 flex items-center gap-3 z-50">
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-emerald-100 dark:border-gray-700"
            >
              <Globe className="w-5 h-5 text-emerald-600 dark:text-gray-300" />
            </button>
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-emerald-100 dark:border-gray-700 overflow-hidden backdrop-blur-md">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`w-full px-4 py-3 text-left hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                      i18n.language === lang.code ? 'bg-emerald-100 dark:bg-emerald-900/20 font-semibold' : ''
                    }`}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-emerald-100 dark:border-gray-700"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-emerald-600" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="h-full flex items-center justify-center px-6">
          <div className="max-w-6xl w-full">
            
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-8">
              
              {/* Title with gradient */}
              <div className="space-y-4">
                <div className="inline-block">
                  <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent leading-tight">
                    {t('landing.title')}
                  </h1>
                  <div className="h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full mt-3 mx-auto w-3/4"></div>
                </div>
                <p className="text-lg lg:text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
                  {t('landing.subtitle')}
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleStart}
                  className="group relative px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 dark:from-emerald-600 dark:to-teal-700 dark:hover:from-emerald-700 dark:hover:to-teal-800 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  <span className="relative">{t('landing.start')}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative" />
                </button>
                
                {/* JLPT Levels */}
                <div className="flex items-center gap-2">
                  {['N5', 'N4', 'N3', 'N2', 'N1'].map((level, index) => (
                    <div
                      key={level}
                      className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl text-sm font-black text-emerald-600 dark:text-emerald-400 hover:scale-110 transition-all border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features - Elegant Cards */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              
              {/* Feature 1 */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 text-center shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t('landing.features.practice')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('landing.features.practiceDesc')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 text-center shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t('landing.features.tracking')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('landing.features.trackingDesc')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-5 text-center shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500">
                <div className="w-14 h-14 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t('landing.features.feedback')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t('landing.features.feedbackDesc')}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-12 mt-12">
        
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-gray-500 dark:text-gray-400 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            © 2025 JLPT Master
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </AuthLayout>
  );
}
