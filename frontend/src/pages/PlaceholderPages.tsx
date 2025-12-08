/**
 * Placeholder Pages
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  User,
  Settings,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  Upload,
  X
} from 'lucide-react';
import { dataService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { TestAttemptsList } from '../components/TestAttemptsList';
import { HTMLRenderer } from '../components/HTMLRenderer';
import type { ITestAttempt } from '../types';

export function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [testAttempts, setTestAttempts] = useState<ITestAttempt[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      console.log('Loading history for user:', user?.id);
      const data = await dataService.getTestAttempts(user!.id);
      console.log('Test attempts loaded:', data.length, data);
      setTestAttempts(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const completedTests = testAttempts.filter(t => t.is_completed).length;
  const incompleteTests = testAttempts.filter(t => !t.is_completed).length;
  const avgScore = testAttempts.length > 0
    ? testAttempts.filter(t => t.total_score !== null).reduce((sum, t) => sum + (t.total_score || 0), 0) / testAttempts.filter(t => t.total_score !== null).length
    : 0;
  const highestScore = testAttempts.length > 0
    ? Math.max(...testAttempts.map(t => t.total_score || 0))
    : 0;

  // Generate activity heatmap data (full year - 53 weeks)
  const generateActivityData = () => {
    const year = selectedYear;
    const startDate = new Date(year, 0, 1); // January 1st
    
    // Adjust to start from Sunday
    const startDay = startDate.getDay();
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - startDay);

    const activityMap = new Map<string, number>();
    
    // Count attempts per day
    testAttempts.forEach(attempt => {
      const attemptDate = new Date(attempt.started_at);
      if (attemptDate.getFullYear() === year) {
        const date = attemptDate.toISOString().split('T')[0];
        activityMap.set(date, (activityMap.get(date) || 0) + 1);
      }
    });

    // Generate grid data (53 weeks * 7 days)
    const data: { date: string; count: number; day: number; week: number }[] = [];
    for (let week = 0; week < 53; week++) {
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(adjustedStart);
        currentDate.setDate(adjustedStart.getDate() + (week * 7) + day);
        const dateStr = currentDate.toISOString().split('T')[0];
        data.push({
          date: dateStr,
          count: activityMap.get(dateStr) || 0,
          day,
          week,
        });
      }
    }
    return data;
  };

  const activityData = generateActivityData();

  // Get available years - show last 5 years
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: 5 }, 
    (_, i) => currentYear - i
  );

  const getActivityColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700';
    if (count === 1) return 'bg-emerald-200 dark:bg-emerald-500/60 border border-emerald-300 dark:border-emerald-400';
    if (count === 2) return 'bg-emerald-400 dark:bg-emerald-500/80 border border-emerald-500 dark:border-emerald-300';
    if (count === 3) return 'bg-emerald-500 dark:bg-emerald-400/90 border border-emerald-600 dark:border-emerald-200';
    return 'bg-emerald-600 dark:bg-emerald-300 border border-emerald-700 dark:border-emerald-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-2">
          {t('history.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Section 1: Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-emerald-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 dark:bg-emerald-500/30 flex items-center justify-center shadow-md">
              <CheckCircle className="w-5 h-5 text-white dark:text-emerald-300" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {completedTests}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('history.completedTests')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-orange-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-orange-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-600 dark:bg-amber-500/30 flex items-center justify-center shadow-md">
              <Clock className="w-5 h-5 text-white dark:text-amber-300" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {incompleteTests}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('history.incompleteTests')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-blue-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 dark:bg-sky-500/30 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white dark:text-sky-300" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {avgScore.toFixed(0)}%
            </div>
          </div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {t('history.avgScore')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-2 border-purple-200 dark:border-slate-800 shadow-md hover:shadow-2xl hover:border-purple-500 hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 dark:bg-violet-500/30 flex items-center justify-center shadow-md">
              <Award className="w-5 h-5 text-white dark:text-violet-300" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {highestScore}%
            </div>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('history.highScore')}
          </div>
        </div>
      </div>

      {/* Section 2: Activity Heatmap */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border-2 border-emerald-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('history.activityHeatmap')}
            </h2>
          </div>
          
          {/* Year Selector */}
          <div className="flex gap-2">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-105'
                    : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border-2 border-emerald-200 dark:border-slate-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex gap-[3px] mb-2 ml-8">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={month} className="text-xs text-gray-500 dark:text-gray-300" style={{ width: `${(53 / 12) * 11}px` }}>
                  {i % 2 === 0 ? month : ''}
                </div>
              ))}
            </div>
            
            {/* Heatmap grid */}
            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] mr-2">
                <div className="h-[11px]" />
                <div className="h-[11px] text-xs text-gray-500 dark:text-gray-300">Mon</div>
                <div className="h-[11px]" />
                <div className="h-[11px] text-xs text-gray-500 dark:text-gray-300">Wed</div>
                <div className="h-[11px]" />
                <div className="h-[11px] text-xs text-gray-500 dark:text-gray-300">Fri</div>
                <div className="h-[11px]" />
              </div>
              
              {/* Week columns */}
              {Array.from({ length: 53 }).map((_, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dataIndex = weekIndex * 7 + dayIndex;
                    const data = activityData[dataIndex];
                    const date = new Date(data?.date || '');
                    const isCurrentYear = date.getFullYear() === selectedYear;
                    
                    return (
                      <div
                        key={dayIndex}
                        className={`w-[11px] h-[11px] rounded-sm ${
                          isCurrentYear ? getActivityColor(data?.count || 0) : 'bg-emerald-50/50 dark:bg-slate-800/50'
                        } transition-all hover:ring-2 hover:ring-emerald-400 dark:hover:ring-emerald-500 cursor-pointer`}
                        title={`${data?.date || ''}: ${data?.count || 0} tests`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-300 font-medium">
              <span>{t('history.legend')}</span>
              <div className="flex gap-1">
                <div className="w-[11px] h-[11px] rounded-sm bg-gray-100 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-200 dark:bg-emerald-500/60 border border-emerald-300 dark:border-emerald-400" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-400 dark:bg-emerald-500/80 border border-emerald-500 dark:border-emerald-300" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-500 dark:bg-emerald-400/90 border border-emerald-600 dark:border-emerald-200" />
                <div className="w-[11px] h-[11px] rounded-sm bg-emerald-600 dark:bg-emerald-300 border border-emerald-700 dark:border-emerald-100" />
              </div>
              <span>{t('history.legendMore')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Test Attempts List */}
      <TestAttemptsList 
        attempts={testAttempts}
        showTitle={true}
      />
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    urlAvatar: user?.urlAvatar || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [previewAvatar, setPreviewAvatar] = useState(user?.urlAvatar || '');
  const [tempAvatar, setTempAvatar] = useState(user?.urlAvatar || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        urlAvatar: user.urlAvatar || '',
      });
      setPreviewAvatar(user.urlAvatar || '');
      setTempAvatar(user.urlAvatar || '');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert(t('profile.selectImage'));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('profile.maxSize'));
        return;
      }
      setSelectedFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setTempAvatar('');
  };

  const handleSaveAvatar = async () => {
    if (selectedFile) {
      setIsSaving(true);
      try {
        // TODO: Upload file to server and get URL
        // const formData = new FormData();
        // formData.append('avatar', selectedFile);
        // const response = await dataService.uploadAvatar(formData);
        // const avatarUrl = response.url;
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
        console.log('Uploading file:', selectedFile.name);
        
        setPreviewAvatar(tempAvatar);
        setFormData(prev => ({ ...prev, urlAvatar: tempAvatar }));
        setShowAvatarModal(false);
        setSelectedFile(null);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        alert(t('common.error'));
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancelAvatar = () => {
    setTempAvatar(previewAvatar);
    setSelectedFile(null);
    setShowAvatarModal(false);
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(t('profile.confirmNewPassword'));
      return;
    }
    setIsSaving(true);
    try {
      // TODO: Call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Changing password');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordModal(false);
      alert(t('profile.passwordSuccess'));
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      console.log('Saving profile:', formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        urlAvatar: user.urlAvatar || '',
      });
      setPreviewAvatar(user.urlAvatar || '');
      setTempAvatar(user.urlAvatar || '');
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 mb-2">
          {t('profile.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-800 overflow-hidden">
        {/* Cover with Avatar */}
        <div className="relative h-32 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500">
          <div className="absolute -bottom-16 left-8">
            <div className="relative">
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl"
                  onError={() => setPreviewAvatar('')}
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-5xl font-black border-4 border-white dark:border-slate-900 shadow-xl">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all cursor-pointer border-2 border-white dark:border-slate-900"
              >
                <Edit2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <HTMLRenderer
                content={user?.full_name || ''}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-1"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-300/50 dark:border-emerald-700/50">
                  {user?.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                </span>
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all"
              >
                <Settings className="w-4 h-4" />
                {t('profile.editProfile')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      {t('profile.updating')}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {t('common.save')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Change Password Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-600 transition-all hover:scale-105"
            >
              <Lock className="w-4 h-4" />
              {t('profile.changePassword')}
            </button>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            {/* Full Name */}
            <div className="group">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                {t('profile.fullName')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="例: 田中太郎"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                  <HTMLRenderer
                    content={formData.full_name || user?.full_name || ''}
                    className="text-gray-900 dark:text-white font-medium"
                  />
                </div>
              )}
            </div>

            {/* Email - Read Only */}
            <div className="group">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                {t('profile.email')}
              </label>
              <div className="px-4 py-3 bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  {formData.email || user?.email || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black">0</div>
          </div>
          <p className="text-sm font-bold opacity-90">{t('history.completedTests')}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black">0%</div>
          </div>
          <p className="text-sm font-bold opacity-90">{t('history.avgScore')}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-3xl font-black">0h</div>
          </div>
          <p className="text-sm font-bold opacity-90">{t('profile.studyTime')}</p>
        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleCancelAvatar} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('profile.changeAvatar')}
              </h3>
              
              <div className="space-y-4">
                {/* Preview */}
                <div className="flex justify-center">
                  <div className="relative">
                    {tempAvatar ? (
                      <img
                        src={tempAvatar}
                        alt="Preview"
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-emerald-200 dark:border-emerald-800 shadow-lg"
                        onError={() => {
                          setTempAvatar('');
                          setSelectedFile(null);
                        }}
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white text-5xl font-black border-4 border-emerald-200 dark:border-emerald-800 shadow-lg">
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    {tempAvatar && (
                      <button
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('profile.uploadAvatar')}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="font-medium">
                        {selectedFile ? selectedFile.name : t('profile.uploadAvatar')}
                      </span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {t('profile.maxSize')}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelAvatar}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSaveAvatar}
                    disabled={isSaving || !selectedFile}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSaving ? t('profile.updating') : t('common.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowPasswordModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('profile.changePasswordTitle')}
              </h3>
              
              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('profile.currentPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('profile.newPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {t('profile.confirmNewPassword')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setShowPasswordModal(false);
                    }}
                    disabled={isSaving}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleSavePassword}
                    disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isSaving ? t('profile.updating') : t('profile.updatePassword')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>
      <p className="text-gray-600 dark:text-gray-400">
        Settings page coming soon...
      </p>
    </div>
  );
}
