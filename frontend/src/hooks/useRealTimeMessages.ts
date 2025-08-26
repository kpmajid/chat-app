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

      console.log("New message received:", message);
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

      console.log("Message deleted by participant:", messageId);
    },
    [dispatch]
  );

  const handleMessageUpdated = useCallback(
    (data: {
      messageId: string;
      conversationId: string;
      content: string;
      editedAt : Date;
    }) => {
      const { messageId, conversationId, content, editedAt   } = data;

      if (
        selectedChatRef.current &&
        selectedChatRef.current._id === conversationId
      ) {
        dispatch(
          updateMessage({
            _id: messageId,
            content: content,
            editedAt : editedAt .toString(),
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
                editedAt : editedAt .toString(),
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

  const deleteMessage = useCallback(
    (messageId: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log("deleteMessage called");
        if (!socket || !isConnected) {
          console.error("Socket not connected");
          return reject(new Error("Socket not connected"));
        }

        if (!messageId?.trim()) {
          console.error("Message ID is required");
          return reject(new Error("Message ID is required"));
        }

        const conversationId = selectedChatRef.current?._id;

        if (!conversationId?.trim()) {
          console.error("No conversation selected");
          return reject(new Error("No conversation selected"));
        }

        const messageData = {
          messageId,
          conversationId,
        };

        socket.emit("deleteMessage", messageData, (response: any) => {
          if (response.status === "success") {
            if (
              selectedChatRef.current &&
              selectedChatRef.current._id === conversationId
            ) {
              dispatch(
                updateMessage({
                  _id: messageId,
                  isDeleted: true,
                  deletedAt: new Date().toISOString(),
                })
              );
            }

            // Check if deleted message was the last message in any conversation
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
                  },
                })
              );
            });

            console.log("Message deleted successfully:", messageId);
            resolve(response);
          } else {
            console.error("Failed to delete message:", response.message);
            reject(new Error(response.message));
          }
        });
      });
    },
    [socket, isConnected, dispatch]
  );

  const editMessage = useCallback(
    (messageId: string, content: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (!socket || !isConnected) {
          console.error("Socket not connected");
          return reject(new Error("Socket not connected"));
        }

        if (!content.trim()) {
          console.error("Content is required");
          return reject(new Error("Content is required"));
        }

        if (!messageId?.trim()) {
          console.error("Message ID is required");
          return reject(new Error("Message ID is required"));
        }

        const conversationId = selectedChatRef.current?._id;
        if (!conversationId?.trim()) {
          console.error("No conversation selected");
          return reject(new Error("No conversation selected"));
        }

        const messageData = {
          content,
          messageId,
          conversationId,
        };

        socket.emit("updateMessage", messageData, (response: any) => {
          if (response.status === "success") {
            if (
              selectedChatRef.current &&
              selectedChatRef.current._id === conversationId
            ) {
              dispatch(
                updateMessage({
                  _id: messageId,
                  content: content,
                  editedAt : new Date().toISOString(),
                })
              );
            }

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
                  },
                })
              );
            });

            console.log("Message updated successfully:", messageId);
            resolve(response);
          } else {
            console.error("Failed to update message:", response.message);
            reject(new Error(response.message));
          }
        });
      });
    },
    [socket, isConnected, dispatch]
  );

  return {
    sendMessage,
    deleteMessage,
    editMessage,
    isConnected,
  };
};
