//backend\src\controllers
import { Request, Response } from "express";
import mongoose from "mongoose";
import { IUser, User } from "../models/User";
import { Conversation } from "../models/Conversation";
import { Group, IGroupMember } from "../models/Group";
import { Types } from "mongoose";

/**
 * Optimized aggregation pipeline for populating conversation data
 * Reduces data exposure and improves performance
 */
const getConversationPipeline = (matchStage: any): mongoose.PipelineStage[] => [
  { $match: matchStage },
  {
    $lookup: {
      from: "users",
      localField: "participants",
      foreignField: "_id",
      as: "participants",
      pipeline: [{ $project: { username: 1, avatar: 1, online: 1 } }],
    },
  },
  {
    $lookup: {
      from: "groups",
      localField: "group",
      foreignField: "_id",
      as: "group",
      pipeline: [{ $project: { name: 1, avatar: 1 } }],
    },
  },
  { $unwind: { path: "$group", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "messages",
      localField: "lastMessage",
      foreignField: "_id",
      as: "lastMessage",
      pipeline: [
        {
          $lookup: {
            from: "users",
            localField: "sender",
            foreignField: "_id",
            as: "sender",
            pipeline: [{ $project: { username: 1, avatar: 1 } }],
          },
        },
        { $unwind: "$sender" },
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
      ],
    },
  },
  { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },
  { $sort: { updatedAt: -1 } },
];

/**
 * Get all conversations for the authenticated user
 * Returns both user and group conversations with populated data
 */
export const getAllChats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;

    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const chats = await Conversation.aggregate(
      getConversationPipeline({
        participants: { $in: [new mongoose.Types.ObjectId(user._id)] },
      })
    );

    res.status(200).json({
      success: true,
      message: "User chats fetched successfully!",
      data: chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all chats",
    });
  }
};

/**
 * Get all users available for creating new conversations
 * Excludes the current authenticated user
 */
export const getAvailableUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;

    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const users = await User.find({
      _id: { $ne: user._id },
    }).select("-email -googleId");

    res.status(200).json({
      success: true,
      message: "fetched users details successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get all users",
    });
  }
};

/**
 * Create or retrieve a user conversation (DM)
 * If conversation exists, returns existing one; otherwise creates new
 */
export const createUserConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { userId } = req.body;

    // Input validation
    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: "User ID is required",
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
      return;
    }

    if (user._id.toString() === userId.toString()) {
      res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
      return;
    }

    // Check if receiver exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      res.status(404).json({
        success: false,
        message: "Receiver does not exist",
      });
      return;
    }

    // Check if conversation already exists
    const existingChat = await Conversation.aggregate(
      getConversationPipeline({
        type: "user",
        participants: { $all: [user._id, new mongoose.Types.ObjectId(userId)] },
      })
    );

    if (existingChat.length > 0) {
      res.status(200).json({
        success: true,
        data: existingChat[0],
        message: "Chat retrieved successfully",
      });
      return;
    }

    // Create new conversation
    const newConversation = await Conversation.create({
      type: "user",
      participants: [user._id, userId],
    });

    // Fetch the created conversation with populated data
    const createdChat = await Conversation.aggregate(
      getConversationPipeline({
        _id: newConversation._id,
      })
    );

    res.status(201).json({
      success: true,
      data: createdChat[0],
      message: "Chat created successfully",
    });
  } catch (error) {
    console.error("Error creating user conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chat",
    });
  }
};

/**
 * Create a group conversation
 * Creates both the group and the associated conversation
 */
export const createGroupConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { name, participants } = req.body;

    // Input validation
    if (!user || !user._id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "name, participants details required!",
      });
      return;
    }

    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "name, participants details required!",
      });
      return;
    }

    // Validate participant IDs
    for (const participantId of participants) {
      if (!mongoose.Types.ObjectId.isValid(participantId)) {
        res.status(400).json({
          success: false,
          message: "Invalid participant ID format",
        });
        return;
      }
    }

    const userId = user._id.toString();
    const uniqueParticipants = Array.from(new Set([userId, ...participants]));

    // Create group members with roles
    const members: IGroupMember[] = uniqueParticipants.map((id) => ({
      user: id,
      role: id === userId ? "admin" : "member",
    }));

    // Create group
    const group = await Group.create({
      name: name.trim(),
      members,
    });

    // Create conversation
    const conversation = await Conversation.create({
      type: "group",
      participants: uniqueParticipants.map((id) => new Types.ObjectId(id)),
      group: group._id,
    });

    // Fetch the created conversation with populated data
    const createdChat = await Conversation.aggregate(
      getConversationPipeline({
        _id: conversation._id,
      })
    );

    res.status(201).json({
      success: true,
      data: createdChat[0],
      message: "Group conversation created successfully",
    });
  } catch (error) {
    console.error("Error creating group conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create group",
    });
  }
};
