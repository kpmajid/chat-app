import { useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAppDispatch } from "./redux";
import { updateUserOnlineStatus } from "@/features/chat/chatSlice";

export const useOnlineStatus = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();

  // Handle user coming online
  const handleUserOnline = useCallback(
    (data: { userId: string; username: string; online: boolean }) => {
      const { userId } = data;
      
      dispatch(
        updateUserOnlineStatus({
          userId,
          online: true,
        })
      );
      
      console.log(`${data.username} is now online`);
    },
    [dispatch]
  );

  // Handle user going offline
  const handleUserOffline = useCallback(
    (data: { userId: string; username: string; online: boolean }) => {
      const { userId } = data;
      
      dispatch(
        updateUserOnlineStatus({
          userId,
          online: false,
        })
      );
      
      console.log(`${data.username} is now offline`);
    },
    [dispatch]
  );

  // Set up socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for online/offline events
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    return () => {
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);
    };
  }, [socket, isConnected, handleUserOnline, handleUserOffline]);

  return {
    isConnected,
  };
};
