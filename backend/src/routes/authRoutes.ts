import {Router } from 'express';
import rateLimit from "express-rate-limit";
import { registerVendor, loginUser, logoutUser, getMe, updateProfile, changePassword, uploadAvatar, removeAvatar, impersonateCallback, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from "../controllers/authController";
import { protect, authorize } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

const limitMsg = { message: "Too many requests. Please try again later." };
const std = { windowMs: 15 * 60 * 1000, standardHeaders: true, legacyHeaders: false, message: limitMsg } as const;
// register/forgot = DB + email খরচ → সবচেয়ে কড়া; login = typo-র জায়গা রেখে মাঝারি
const registerLimiter = rateLimit({ ...std, max: 5 });
const loginLimiter = rateLimit({ ...std, max: 15 });
const emailLimiter = rateLimit({ ...std, max: 5 }); // forgot + resend (inbox-bomb রোধে)
const resetLimiter = rateLimit({ ...std, max: 10 });

router.post('/register', registerLimiter, registerVendor);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);
router.put('/change-password', protect, changePassword);
router.get('/impersonate/cb/:token', impersonateCallback);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', emailLimiter, resendVerificationEmail);
router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password', resetLimiter, resetPassword);

router.get('/dashboard-data', protect, authorize('vendor', 'super-admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the protected vendor dashboard!',
        user: (req as any).user
    })
})
export default router;