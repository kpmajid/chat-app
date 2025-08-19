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
};
