import { z } from 'zod';

// User Registration Schema
export const authRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email format').max(255, 'Email must be less than 255 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  role: z.enum(['user', 'admin', 'superadmin']).default('user')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

// User Login Schema
export const authLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
});

// Password Change Schema
export const authPasswordChangeSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

// Password Reset Request Schema
export const authPasswordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format')
});

// Password Reset Schema
export const authPasswordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

// Email Verification Schema
export const emailVerificationSchema = z.object({
  token: z.string()
});

// Refresh Token Schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string()
});

// Two-Factor Authentication Setup Schema
export const twoFactorSetupSchema = z.object({
  secret: z.string(),
  token: z.string().length(6, 'Token must be 6 digits')
});

// Two-Factor Authentication Verify Schema
export const twoFactorVerifySchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits')
});

// Social Login Schema
export const socialLoginSchema = z.object({
  provider: z.enum(['google', 'facebook', 'twitter']),
  accessToken: z.string(),
  email: z.string().email('Invalid email format').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional()
});

// User Profile Update Schema
export const authProfileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  phone: z.string().max(20, 'Phone must be less than 20 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  preferences: z.object({
    newsletter: z.boolean().optional(),
    notifications: z.boolean().optional(),
    language: z.enum(['en', 'es', 'fr', 'de']).optional()
  }).optional()
});
