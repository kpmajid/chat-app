//backend\src\routes
import express from "express";

import { protect } from "../middleware/authMiddleware";
import {
  getAllChats,
  getAvailableUsers,
  createUserConversation,
  createGroupConversation,
} from "../controllers/chatController";

const router = express.Router();

router.get("/", protect, getAllChats);

router.get("/users", protect, getAvailableUsers);

router.post("/user", protect, createUserConversation);

router.post("/group", protect, createGroupConversation);

export default router;
