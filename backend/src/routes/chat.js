import express from "express";
import { getChatHistory } from "../controllers/chatController.js";
import {auth} from "../middleware/auth.js";

const router = express.Router();

router.get("/history/:otherUserId", auth, getChatHistory);

export default router;
