//backend\src\routes
import express from "express";
import passport from "passport";

import { protect } from "../middleware/authMiddleware";
import {
  googleCallback,
  logoutHandler,
  refreshTokenHandler,
} from "../controllers/authController";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  googleCallback
);

router.post("/refresh", refreshTokenHandler);

router.post("/logout", protect, logoutHandler);

export default router;
