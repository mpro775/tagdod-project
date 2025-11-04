import { z } from 'zod';
import { UserRole, UserStatus } from '../types/user.types';

export const createUserFormSchema = (t: any) => {
  const translate = (key: string, fallback: string) => {
    try {
      const result = t(key, fallback);
      return typeof result === 'string' ? result : fallback;
    } catch {
      return fallback;
    }
  };

  return z.object({
    phone: z
      .string()
      .min(9, translate('users:form.validation.phone.min', 'رقم الهاتف يجب أن يكون 9 أرقام على الأقل'))
      .max(15, translate('users:form.validation.phone.max', 'رقم الهاتف يجب أن يكون 15 رقم على الأكثر'))
      .regex(
        /^[0-9+\-\s]+$/,
        translate('users:form.validation.phone.invalid', 'رقم الهاتف يجب أن يحتوي على أرقام فقط')
      ),
    firstName: z
      .string()
      .min(2, translate('users:form.validation.firstName.min', 'الاسم يجب أن يكون حرفين على الأقل'))
      .optional()
      .or(z.literal('')),
    lastName: z.string().optional().or(z.literal('')),
    gender: z.enum(['male', 'female', 'other']).optional().or(z.literal('')),
    jobTitle: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    password: z
      .string()
      .min(8, translate('users:form.validation.password.min', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'))
      .optional()
      .or(z.literal('')),
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus),
    roles: z
      .array(z.nativeEnum(UserRole))
      .min(1, translate('users:form.validation.roles.min', 'يجب تحديد دور واحد على الأقل')),
    permissions: z.array(z.string()).optional(),
    wholesaleDiscountPercent: z
      .number()
      .min(0, translate('users:form.validation.discount.min', 'النسبة يجب أن تكون 0 أو أكثر'))
      .max(100, translate('users:form.validation.discount.max', 'النسبة يجب أن تكون 100 أو أقل'))
      .optional(),
  });
};

export type UserFormData = z.infer<ReturnType<typeof createUserFormSchema>>;

