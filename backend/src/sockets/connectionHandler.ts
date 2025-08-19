//backend\src\sockets\connectionHandler.ts
import { Socket } from "socket.io";
import { User } from "../models/User";
import { io } from "../server";

export const  handleConnection = async (socket: Socket) => {
  const userId = socket.data.user._id.toString();
  const username = socket.data.user.username;

  console.log(`User connected: ${userId} (${username})`);

  // Join user-specific room for direct messaging
  socket.join(`user_${userId.toString()}`);

  // Update online status
  await User.findByIdAndUpdate(userId, { online: true });

  io.emit("userOnline", { userId, username });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${userId} (${username})`);

    try {
      await User.findByIdAndUpdate(userId, { online: false });

      io.emit("userOffline", { userId, username });
    } catch (error) {
      console.error("Error updating offline status:", error);
    }
  });

  // Handle manual disconnect
  socket.on("manualDisconnect", () => {
    socket.disconnect();
  });
};
