import { z } from 'zod';

// Profile validation schema
export const profileSchema = z.object({
    full_name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .regex(/^[a-zA-Z\s-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

    phone: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(20, 'Phone number must not exceed 20 characters')
        .regex(/^\+?[0-9\s-()]+$/, 'Invalid phone number format')
        .optional()
        .or(z.literal('')),

    bio: z.string()
        .max(500, 'Bio must not exceed 500 characters')
        .optional()
        .or(z.literal('')),

    company: z.string()
        .max(255, 'Company name must not exceed 255 characters')
        .optional()
        .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Password change validation schema
export const passwordSchema = z.object({
    currentPassword: z.string()
        .min(1, 'Current password is required'),

    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

    confirmPassword: z.string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export type PasswordFormData = z.infer<typeof passwordSchema>;

// API key generation validation schema
export const apiKeySchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must not exceed 100 characters')
        .regex(/^[a-zA-Z0-9\s-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores'),

    expiresIn: z.number()
        .min(30, 'Expiration must be at least 30 days')
        .max(365, 'Expiration cannot exceed 365 days'),
});

export type ApiKeyFormData = z.infer<typeof apiKeySchema>;

// Team invitation validation schema
export const teamInviteSchema = z.object({
    email: z.string()
        .email('Invalid email address')
        .min(1, 'Email is required'),

    role: z.enum(['member', 'admin'], {
        required_error: 'Please select a role',
        invalid_type_error: 'Invalid role selected',
    }),
});

export type TeamInviteFormData = z.infer<typeof teamInviteSchema>;

// Helper function to format validation errors
export function formatZodError(error: z.ZodError): Record<string, string> {
    const formatted: Record<string, string> = {};

    error.errors.forEach((err) => {
        const path = err.path.join('.');
        formatted[path] = err.message;
    });

    return formatted;
}

// Helper function to validate data against a schema
export function validateForm<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { success: false, errors: formatZodError(error) };
        }
        return { success: false, errors: { _form: 'Validation failed' } };
    }
}
