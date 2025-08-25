import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "@/hooks/redux";
import { selectAuth } from "@/features/auth/authSlice";
import { SocketContext } from "./SocketContext";

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAppSelector(selectAuth);

  useEffect(() => {
    // Only connect when user is authenticated
    if (isAuthenticated && user?._id ) {
      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:5000",
        {
          withCredentials: true,
          transports: ["websocket", "polling"],
          auth: {
            userId: user._id,
            username: user.username,
          },
        }
      );

      newSocket.on("connect", () => {
        console.log("Connected to server");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from server");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else if(!isAuthenticated||!user?._id) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated,socket, user?._id, user?.username]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
