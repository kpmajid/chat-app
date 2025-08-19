import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  addMessage,
  selectSelectedChat,
  updateConversation,
} from "@/features/chat/chatSlice";
import type { Message, Conversation } from "@/lib/types";

export const useRealTimeMessages = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();
  const selectedChat = useAppSelector(selectSelectedChat);

  // Use ref to get current selectedChat without causing effect re-runs
  const selectedChatRef = useRef(selectedChat);
  selectedChatRef.current = selectedChat;

  // Memoize the message handler to prevent effect re-runs
  const handleNewMessage = useCallback(
    (data: { message: Message; conversation: Conversation }) => {
      const { message, conversation } = data;

      dispatch(updateConversation(conversation));

      if (
        selectedChatRef.current &&
        selectedChatRef.current._id === conversation._id
      ) {
        dispatch(addMessage(message));
      }

      console.log("New message received:", message);
    },
    [dispatch]
  );

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Set up event listeners
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, isConnected, handleNewMessage]);

  // Send message function
  const sendMessage = useCallback(
    (content: string, conversationId?: string) => {
      if (!socket || !isConnected) {
        console.error("Socket not connected");
        return Promise.reject(new Error("Socket not connected"));
      }

      if (!content.trim()) {
        console.error("Message content cannot be empty");
        return Promise.reject(new Error("Message content cannot be empty"));
      }

      const messageData = {
        content: content.trim(),
        conversationId,
      };

      return new Promise((resolve, reject) => {
        socket.emit("sendMessage", messageData, (response: any) => {
          if (response.status === "success") {
            // Handle successful message send
            const { message, conversation } = response;

            // Update conversation in Redux
            dispatch(updateConversation(conversation));

            // If this is the selected chat, add the message
            if (
              selectedChatRef.current &&
              selectedChatRef.current._id === conversationId
            ) {
              dispatch(addMessage(message));
            }

            console.log("Message sent successfully:", message);
            resolve(response);
          } else {
            console.error("Failed to send message:", response.message);
            reject(new Error(response.message));
          }
        });
      });
    },
    [socket, isConnected, dispatch]
  );

  return {
    sendMessage,
    isConnected,
  };
};
