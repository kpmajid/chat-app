import { useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { toast } from "sonner";
import client from "@/api/client";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  addMessage,
  selectSelectedChat,
  updateConversation,
  updateMessage,
} from "@/features/chat/chatSlice";

export const useMessageActions = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();
  const selectedChat = useAppSelector(selectSelectedChat);

  // Use ref to get current selectedChat without causing effect re-runs
  const selectedChatRef = useRef(selectedChat);

  selectedChatRef.current = selectedChat;

  const sendMessage = useCallback(
    async (content: string, conversationId?: string) => {
      if (!content.trim()) {
        toast.error("Cannot send message: Not connected");
        throw new Error("Message content cannot be empty");
      }

      try {
        const response = await client.post("/api/messages", {
          content: content.trim(),
          conversationId,
        });
        if (response.data.success) {
          const { message, conversation } = response.data.data;
          dispatch(updateConversation(conversation));

          if (selectedChatRef.current?._id === conversationId) {
            dispatch(addMessage(message));
          }
          return response.data;
        }
      } catch (error) {
        console.error("Failed to send message via HTTP:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string): Promise<void> => {
      if (!content.trim()) {
        throw new Error("Message content cannot be empty");
      }
      try {
        const response = await client.put(`/api/messages/${messageId}`, {
          content: content.trim(),
        });

        if (response.data.success) {
          if (selectedChatRef.current) {
            dispatch(
              updateMessage({
                _id: messageId,
                content: content,
                editedAt: new Date().toISOString(),
              })
            );
          }
          return response.data;
        }
      } catch (error) {
        console.error("Failed to edit message via HTTP:", error);
        throw error;
      }
    },
    [dispatch]
  );

  const deleteMessage = useCallback(
    async (messageId: string): Promise<void> => {
      if (!messageId?.trim()) {
        throw new Error("Message ID is required");
      }
      try {
        const response = await client.delete(`/api/messages/${messageId}`);

        if (response.data.success) {
          if (selectedChatRef.current) {
            dispatch(
              updateMessage({
                _id: messageId,
                isDeleted: true,
                deletedAt: new Date().toISOString(),
              })
            );
          }
          return response.data;
        }
      } catch (error) {
        console.error("Failed to delete message via HTTP:", error);
        throw error;
      }
    },
    [dispatch]
  );

  return {
    sendMessage,
    editMessage,
    deleteMessage,
    isConnected,
  };
};
