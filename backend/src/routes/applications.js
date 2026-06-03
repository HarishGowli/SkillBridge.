import express from 'express'
import { auth } from '../middleware/auth.js';
import { isNgo, isVolunteer } from '../middleware/role.js';
const router = express.Router();
import {getMyApplications, getPendingApplications, reviewApplication, submitApplication, withdrawMyApplication} from '../controllers/applicationController.js';

// @route   POST /api/applications/
router.post('/', auth, isVolunteer, submitApplication);

// // @route   GET /api/applications/pending
router.get('/pending', auth, isNgo, getPendingApplications);

// @route   GET /api/applications/my
router.get("/my", auth, getMyApplications);

// // @route   PUT /api/applications/:id
router.put('/:id', auth, isNgo, reviewApplication);

// @route   POST /api/applications/withdraw/:id
router.delete('/withdraw/:id', auth, isVolunteer, withdrawMyApplication)

export default router;