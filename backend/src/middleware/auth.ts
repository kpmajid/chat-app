import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { generateAccessToken, generateRefreshToken } from "../utils/tokenUtils";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: "No access token provided" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return handleExpiredToken(req, res, next);
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

const handleExpiredToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies.refreshToken;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!
    ) as { userId: string };

    const storedToken = await RefreshToken.findOne({
      token: refreshToken,
      user: decoded.userId,
      revoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) throw new Error("Invalid refresh token");

    // Rotate tokens
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);

    // Update cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 days
    });

    // Revoke old refresh token
    await RefreshToken.updateOne({ token: refreshToken }, { revoked: true });

    // Store new refresh token
    await RefreshToken.create({
      user: decoded.userId,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    });

    next();
  } catch (error) {
    return res.status(401).json({ message: "Session expired" });
  }
};
