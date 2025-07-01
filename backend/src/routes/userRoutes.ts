//backend\src\routes
import express, { Request, Response } from "express";
import { protect } from "../middleware/authMiddleware";
import { getMe, setUsername } from "../controllers/userController";

const router = express.Router();

router.get("/me", protect, getMe);

router.post("/set-username", protect, setUsername);

export default router;
