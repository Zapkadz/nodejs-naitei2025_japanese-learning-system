// Common validation rules for forms

export const required = (message: string = 'This field is required') => (value: string) => {
  if (!value || !value.trim()) {
    return message;
  }
  return undefined;
};

export const email = (message: string = 'Invalid email address') => (value: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (value && !emailRegex.test(value)) {
    return message;
  }
  return undefined;
};

export const minLength = (min: number, message?: string) => (value: string) => {
  if (value && value.length < min) {
    return message || `Must be at least ${min} characters`;
  }
  return undefined;
};

export const maxLength = (max: number, message?: string) => (value: string) => {
  if (value && value.length > max) {
    return message || `Must be at most ${max} characters`;
  }
  return undefined;
};

export const matchField = (fieldName: string, message?: string) => (value: string, formState?: any) => {
  if (formState && formState[fieldName]) {
    const otherValue = formState[fieldName].value;
    if (value !== otherValue) {
      return message || `Must match ${fieldName}`;
    }
  }
  return undefined;
};

export const pattern = (regex: RegExp, message: string = 'Invalid format') => (value: string) => {
  if (value && !regex.test(value)) {
    return message;
  }
  return undefined;
};
