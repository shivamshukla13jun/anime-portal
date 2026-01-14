import { z } from 'zod';

const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Please enter your email address to login'),
  password: z.string()
    .min(1, 'Please enter your password'),
});

const defaultLoginValues={
    email:"",
    password:""
}

export {loginSchema,defaultLoginValues}