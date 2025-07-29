import { useState, useCallback } from 'react';
import { validateEmail, validateTextInput, validateMaintenanceContent } from '@/utils/securityUtils';

interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface UseSecureFormOptions {
  onSubmit: (data: Record<string, string>) => Promise<void> | void;
  validators?: Record<string, (value: string) => string | null>;
}

/**
 * Secure form hook with built-in validation and sanitization
 */
export const useSecureForm = (initialValues: Record<string, string>, options: UseSecureFormOptions) => {
  const [fields, setFields] = useState<Record<string, FormField>>(() => {
    const initialFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      initialFields[key] = {
        value: initialValues[key],
        error: null,
        touched: false
      };
    });
    return initialFields;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: string, value: string): string | null => {
    // Custom validator first
    if (options.validators?.[name]) {
      const customError = options.validators[name](value);
      if (customError) return customError;
    }

    // Built-in validators
    switch (name) {
      case 'email':
        return validateEmail(value) ? null : 'Please enter a valid email address';
      
      case 'firstName':
      case 'lastName':
        const nameResult = validateTextInput(value, 50);
        return nameResult.isValid ? null : 'Name must be between 1 and 50 characters';
      
      case 'password':
        if (!value || value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        return null;
      
      case 'confirmPassword':
        const passwordValue = fields.password?.value || '';
        return value === passwordValue ? null : 'Passwords do not match';
      
      case 'title':
      case 'propertyName':
        const titleResult = validateTextInput(value, 100);
        return titleResult.isValid ? null : 'Title must be between 1 and 100 characters';
      
      case 'description':
        const descResult = validateMaintenanceContent(value);
        return descResult.isValid ? null : 'Description must be between 1 and 5000 characters';
      
      case 'address':
        const addressResult = validateTextInput(value, 500);
        return addressResult.isValid ? null : 'Address must be between 1 and 500 characters';
      
      default:
        const defaultResult = validateTextInput(value);
        return defaultResult.isValid ? null : 'Invalid input';
    }
  }, [fields, options.validators]);

  const updateField = useCallback((name: string, value: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        value,
        error: prev[name]?.touched ? validateField(name, value) : null,
        touched: prev[name]?.touched || false
      }
    }));
  }, [validateField]);

  const touchField = useCallback((name: string) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
        error: validateField(name, prev[name]?.value || '')
      }
    }));
  }, [validateField]);

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(newFields).forEach(name => {
      const error = validateField(name, newFields[name].value);
      newFields[name] = {
        ...newFields[name],
        touched: true,
        error
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      if (!validateAll()) {
        return;
      }

      const data: Record<string, string> = {};
      Object.keys(fields).forEach(key => {
        data[key] = fields[key].value.trim();
      });

      await options.onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, isSubmitting, validateAll, options.onSubmit]);

  const reset = useCallback(() => {
    const resetFields: Record<string, FormField> = {};
    Object.keys(initialValues).forEach(key => {
      resetFields[key] = {
        value: initialValues[key],
        error: null,
        touched: false
      };
    });
    setFields(resetFields);
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback((name: string) => ({
    value: fields[name]?.value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      updateField(name, e.target.value),
    onBlur: () => touchField(name),
    error: fields[name]?.error,
    hasError: !!(fields[name]?.touched && fields[name]?.error)
  }), [fields, updateField, touchField]);

  const hasErrors = Object.values(fields).some(field => field.touched && field.error);
  const isValid = Object.values(fields).every(field => !field.error);

  return {
    fields,
    getFieldProps,
    handleSubmit,
    reset,
    isSubmitting,
    hasErrors,
    isValid,
    updateField,
    touchField
  };
};