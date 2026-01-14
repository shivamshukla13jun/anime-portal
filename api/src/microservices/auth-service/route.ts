import { Router } from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logout,currentLoginUser
} from "./auth.controller";

import { authRegistrationSchema, authLoginSchema, authPasswordResetRequestSchema, authPasswordResetSchema } from './auth.validation';
import { Middleware } from "middlewares";
const router = Router();

// Validation middleware using Yup
const validateRegistration = Middleware.requestValidate(authRegistrationSchema);
const validateLogin = Middleware.requestValidate(authLoginSchema);
const validatePasswordResetRequest = Middleware.requestValidate(authPasswordResetRequestSchema);
const validatePasswordReset = Middleware.requestValidate(authPasswordResetSchema);

router.post("/register", validateRegistration, registerUser);
router.post("/login", Middleware.loginLimiter, validateLogin, loginUser);
router.post("/logout", logout);
router.post('/forget-password', Middleware.loginLimiter, validatePasswordResetRequest, forgotPassword);
router.post('/reset-password', Middleware.loginLimiter, validatePasswordReset, resetPassword);
router.get('/current-user',currentLoginUser)
export default router;
