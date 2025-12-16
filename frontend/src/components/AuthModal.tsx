import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Modal } from './ui/Modal';
import { Alert } from './ui/Alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import { LoginForm } from './forms/LoginForm';
import { RegisterForm } from './forms/RegisterForm';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useForm, required, email } from '../hooks';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TabType = 'login' | 'register' | 'forgot';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { t } = useTranslation();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [successMessage, setSuccessMessage] = useState('');

  const { formState: forgotFormState, setValue: setForgotEmail, reset: resetForgotForm } = useForm(
    { email: '' },
    {
      email: [
        required(t('auth.emailRequired', 'Email is required')),
        email(t('auth.invalidEmail', 'Invalid email address')),
      ],
    }
  );

  const handleClose = () => {
    setSuccessMessage('');
    clearError();
    resetForgotForm();
    onClose();
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as TabType);
    setSuccessMessage('');
    clearError();
    resetForgotForm();
  };

  const handleLogin = async (email: string, password: string) => {
    await login({ email, password });
    setSuccessMessage(t('auth.loginSuccess'));
    setTimeout(() => {
      setSuccessMessage('');
      onSuccess();
    }, 2000);
  };

  const handleRegister = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    await register({ email, password, full_name: fullName, confirm_password: confirmPassword });
    setSuccessMessage(t('auth.registerSuccess'));
    setTimeout(() => {
      setSuccessMessage('');
      onSuccess();
    }, 2000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('auth.resetLinkSent', { email: forgotFormState.email.value }));
    handleTabChange('login');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      {/* Success Message */}
      {successMessage && (
        <Alert variant="success" className="mb-4 animate-pulse">
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Tabs for Login/Register */}
      {activeTab !== 'forgot' && !successMessage && (
        <Tabs value={activeTab} onValueChange={handleTabChange} defaultValue="login">
          <TabsList>
            <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
            <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
            <button
              type="button"
              onClick={() => handleTabChange('forgot')}
              className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {t('auth.forgotPassword')}
            </button>
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      )}

      {/* Forgot Password Form */}
      {activeTab === 'forgot' && !successMessage && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('auth.resetPassword')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('auth.resetPasswordDesc')}
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              type="email"
              label={t('auth.email')}
              value={forgotFormState.email.value}
              onChange={(e) => setForgotEmail('email', e.target.value)}
              icon={<Mail className="w-5 h-5" />}
              placeholder="your@email.com"
              required
            />

            <Button type="submit" fullWidth>
              {t('auth.sendResetLink')}
            </Button>

            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className="w-full text-sm text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              {t('auth.backToLogin')}
            </button>
          </form>
        </div>
      )}
    </Modal>
  );
}
