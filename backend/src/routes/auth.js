// backend/routes/auth.js (UPDATE THIS FILE)
import express from "express";
const router = express.Router();
import { registerUser, loginUser, logoutUser, getMe, forgotPassword, verifyResetToken, resetPassword } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js'; // Import the auth middleware

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// Forgot password - send reset email
router.post('/forgot-password', forgotPassword);

// Verify token validity
router.get('/reset-password/:token', verifyResetToken);

// Reset password
router.post('/reset-password/:token', resetPassword);

// @route   GET /api/auth/me (Missing Route)
router.get('/me', auth, getMe); 

// @route   POST /api/auth/logout (Missing Route)
router.post('/logout', logoutUser); 

export default router;