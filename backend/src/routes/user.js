// backend/routes/user.js

import express from "express";
const router = express.Router();
import multer from 'multer'; // ⭐ Import Multer

import { auth } from '../middleware/auth.js';
import { getProfile, personalizeUser, updateProfile, updatePassword } from '../controllers/userController.js';

// ⭐ Multer Setup: Simple in-memory storage for demonstration.
// For production, use diskStorage or cloud storage (e.g., S3).
const upload = multer({ dest: 'uploads/' }); // Files will be saved in a temporary 'uploads' folder

// @route   GET /api/users/profile
router.get('/profile', auth, getProfile);

// @route   PUT /api/users/profile
router.put('/profile', auth, upload.single('profilePic'), updateProfile);

// @route   POST /api/users/personalize
router.post('/personalize', auth, personalizeUser);

// @route   PUT /api/users/password
router.put('/password', auth, updatePassword);

// @route GET /api/users/view_profile 
// router.get("/user/:userId", getPublicProfile);

export default router;