import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Settings, Edit2, Lock, Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { dataService } from '../services';
import { useAuthStore } from '../store/useAuthStore';
import { HTMLRenderer } from '../components/HTMLRenderer';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import type { IUserUpdate } from '../types';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    urlAvatar: user?.urlAvatar || '',
    currentPassword: '', // Required by backend for profile updates
  });
  const [previewAvatar, setPreviewAvatar] = useState(user?.urlAvatar || '');
  const [tempAvatar, setTempAvatar] = useState(user?.urlAvatar || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        urlAvatar: user.urlAvatar || '',
        currentPassword: '',
      });
      setPreviewAvatar(user.urlAvatar || '');
      setTempAvatar(user.urlAvatar || '');
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      setError(null);
      try {
        const updatedUser = await dataService.uploadAvatar(selectedFile);
        
        // Update local state and auth store
        updateUser(updatedUser);
        setPreviewAvatar(updatedUser.urlAvatar || '');
        setTempAvatar(updatedUser.urlAvatar || '');
        setFormData(prev => ({ ...prev, urlAvatar: updatedUser.urlAvatar || '' }));
        
        setShowAvatarModal(false);
        setSelectedFile(null);
        setSuccessMessage(t('profile.avatarSuccess'));
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
        const errorMessage = error instanceof Error ? error.message : t('common.error');
        setError(errorMessage);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancelAvatar = () => {
    setTempAvatar(previewAvatar);
    setSelectedFile(null);
    setShowAvatarModal(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    
    // Validate current password is provided
    if (!formData.currentPassword.trim()) {
      setError(t('profile.currentPasswordRequired'));
      setIsSaving(false);
      return;
    }
    
    try {
      const updateData: IUserUpdate & { currentPassword: string } = {
        full_name: formData.full_name,
        currentPassword: formData.currentPassword,
      };
      
      const updatedUser = await dataService.updateUser(updateData);
      updateUser(updatedUser);
      
      setIsEditing(false);
      setFormData(prev => ({ ...prev, currentPassword: '' })); // Clear password after save
      setSuccessMessage(t('profile.updateSuccess'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save profile:', error);
      const errorMessage = error instanceof Error ? error.message : t('common.error');
      setError(errorMessage);
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
        currentPassword: '',
      });
      setPreviewAvatar(user.urlAvatar || '');
      setTempAvatar(user.urlAvatar || '');
    }
    setIsEditing(false);
    setError(null);
  };

  const handlePasswordSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
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

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg animate-pulse">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-200">{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

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
                  {user?.role === 'ADMIN' ? 'Admin' : 'User'}
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
                      <Loader2 className="w-4 h-4 animate-spin" />
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

            {/* Current Password - Required when editing */}
            {isEditing && (
              <div className="group">
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                  {t('profile.currentPassword')} *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={t('profile.enterCurrentPassword')}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('profile.currentPasswordHelper')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Avatar Modal */}
      {showAvatarModal && createPortal(
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={handleCancelAvatar} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {t('profile.changeAvatar')}
              </h3>
              
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-500 dark:border-red-600 rounded-lg flex items-center space-x-2 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
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
        </>,
        document.body
      )}

      {/* Password Modal */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
    </div>
  );
}
