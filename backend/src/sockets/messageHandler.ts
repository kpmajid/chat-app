//backend\src\sockets\messageHandler.ts
import { Socket } from "socket.io";
import mongoose from "mongoose";

import { Conversation, IConversation } from "../models/Conversation";
import { io } from "../server";
import { Message } from "../models/Message";

export const handleMessage = (socket: Socket) => {
  socket.on("sendMessage", async (data, callback) => {
    try {
      const { content, conversationId } = data;
      const senderId = socket.data.user._id;

      if (!content || !content.trim()) {
        throw new Error("Message content cannot be empty");
      }

      if (!conversationId) {
        throw new Error("conversationId is required");
      }

      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new Error("Invalid conversation ID format");
      }

      const message = new Message({
        conversation: conversationId,
        sender: senderId,
        content: content.trim(),
        readBy: [senderId],
      });

      await message.save();

      await message.populate({
        path: "sender",
        select: "username avatar online",
      });

      const conversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
          lastMessage: message._id,
          updatedAt: new Date(),
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

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const participantIds = conversation.participants
        .filter((p) => p._id.toString() !== senderId.toString())
        .map((p: any) => p._id.toString());

      participantIds.forEach((participantId) => {
        io.to(`user_${participantId}`).emit("newMessage", {
          message,
          conversation: conversation,
        });
      });

      if (callback) {
        callback({
          status: "success",
          message: message,
          conversation: conversation,
        });
      }

      console.log(`Message sent to ${participantIds.length} participants`);
    } catch (error) {
      console.error("Error sending message:", error);
      if (callback) {
        callback({
          status: "error",
          message: (error as Error).message,
        });
      }
    }
  });

  socket.on("deleteMessage", async (data, callback) => {
    try {
      console.log("deleteMessage?", data);
      const { conversationId, messageId } = data;
      const userId = socket.data.user._id;

      if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Valid message ID is required");
      }

      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new Error("Valid conversation ID is required");
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        throw new Error("Chat not found or access denied");
      }

      const message = await Message.findOne({
        _id: messageId,
        conversation: conversationId,
        sender: userId,
      });

      if (!message) {
        throw new Error("Message not found or access denied");
      }

      if (message.isDeleted) {
        throw new Error("Message already deleted");
      }

      await Message.findByIdAndUpdate(messageId, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      const participantIds = conversation.participants
        .filter((p) => p._id.toString() !== userId.toString())
        .map((p: any) => p._id.toString());

      console.log("participantIds:", participantIds);

      participantIds.forEach((participantId) => {
        io.to(`user_${participantId}`).emit("messageDeleted", {
          messageId,
          conversationId,
          deletedAt: new Date(),
        });
      });

      if (callback) {
        callback({
          status: "success",
          message: "Message deleted successfully",
        });
      }

      console.log(`Message ${messageId} deleted by user ${userId}`);
    } catch (error) {
      console.error("Error deleting message:", error);
      if (callback) {
        callback({
          status: "error",
          message: (error as Error).message,
        });
      }
    }
  });

  socket.on("updateMessage", async (data, callback) => {
    try {
      const { content, conversationId, messageId } = data;
      const userId = socket.data.user._id;

      if (!content || !content.trim()) {
        throw new Error("Message content cannot be empty");
      }

      if (!messageId || !mongoose.Types.ObjectId.isValid(messageId)) {
        throw new Error("Valid message ID is required");
      }

      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new Error("Valid conversation ID is required");
      }

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        throw new Error("Chat not found or access denied");
      }

      const message = await Message.findOne({
        _id: messageId,
        conversation: conversationId,
        sender: userId,
      });

      if (!message) {
        throw new Error("Message not found or access denied");
      }

      if (message.isDeleted) {
        throw new Error("Message already deleted");
      }

      await Message.findByIdAndUpdate(messageId, {
        content: content,
        editedAt: new Date(),
      });

      const participantIds = conversation.participants
        .filter((p) => p._id.toString() !== userId.toString())
        .map((p: any) => p._id.toString());

      console.log("participantIds:", participantIds);

      participantIds.forEach((participantId) => {
        io.to(`user_${participantId}`).emit("messageUpdated", {
          messageId,
          conversationId,
          content,
          editedAt : new Date(),
        });
      });

      if (callback) {
        callback({
          status: "success",
          message: "Message updated successfully",
        });
      }

      console.log(`Message ${messageId} updated by user ${userId}`);
    } catch (error) {
      console.error("Error updating message:", error);
      if (callback) {
        callback({
          status: "error",
          message: (error as Error).message,
        });
      }
    }
  });
};
