import { useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";
import { useAppDispatch, useAppSelector } from "./redux";
import {
  addMessage,
  selectConversations,
  selectSelectedChat,
  updateConversation,
  updateMessage,
} from "@/features/chat/chatSlice";
import type { Message, Conversation } from "@/lib/types";
import client from "@/api/client";

export const useRealTimeMessages = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();
  const selectedChat = useAppSelector(selectSelectedChat);
  const conversations = useAppSelector(selectConversations);

  // Use ref to get current selectedChat without causing effect re-runs
  const selectedChatRef = useRef(selectedChat);
  const conversationsRef = useRef(conversations);

  selectedChatRef.current = selectedChat;
  conversationsRef.current = conversations;

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
    },
    [dispatch]
  );

  const handleMessageDeleted = useCallback(
    (data: { messageId: string; conversationId: string; deletedAt: Date }) => {
      const { messageId, conversationId, deletedAt } = data;

      if (
        selectedChatRef.current &&
        selectedChatRef.current._id === conversationId
      ) {
        dispatch(
          updateMessage({
            _id: messageId,
            isDeleted: true,
            deletedAt: deletedAt.toString(),
          })
        );
      }

      const affectedConversations = conversationsRef.current.filter(
        (conv) => conv.lastMessage && conv.lastMessage._id === messageId
      );

      // Update conversations where this was the last message
      affectedConversations.forEach((conv) => {
        dispatch(
          updateConversation({
            ...conv,
            lastMessage: {
              ...conv.lastMessage!,
              content: "",
              isDeleted: true,
              deletedAt: deletedAt.toString(),
            },
          })
        );
      });
    },
    [dispatch]
  );

  const handleMessageUpdated = useCallback(
    (data: {
      messageId: string;
      conversationId: string;
      content: string;
      editedAt: Date;
    }) => {
      const { messageId, conversationId, content, editedAt } = data;

      if (
        selectedChatRef.current &&
        selectedChatRef.current._id === conversationId
      ) {
        dispatch(
          updateMessage({
            _id: messageId,
            content: content,
            editedAt: editedAt.toString(),
          })
        );

        const affectedConversations = conversationsRef.current.filter(
          (conv) => conv.lastMessage && conv.lastMessage._id === messageId
        );

        affectedConversations.forEach((conv) => {
          dispatch(
            updateConversation({
              ...conv,
              lastMessage: {
                ...conv.lastMessage!,
                content: content,
                editedAt: editedAt.toString(),
              },
            })
          );
        });
      }
    },
    [dispatch]
  );

  // Listen for incoming messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Set up event listeners
    socket.on("newMessage", handleNewMessage);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("messageUpdated", handleMessageUpdated);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("messageUpdated", handleMessageUpdated);
    };
  }, [
    socket,
    isConnected,
    handleNewMessage,
    handleMessageDeleted,
    handleMessageUpdated,
  ]);

  // Send message function
  const sendMessage = useCallback(
    async (content: string, conversationId?: string) => {
      if (!content.trim()) {
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
    deleteMessage,
    editMessage,
    isConnected,
  };
};
