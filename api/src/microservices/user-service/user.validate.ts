import { Role } from "microservices/auth-service/types"
import { z } from "zod"

const userRegistrationSchema = z.object({
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

const userUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Email must be a valid email address").optional(),
  password: z.string().optional(),
  role: z.enum(Object.values(Role) as [string, ...string[]]).optional(),
})

const ActiveUserSchema = z.object({
  isActive: z.boolean(),
})

const BlockUserSchema = z.object({
  isBlocked: z.boolean(),
})

export { userRegistrationSchema, userUpdateSchema, ActiveUserSchema, BlockUserSchema }