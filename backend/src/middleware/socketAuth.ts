// src/middleware/socketAuth.ts
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import * as cookie from "cookie";

export const socketAuth = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      throw new Error("Authentication error: No token provided");
    }

    const decoded = jwt.verify(
      refreshToken as string,
      process.env.JWT_REFRESH_SECRET!
    ) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select(
      "_id googleId username email avatar online"
    );

    if (!user) {
      throw new Error("Authentication error: User not found");
    }

    // Attach user to socket
    socket.data.user = user;

    console.log(
      `Socket authenticated for user: ${user.username} (${user._id})`
    );
    next();
  } catch (err) {
    
    console.log("Socket authentication failed:", err);
    next(new Error("Authentication failed"));
  }
};
