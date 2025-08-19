//backend\src\sockets\index.ts
import { Socket, DefaultEventsMap } from "socket.io";

import { io } from "../server";
import { socketAuth } from "../middleware/socketAuth";
import { handleConnection } from "./connectionHandler";
import { handleMessage } from "./messageHandler";

io.use(socketAuth);

io.on(
  "connection",
  (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  ) => {
    handleConnection(socket);
    handleMessage(socket)

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.data.user._id}:`, error);
    });

    socket.on("connect_error", (error) => {
      console.error(
        `Connection error for user ${socket.data.user._id}:`,
        error
      );
    });
  }
);

console.log("Socket.IO server initialized");
