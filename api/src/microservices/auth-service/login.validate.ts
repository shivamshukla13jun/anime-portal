
import { z } from 'zod';
import { Role, ROLES } from './types';

const AuthRegisterSchema = z.object({
    name: z.string()
       .min(3, "Name must be at least 3 characters long")
       .max(50, "Name must be at most 50 characters long"),
    email: z.string()
       .email("Email must be a valid email address")
       .max(100, "Email must be at most 100 characters long"),
    password: z.string()
       .min(8, "Password must be at least 8 characters long"),
    role: z.enum(Object.values(Role) as [string, ...string[]])
})

const AuthLoginSchema = z.object({
    email: z.string().email(),
    password: z.string()
})

export {AuthRegisterSchema,AuthLoginSchema}

