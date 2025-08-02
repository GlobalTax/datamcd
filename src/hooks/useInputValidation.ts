import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

// Enhanced validation schemas with security focus
export const emailSchema = z.string()
  .email('Email inválido')
  .max(254, 'Email demasiado largo') // RFC 5321 maximum
  .refine(email => !email.includes('<script'), 'Email contiene contenido sospechoso')
  .refine(email => !/[<>"']/g.test(email), 'Email contiene caracteres no permitidos');

export const passwordSchema = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'Contraseña demasiado larga')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

export const nameSchema = z.string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(50, 'El nombre no puede tener más de 50 caracteres')
  .regex(/^[a-zA-ZÀ-ÿ\s\-'\.]+$/, 'El nombre contiene caracteres inválidos')
  .refine(name => !/<[^>]*>/g.test(name), 'El nombre contiene etiquetas HTML');

export const phoneSchema = z.string()
  .min(6, 'Número de teléfono demasiado corto')
  .max(20, 'Número de teléfono demasiado largo')
  .regex(/^[+]?[0-9\s\-\(\)]{6,19}$/, 'Formato de teléfono inválido');

// Enhanced sanitization functions with XSS protection
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/[<>"']/g, '');
};

export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/[^\d+\-\s\(\)]/g, '').trim();
};

export const sanitizeHtml = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Enhanced input validation hook
export const useInputValidation = () => {
  const validateAndSanitize = <T>(
    data: any,
    schema: z.ZodSchema<T>,
    sanitizers?: Record<string, (value: any) => any>
  ): { success: boolean; data?: T; errors?: string[]; warnings?: string[] } => {
    try {
      // Apply sanitizers if provided
      let sanitizedData = { ...data };
      const warnings: string[] = [];
      
      if (sanitizers) {
        Object.keys(sanitizers).forEach(key => {
          if (sanitizedData[key] !== undefined) {
            const original = sanitizedData[key];
            sanitizedData[key] = sanitizers[key](sanitizedData[key]);
            
            // Check if sanitization changed the value
            if (original !== sanitizedData[key]) {
              warnings.push(`${key} fue sanitizado por seguridad`);
            }
          }
        });
      }

      // Validate with schema
      const result = schema.parse(sanitizedData);
      return { 
        success: true, 
        data: result, 
        warnings: warnings.length > 0 ? warnings : undefined 
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        return { success: false, errors };
      }
      return { success: false, errors: ['Error de validación desconocido'] };
    }
  };

  const validateEmail = (email: string): { valid: boolean; error?: string } => {
    try {
      const sanitized = sanitizeEmail(email);
      emailSchema.parse(sanitized);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0]?.message };
      }
      return { valid: false, error: 'Email inválido' };
    }
  };

  const validatePassword = (password: string): { valid: boolean; error?: string; strength?: string } => {
    try {
      passwordSchema.parse(password);
      
      // Calculate password strength
      let score = 0;
      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      
      const strength = score < 3 ? 'débil' : score < 5 ? 'media' : 'fuerte';
      
      return { valid: true, strength };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0]?.message };
      }
      return { valid: false, error: 'Contraseña inválida' };
    }
  };

  const validateInput = (value: string, type: 'email' | 'password' | 'name' | 'phone') => {
    const schemas = {
      email: emailSchema,
      password: passwordSchema,
      name: nameSchema,
      phone: phoneSchema
    };

    const sanitizers = {
      email: sanitizeEmail,
      password: (p: string) => p, // Don't sanitize passwords
      name: sanitizeString,
      phone: sanitizePhone
    };

    try {
      const sanitized = sanitizers[type](value);
      schemas[type].parse(sanitized);
      return { valid: true, sanitized };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, error: error.errors[0]?.message };
      }
      return { valid: false, error: 'Entrada inválida' };
    }
  };

  return {
    validateAndSanitize,
    validateEmail,
    validatePassword,
    validateInput,
    sanitizeString,
    sanitizeEmail,
    sanitizePhone,
    sanitizeHtml,
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