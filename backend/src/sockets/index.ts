//backend\src\sockets\index.ts
import { Socket, DefaultEventsMap } from "socket.io";

import { io } from "../server";

io.on(
  "connection",
  (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    const { userId, username } = socket.handshake.auth;
    socket.data.user = { _id: userId, username };

    console.log(
      `User ${username} (${userId}) connected with socket ${socket.id}`
    );

    socket.on("error", (error) => {
      const userId = socket.data?.user?._id || "unknown";
      console.error(`Socket error for user ${userId}:`, error);
    });

    socket.on("connect_error", (error) => {
      const userId = socket.data?.user?._id || "unknown";
      console.error(`Connection error for user ${userId}:`, error);
    });

    socket.on("disconnect", (reason) => {
      const userId = socket.data?.user?._id || "unknown";
      const username = socket.data?.user?.username || "unknown";
      console.log(
        `[socket] User ${username} (${userId}) disconnected — socketId=${socket.id}, reason: ${reason}`
      );
    });
  }
);

console.log("Socket.IO server initialized");
