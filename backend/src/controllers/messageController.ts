//backend\src\controllers
import { Request, Response } from "express";
import mongoose from "mongoose";
import { IUser } from "../models/User";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";
import { io } from "../server";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { content, conversationId } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        message: "Content is required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
      return;
    }

    const message = new Message({
      conversation: conversationId,
      sender: user._id,
      content: content.trim(),
      readBy: [user._id],
    });

    await message.save();

    await message.populate({
      path: "sender",
      select: "username avatar online",
    });

    const conversation = await Conversation.findById(conversationId).populate(
      "participants",
      "_id username avatar online"
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
      return;
    }

    const unreadUpdates: Record<string, number> = {};
    conversation.participants.forEach((participant: any) => {
      if (participant._id.toString() !== user._id.toString()) {
        const currentUnread =
          conversation.unreadCount.get(participant._id.toString()) || 0;
        unreadUpdates[`unreadCount.${participant._id.toString()}`] =
          currentUnread + 1;
      }
    });

    const updatedConversation = await Conversation.findByIdAndUpdate(
      conversationId,
      {
        $set: {
          ...unreadUpdates,
          lastMessage: message._id,
          updatedAt: new Date(),
        },
      },
      { new: true }
    )
      .populate("group", "name avatar")
      .populate("participants", "username avatar online")
      .populate("lastMessage")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "username avatar online" },
      });

    const participantIds = conversation.participants
      .filter((p) => p._id.toString() !== user._id.toString())
      .map((p: any) => p._id.toString());

    participantIds.forEach((participantId) => {
      const unreadCount =
        updatedConversation!.unreadCount.get(participantId) || 0;

      io.to(`user_${participantId}`).emit("newMessage", {
        message,
        conversation: {
          ...updatedConversation!.toObject(),
          unreadCount,
        },
      });
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        message,
        conversation: {
          ...updatedConversation!.toObject(),
          unreadCount:0,
        },
      },
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create message",
    });
  }
};

export const updateMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        message: "Content is required",
      });
      return;
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: user._id,
      isDeleted: false,
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: "Message not found or access denied",
      });
      return;
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content: content.trim(),
        editedAt: new Date(),
      },
      { new: true }
    ).populate("sender", "username avatar");

    await Conversation.updateMany(
      { lastMessage: messageId },
      { updatedAt: new Date() }
    );

    const conversation = await Conversation.findById(
      message.conversation
    ).populate("participants", "_id");

    if (conversation) {
      const participantIds = conversation.participants
        .filter((p) => p._id.toString() !== user._id.toString())
        .map((p: any) => p._id.toString());

      participantIds.forEach((participantId) => {
        io.to(`user_${participantId}`).emit("messageUpdated", {
          messageId,
          conversationId: conversation._id,
          content: content.trim(),
          editedAt: new Date(),
        });
      });
    }

    res.status(200).json({
      success: true,
      data: updatedMessage,
      message: "Message updated successfully",
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      res.status(400).json({
        success: false,
        message: "Invalid message ID format",
      });
      return;
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: user._id,
      isDeleted: false,
    });

    if (!message) {
      res.status(404).json({
        success: false,
        message: "Message not found or access denied",
      });
      return;
    }

    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    const conversation = await Conversation.findById(
      message.conversation
    ).populate("participants", "_id");

    if (conversation) {
      const participantIds = conversation.participants
        .filter((p) => p._id.toString() !== user._id.toString())
        .map((p) => p._id.toString());

      participantIds.forEach((participantId) => {
        io.to(`user_${participantId}`).emit("messageDeleted", {
          messageId,
          conversationId: conversation._id,
          deletedAt: new Date(),
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const messages = await Message.aggregate([
      {
        $match: {
          conversation: new mongoose.Types.ObjectId(conversationId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          as: "sender",
          pipeline: [
            {
              $project: {
                username: 1,
                avatar: 1,
                online: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: "$sender",
      },
      {
        $set: {
          content: {
            $cond: {
              if: "$isDeleted",
              then: "",
              else: "$content",
            },
          },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: offsetNum,
      },
      {
        $limit: limitNum,
      },
    ]);

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

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { conversationId } = req.body;

    if (!conversationId) {
      res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
      return;
    }

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: conversationId,
        participants: user._id,
      },
      {
        $set: {
          [`unreadCount.${user._id.toString()}`]: 0,
        },
      },
      { new: true }
    );

    if (!conversation) {
      res.status(404).json({
        success: false,
        message: "Conversation not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: {
        conversationId,
        unreadCount: 0,
      },
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};
