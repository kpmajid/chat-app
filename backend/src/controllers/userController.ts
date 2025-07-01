//backend\src\controllers
import { Request, Response } from "express";
import { User } from "../models/User";

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    res.status(200).json({
      success: true,
      message: "User data fetched successfully!",
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        online: user.online,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

export const setUsername = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.body;
    const user = req.user as any;

    if (!username || username.trim().length < 3) {
      res.status(400).json({
        message: "Username must be at least 3 characters long",
      });
      return;
    }

    // Check if username is already taken
    const existingUser = await User.findOne({
      username: username.trim(),
      _id: { $ne: user._id },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Username is already taken",
      });
      return;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { username: username.trim() },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Username updated successfully!",
      data: {
        _id: updatedUser!._id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        avatar: updatedUser!.avatar,
        online: updatedUser!.online,
      },
    });
  } catch (error) {
    console.error("Set username error:", error);
    res.status(500).json({ message: "Failed to set username" });
  }
};
