//backend\src\controllers
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { RefreshToken } from "../models/RefreshToken";
import {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
} from "../utils/tokenUtils";
import { IUser, User } from "../models/User";

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.findByIdAndUpdate(user._id, { online: true });

    console.log("whre?")
    // Store new refresh token
    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });

    res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
  } catch (error) {
    console.error("Auth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/?error=authentication_failed`);
  }
};

export const refreshTokenHandler = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    console.log("!refreshToken");
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    const user = await User.findOne({ _id: decoded.userId });
    if (!user) {
      console.log("!user");
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken || storedToken.revoked) {
      console.log("!storedToken || storedToken.revoked");
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    await RefreshToken.deleteOne({ token: refreshToken });

    // Generate new tokens
    const newAccessToken = generateAccessToken(storedToken.user.toString());
    const newRefreshToken = generateRefreshToken(storedToken.user.toString());

    setTokenCookies(res, newAccessToken, newRefreshToken);

    await RefreshToken.create({
      user: decoded.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    res.json({ message: "Tokens refreshed successfully" });
  } catch (error) {
    console.error("Token refresh error:", error);

    // Clear cookies on refresh failure
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Revoke refresh token
      await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });
    }
    const user = req.user as IUser;
    await User.findByIdAndUpdate(user._id, { online: false });

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};
