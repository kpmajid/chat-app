//backend\src\routes
import express from "express";
import { protect } from "../middleware/authMiddleware";
import { getMessages } from "../controllers/messageController";

const router = express.Router();

router.get("/:conversationId", protect, getMessages);

export default router;
