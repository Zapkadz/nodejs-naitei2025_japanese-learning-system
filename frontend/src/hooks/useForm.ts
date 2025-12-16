import { useState } from 'react';

export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface ValidationRules {
  [key: string]: Array<(value: string, formState?: FormState) => string | undefined>;
}

export function useForm(initialState: { [key: string]: string }, validationRules?: ValidationRules) {
  const [formState, setFormState] = useState<FormState>(() => {
    const state: FormState = {};
    Object.keys(initialState).forEach((key) => {
      state[key] = {
        value: initialState[key],
        touched: false,
      };
    });
    return state;
  });

  const setValue = (field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        value,
        error: undefined,
      },
    }));
  };

  const setError = (field: string, error: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      },
    }));
  };

  const setTouched = (field: string) => {
    setFormState((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: true,
      },
    }));
  };

  const validateField = (field: string): boolean => {
    if (!validationRules || !validationRules[field]) return true;

    const rules = validationRules[field];
    const value = formState[field].value;

    for (const rule of rules) {
      const error = rule(value, formState);
      if (error) {
        setError(field, error);
        return false;
      }
    }

    setError(field, '');
    return true;
  };

  const validateAll = (): boolean => {
    let isValid = true;
    Object.keys(formState).forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    return isValid;
  };

  const reset = () => {
    const state: FormState = {};
    Object.keys(initialState).forEach((key) => {
      state[key] = {
        value: initialState[key],
        touched: false,
      };
    });
    setFormState(state);
  };

  const getValues = () => {
    const values: { [key: string]: string } = {};
    Object.keys(formState).forEach((key) => {
      values[key] = formState[key].value;
    });
    return values;
  };

  return {
    formState,
    setValue,
    setError,
    setTouched,
    validateField,
    validateAll,
    reset,
    getValues,
  };
}
