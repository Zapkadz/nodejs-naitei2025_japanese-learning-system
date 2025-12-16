import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useForm, required, email, minLength, matchField } from '../../hooks';

export interface RegisterFormProps {
  onSubmit: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState('');

  const { formState, setValue, setTouched, validateAll, reset } = useForm(
    {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    {
      fullName: [required(t('auth.fullNameRequired', 'Full name is required'))],
      email: [
        required(t('auth.emailRequired', 'Email is required')),
        email(t('auth.invalidEmail', 'Invalid email address')),
      ],
      password: [
        required(t('auth.passwordRequired', 'Password is required')),
        minLength(6, t('auth.passwordTooShort', 'Password must be at least 6 characters')),
      ],
      confirmPassword: [
        required(t('auth.confirmPasswordRequired', 'Please confirm your password')),
        matchField('password', t('auth.passwordMismatch', 'Passwords do not match')),
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
      await onSubmit(
        formState.fullName.value,
        formState.email.value,
        formState.password.value,
        formState.confirmPassword.value
      );
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
        type="text"
        label={t('auth.fullName')}
        value={formState.fullName.value}
        onChange={(e) => setValue('fullName', e.target.value)}
        onBlur={() => setTouched('fullName')}
        error={formState.fullName.touched ? formState.fullName.error : undefined}
        icon={<User className="w-5 h-5" />}
        placeholder="John Doe"
        required
      />

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

      <Input
        type="password"
        label={t('auth.confirmPassword')}
        value={formState.confirmPassword.value}
        onChange={(e) => setValue('confirmPassword', e.target.value)}
        onBlur={() => setTouched('confirmPassword')}
        error={formState.confirmPassword.touched ? formState.confirmPassword.error : undefined}
        icon={<Lock className="w-5 h-5" />}
        placeholder="••••••••"
        required
      />

      <Button type="submit" isLoading={isLoading} fullWidth>
        {t('auth.register')}
      </Button>
    </form>
  );
}
