//backend\src\routes
import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  deleteMessage,
  getMessages,
  markAsRead,
  sendMessage,
  updateMessage,
} from "../controllers/messageController";

const router = express.Router();

router.post("/", protect, sendMessage);
router.put("/:messageId", protect, updateMessage);
router.delete("/:messageId", protect, deleteMessage);

router.get("/:conversationId", protect, getMessages);

router.post("/mark-read", protect, markAsRead);

export default router;
