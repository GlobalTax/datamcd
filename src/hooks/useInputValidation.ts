import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

// Common validation schemas
export const emailSchema = z.string().email('Email inválido');
export const passwordSchema = z.string().min(8, 'La contraseña debe tener al menos 8 caracteres');
export const nameSchema = z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre no puede tener más de 50 caracteres');
export const phoneSchema = z.string().regex(/^[+]?[0-9\s\-\(\)]{9,}$/, 'Número de teléfono inválido');

// Sanitization functions
export const sanitizeString = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/[^\d+\-\s\(\)]/g, '');
};

// Input validation hook
export const useInputValidation = () => {
  const validateAndSanitize = <T>(
    data: any,
    schema: z.ZodSchema<T>,
    sanitizers?: Record<string, (value: any) => any>
  ): { success: boolean; data?: T; errors?: string[] } => {
    try {
      // Apply sanitizers if provided
      let sanitizedData = { ...data };
      if (sanitizers) {
        Object.keys(sanitizers).forEach(key => {
          if (sanitizedData[key] !== undefined) {
            sanitizedData[key] = sanitizers[key](sanitizedData[key]);
          }
        });
      }

      // Validate with schema
      const result = schema.parse(sanitizedData);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => err.message);
        errors.forEach(error => {
          toast({
            title: 'Error de validación',
            description: error,
            variant: 'destructive',
          });
        });
        return { success: false, errors };
      }
      return { success: false, errors: ['Error de validación desconocido'] };
    }
  };

  const validateEmail = (email: string): boolean => {
    const result = emailSchema.safeParse(sanitizeEmail(email));
    if (!result.success) {
      toast({
        title: 'Email inválido',
        description: result.error.errors[0]?.message,
        variant: 'destructive',
      });
    }
    return result.success;
  };

  const validatePassword = (password: string): boolean => {
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      toast({
        title: 'Contraseña inválida',
        description: result.error.errors[0]?.message,
        variant: 'destructive',
      });
    }
    return result.success;
  };

  return {
    validateAndSanitize,
    validateEmail,
    validatePassword,
    sanitizeString,
    sanitizeEmail,
    sanitizePhone,
  };
};

// User creation validation schema
export const userCreationSchema = z.object({
  email: emailSchema,
  full_name: nameSchema,
  role: z.enum(['admin', 'superadmin', 'franchisee', 'staff']),
  password: passwordSchema.optional(),
});

// Contact validation schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  company: z.string().max(100, 'El nombre de la empresa no puede tener más de 100 caracteres').optional(),
  contact_type: z.string().min(1, 'El tipo de contacto es requerido'),
  specialization: z.string().max(200, 'La especialización no puede tener más de 200 caracteres').optional(),
  address: z.string().max(500, 'La dirección no puede tener más de 500 caracteres').optional(),
  notes: z.string().max(1000, 'Las notas no pueden tener más de 1000 caracteres').optional(),
});

// Incident validation schema
export const incidentSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede tener más de 200 caracteres'),
  description: z.string().max(2000, 'La descripción no puede tener más de 2000 caracteres').optional(),
  type: z.string().min(1, 'El tipo de incidencia es requerido'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['pending', 'in_progress', 'resolved', 'closed']),
});