import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils";

const router = express.Router();

router.get("/google", passport.authenticate("google", { session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=authentication_failed`,
    failureMessage: true,
  }),
  async (req, res) => {
    const user = req.user as { _id: string };

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });

    // Store new refresh token
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    res.redirect(process.env.FRONTEND_URL!);
  }
);

export default router;
