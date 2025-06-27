
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';

interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  data?: T;
}

export const useFormValidation = <T extends Record<string, any>>(
  schema: z.ZodSchema<T>
) => {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isValidating, setIsValidating] = useState(false);

  const validate = useCallback(async (data: unknown): Promise<ValidationResult<T>> => {
    setIsValidating(true);
    setErrors({});

    try {
      const validData = schema.parse(data);
      setIsValidating(false);
      return {
        isValid: true,
        errors: {},
        data: validData
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        
        error.errors.forEach((err) => {
          const path = err.path.join('.') as keyof T;
          fieldErrors[path] = err.message;
        });

        setErrors(fieldErrors);
        setIsValidating(false);

        // Mostrar toast con el primer error
        const firstError = Object.values(fieldErrors)[0];
        if (firstError) {
          toast.error('Error de validación', {
            description: firstError
          });
        }

        return {
          isValid: false,
          errors: fieldErrors
        };
      }

      setIsValidating(false);
      toast.error('Error de validación inesperado');
      
      return {
        isValid: false,
        errors: { root: 'Error de validación inesperado' } as Partial<Record<keyof T, string>>
      };
    }
  }, [schema]);

  const validateField = useCallback(async (
    fieldName: keyof T, 
    value: any
  ): Promise<boolean> => {
    try {
      // Solo intentar validar campos individuales si el schema es un ZodObject
      if (schema instanceof z.ZodObject) {
        const fieldSchema = schema.shape[fieldName as string];
        if (fieldSchema) {
          fieldSchema.parse(value);
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
          return true;
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors[0]?.message || 'Error de validación';
        setErrors(prev => ({
          ...prev,
          [fieldName]: errorMessage
        }));
        return false;
      }
    }
    return false;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  return {
    validate,
    validateField,
    errors,
    clearErrors,
    clearFieldError,
    isValidating,
    hasErrors: Object.keys(errors).length > 0
  };
};
