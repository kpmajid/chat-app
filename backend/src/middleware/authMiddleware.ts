//backend\src\middleware
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let accessToken = req.cookies.accessToken;

  if (!accessToken) {
    res.status(401).json({ message: "No access token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired access token" });
    return;
  }
};
