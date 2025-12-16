import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useForm, required, email, minLength } from '../../hooks';

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState('');

  const { formState, setValue, setTouched, validateAll, reset } = useForm(
    {
      email: '',
      password: '',
    },
    {
      email: [
        required(t('auth.emailRequired', 'Email is required')),
        email(t('auth.invalidEmail', 'Invalid email address')),
      ],
      password: [
        required(t('auth.passwordRequired', 'Password is required')),
        minLength(6, t('auth.passwordTooShort', 'Password must be at least 6 characters')),
      ],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateAll()) {
      return;
    }

    try {
      await onSubmit(formState.email.value, formState.password.value);
      reset();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t('common.error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {serverError}
        </div>
      )}

      <Input
        type="email"
        label={t('auth.email')}
        value={formState.email.value}
        onChange={(e) => setValue('email', e.target.value)}
        onBlur={() => setTouched('email')}
        error={formState.email.touched ? formState.email.error : undefined}
        icon={<Mail className="w-5 h-5" />}
        placeholder="your@email.com"
        required
      />

      <Input
        type="password"
        label={t('auth.password')}
        value={formState.password.value}
        onChange={(e) => setValue('password', e.target.value)}
        onBlur={() => setTouched('password')}
        error={formState.password.touched ? formState.password.error : undefined}
        icon={<Lock className="w-5 h-5" />}
        placeholder="••••••••"
        required
      />

      <Button type="submit" isLoading={isLoading} fullWidth>
        {t('auth.login')}
      </Button>
    </form>
  );
}
