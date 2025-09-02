import type { Conversation, Message } from "@/lib/types";
import { useAppDispatch, useAppSelector } from "./redux";
import { useSocket } from "./useSocket";
import { useCallback, useEffect, useRef } from "react";
import {
  addMessage,
  selectConversations,
  selectSelectedChat,
  updateConversation,
  updateMessage,
} from "@/features/chat/chatSlice";
import { markMessagesAsRead } from "@/features/chat/chatThunks";

export const useMessageListeners = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();
  const selectedChat = useAppSelector(selectSelectedChat);
  const conversations = useAppSelector(selectConversations);

  const selectedChatRef = useRef(selectedChat);
  const conversationsRef = useRef(conversations);

  selectedChatRef.current = selectedChat;
  conversationsRef.current = conversations;

  // Memoize the message handler to prevent effect re-runs
  const handleNewMessage = useCallback(
    (data: { message: Message; conversation: Conversation }) => {
      console.log(data);
      const { message, conversation } = data;

      dispatch(updateConversation(conversation));

      if (
        selectedChatRef.current &&
        selectedChatRef.current._id === conversation._id
      ) {
        dispatch(addMessage(message));
        dispatch(markMessagesAsRead(conversation._id));
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

  return { isConnected };
};
