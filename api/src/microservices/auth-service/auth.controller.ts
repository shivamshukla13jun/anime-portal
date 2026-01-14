import { Request, Response, NextFunction } from "express";
import User,{IUserDocument} from "../../models/user.model";
import { AppError } from "middlewares/error";
import crypto from "crypto";
import sendEmail from "libs/sendEmail";
import config from "config";
import { loginSession } from "middlewares/session";
import ejs from "ejs";
import path from "path";
/**
 * @description Create New User
 * @type POST 
 * @path /api/users/register
 */
const registerUser =
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await User.create(req.body);
      res.status(201).json({ data: user, success: true, statusCode: 201 });
    } catch (error) {
      console.warn(error)
      next(error)
    }
  }

/**
 * @description User Login
 * @type POST 
 * @path /api/users/login
 */
const loginUser = 
  async (req: Request, res: Response, next: NextFunction):  Promise<void>  => {
    try {
      const payload: IUserDocument = req.body;
    payload.email = payload.email.toLowerCase();

    // Use a "where" clause to find the user by email
    const checkUser = await User.findOne( { email: payload.email  });
    if (!checkUser) {
      throw new AppError("No user found with provided email", 400);
    }

    if (!checkUser.isActive) {
      throw new AppError("Account is deactivated by owner!", 400);
    }
    if (checkUser.isBlocked) {
      throw new AppError("Account is blocked by owner!", 400);
    }
    const isMatch = await checkUser.matchPassword(payload.password as string, checkUser.password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 400);
    }

    // Remove sensitive info from returned user data
    const { password, isBlocked, ...userData } = checkUser.toJSON();
    await loginSession(req,userData._id as string)
      res.status(200).json({
        success: true,
        data: userData,
        message: "Login successful",
      });
    } catch (error) {
      next(error)
    }
  }


/**
 * @description Forgot Password
 * @type POST 
 * @path /api/auth/forgot-password
 */
const forgotPassword = 
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
   try {
     const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError("No user found with provided email", 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `${config.FRONTEND_URL}/reset-password/${resetToken}`;
    const html=await ejs.renderFile(path.join(__dirname,"passwordreset.ejs"), { resetUrl });

    sendEmail(user.email, "Password Reset Request", html);
    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
    
   } catch (error) {
    next(error)
   }
  }


/**
 * @description Reset Password
 * @type POST 
 * @path /api/auth/reset-password
 */
const resetPassword =
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, password } = req.body;
      const user = await User.findOne({ resetPasswordToken: token,resetPasswordExpire:{$gt:Date.now()} });
      if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
      }
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password reset successful"
      });
    } catch (error) {
      next(error)
    }    
  }

 const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
   const sessionId = req.sessionID; // Get the current session ID
 req.session.destroy(async err => {
    // Explicitly remove session from MongoDB
      const mongoStore = req.sessionStore as any;
      if (mongoStore && typeof mongoStore.destroy === 'function') {
        await mongoStore.destroy(sessionId); // Deletes from MongoDB
      }
    
    
    res.clearCookie('connect.sid'); // Clear cookie
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  });
} catch (error) {
  next(error)
}
};
const currentLoginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.session.user?._id
    const user=await User.findById(userId)
    if(!user){
      throw new AppError("User not found", 400);
    }
    res.status(200).json({ data: user, success: true, statusCode: 200 });
  } catch (error) {
    next(error)
  }
}


export { registerUser, loginUser, forgotPassword, resetPassword,logout ,currentLoginUser};
