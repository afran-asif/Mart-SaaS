import {Router } from 'express';
import { registerVendor, loginUser, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from "../controllers/authController";
import { protect, authorize } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerVendor);
router.post('/login', loginUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/dashboard-data', protect, authorize('vendor', 'super-admin'), (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to the protected vendor dashboard!',
        user: (req as any).user
    })
})
export default router;