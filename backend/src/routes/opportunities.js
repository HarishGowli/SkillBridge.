import express from "express";
import { auth } from "../middleware/auth.js";
import { isNgo } from "../middleware/role.js";
import {
  createOpportunity,
  updateOpportunity,
  getOpportunities,
  deleteOpportunity,
  getMyOpportunities,
} from "../controllers/opportunityController.js";

const router = express.Router();

// @route   GET /api/opportunities/
router.get("/", getOpportunities);

// @route   get /api/opportunities/my
router.get("/my", auth, isNgo, getMyOpportunities);

// @route   POST /api/opportunities/
router.post("/", auth, isNgo, createOpportunity);

// @route   PUT /api/opportunities/:id
router.put("/:id", auth, isNgo, updateOpportunity);

// @route   DELETE /api/opportunities/:id
router.delete("/:id", auth, isNgo, deleteOpportunity);

export default router; 
