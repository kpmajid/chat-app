//backend\src\controllers
import { Request, Response } from "express";
import mongoose from "mongoose";
import { IUser } from "../models/User";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Input validation
    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({
        success: false,
        message: "Invalid conversation ID format",
      });
      return;
    }

    // Verify user is participant of the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [user._id] },
    });

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
      return;
    }

    // Parse pagination parameters
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);

    if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
      res.status(400).json({
        success: false,
        message: "Limit must be a number between 1 and 100",
      });
      return;
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      res.status(400).json({
        success: false,
        message: "Offset must be a non-negative number",
      });
      return;
    }

    // Fetch messages with pagination
    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "username avatar online")
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(offsetNum);

    // Get total count for pagination metadata
    const totalMessages = await Message.countDocuments({
      conversation: conversationId,
    });

    res.status(200).json({
      success: true,
      message: "Messages fetched successfully",
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          total: totalMessages,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalMessages,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};