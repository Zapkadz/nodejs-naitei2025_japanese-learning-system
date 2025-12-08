/**
 * Admin Layout
 * Modern layout for admin pages without right sidebar
 */

import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Globe, LogOut, Home, Shield, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLangMenu(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isDark = document.documentElement.classList.contains('dark');

  const getCurrentLanguageName = () => {
    const langMap: Record<string, string> = {
      en: 'English',
      ja: '日本語',
      vi: 'Tiếng Việt'
    };
    return langMap[i18n.language] || 'English';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-purple-900/10">
      {/* Modern Admin Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Title */}
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-2.5 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400">
                  Admin Panel
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Quản trị hệ thống</p>
              </div>
            </Link>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Back to Dashboard */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105"
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden md:inline">{getCurrentLanguageName()}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                </button>
                {showLangMenu && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button
                      onClick={() => changeLanguage('en')}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                        i18n.language === 'en' 
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => changeLanguage('ja')}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                        i18n.language === 'ja' 
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      日本語
                    </button>
                    <button
                      onClick={() => changeLanguage('vi')}
                      className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                        i18n.language === 'vi' 
                          ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      Tiếng Việt
                    </button>
                  </div>
                )}
              </div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105"
              >
                {isDark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2"></div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {user?.full_name || 'Admin'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {user?.role || 'ADMIN'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {user?.full_name || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {user?.email || 'admin@example.com'}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width, No Sidebar */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
