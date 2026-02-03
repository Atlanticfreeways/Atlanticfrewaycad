// Password change service and utilities

export interface PasswordChangeRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface PasswordValidation {
    isValid: boolean;
    errors: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export const changePassword = async (data: PasswordChangeRequest): Promise<{ success: boolean; error?: string }> => {
    // Validate new password
    const validation = validatePassword(data.newPassword);
    if (!validation.isValid) {
        return {
            success: false,
            error: validation.errors.join(', '),
        };
    }

    // Check passwords match
    if (data.newPassword !== data.confirmPassword) {
        return {
            success: false,
            error: 'New passwords do not match',
        };
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/users/password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                current_password: data.currentPassword,
                new_password: data.newPassword,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.error || 'Failed to change password',
            };
        }

        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
};
