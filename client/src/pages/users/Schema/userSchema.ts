import { IUser, Role, Roles } from '@/types';
import { z } from 'zod';

const permissionSchema = z.object({
  create: z.boolean().default(false).optional(),
  delete: z.boolean().default(false).optional(),
  update: z.boolean().default(false).optional(),
  view: z.boolean().default(false).optional(),
  import: z.boolean().default(false).optional(),
  export: z.boolean().default(false).optional(),
});


const Userschema = z.object({
  _id: z.string().optional(),
  isUpdate: z.boolean().default(false),
  isActive: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address (e.g. user@example.com)'),
  password: z.string().optional(),
  repeatPassword: z.string().optional(),
  role: z.enum(Roles as unknown as [string, ...string[]]),
}).superRefine((data, ctx) => {
  // If not updating, password is required
  if (!data.isUpdate && !data.password) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please create a password',
      path: ['password']
    });
  }
  
  // If not updating and password exists, validate it
  if (!data.isUpdate && data.password) {
    if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least 6 characters',
        path: ['password']
      });
    }
    if (!/[A-Z]/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one uppercase letter',
        path: ['password']
      });
    }
    if (!/[0-9]/.test(data.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one number',
        path: ['password']
      });
    }
  }
  
  // Validate repeatPassword
  if (!data.isUpdate && data.password && data.password !== data.repeatPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Both passwords must match',
      path: ['repeatPassword']
    });
  }
  
  if (data.password && data.password !== '' && data.password !== data.repeatPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Both passwords must match',
      path: ['repeatPassword']
    });
  }
});

const defaulUsertValues:IUser = {
  isUpdate:false,
  name: '', // Default name
  email: '', // Default email
  password: '', // Default password (ensure this is more secure in production)
  repeatPassword: '', // Default repeat password
  role: "admin", // Default role
};

export { Userschema, defaulUsertValues }
