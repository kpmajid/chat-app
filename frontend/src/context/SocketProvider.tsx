import React, { useEffect, useState, useRef } from "react";
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (socket && !document.hidden) {
        // Tab became active - ensure connection
        if (!socket.connected) {
          console.log("Tab active, reconnecting socket...");
          socket.connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket]);

  useEffect(() => {
    // Only connect when user is authenticated
    if (isAuthenticated && user?._id) {
      const newSocket = io(
        import.meta.env.VITE_API_URL || "http://localhost:5000",
        {
          withCredentials: true,
          transports: ["websocket", "polling"],
          auth: {
            userId: user._id,
            username: user.username,
          },
          // Enhanced connection options
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          forceNew: false,
        }
      );

      newSocket.on("connect", () => {
        console.log("✅ Connected to server");
        setIsConnected(true);
        
        // Clear any reconnection timeouts
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      });

      newSocket.on("disconnect", (reason) => {
        console.log(`❌ Disconnected from server: ${reason}`);
        setIsConnected(false);
        
        // Auto-reconnect for certain disconnect reasons
        if (
          reason === "io server disconnect" ||
          reason === "io client disconnect"
        ) {
          console.log("🔄 Attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            if (!newSocket.connected) {
              newSocket.connect();
            }
          }, 2000);
        }
      });

      newSocket.on("reconnect", (attemptNumber) => {
        console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
        setIsConnected(true);
      });

      newSocket.on("reconnect_attempt", (attemptNumber) => {
        console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      });

      newSocket.on("reconnect_failed", () => {
        console.log("❌ Failed to reconnect");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.error("❌ Connection error:", error.message);
        setIsConnected(false);
      });

      // Handle ping/pong for connection health
      newSocket.on("ping", () => {
        console.log("📡 Ping received from server");
      });

      setSocket(newSocket);

      return () => {
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else if (!isAuthenticated || !user?._id) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [isAuthenticated, user?._id, user?.username]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
