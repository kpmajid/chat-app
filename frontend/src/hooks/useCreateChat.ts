import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import client from "@/api/client";
import { useAppDispatch } from "./redux";

import {
  addConversation,
  selectConversations,
  setSelectedChat,
} from "@/features/chat/chatSlice";

import { fetchMessages, markMessagesAsRead } from "@/features/chat/chatThunks";

import type { Conversation, User } from "@/lib/types";

export interface CreateChatFormData {
  isGroupChat: boolean;
  groupName: string;
  selectedUserId: string;
  groupParticipants: string[];
}

export const useCreateChat = (isOpen: boolean) => {
  const dispatch = useAppDispatch();
  const conversations = useSelector(selectConversations);

  const [formData, setFormData] = useState<CreateChatFormData>({
    isGroupChat: false,
    groupName: "",
    selectedUserId: "",
    groupParticipants: [],
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const resetForm = useCallback(() => {
    setFormData({
      isGroupChat: false,
      groupName: "",
      selectedUserId: "",
      groupParticipants: [],
    });
    setUsers([]);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await client.get("/api/chats/users");
      if (response.data.success) {
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const findExistingConversation = useCallback(
    (userId: string): Conversation | null => {
      return (
        conversations.find(
          (conversation) =>
            conversation.type === "user" &&
            conversation.participants.some(
              (participant) => participant._id === userId
            )
        ) || null
      );
    },
    [conversations]
  );

  const updateFormData = useCallback((updates: Partial<CreateChatFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const addParticipant = useCallback(
    (userId: string) => {
      if (
        formData.isGroupChat &&
        !formData.groupParticipants.includes(userId)
      ) {
        updateFormData({
          groupParticipants: [...formData.groupParticipants, userId],
        });
      } else if (!formData.isGroupChat) {
        updateFormData({ selectedUserId: userId });
      }
    },
    [formData.isGroupChat, formData.groupParticipants, updateFormData]
  );

  const removeParticipant = useCallback(
    (userId: string) => {
      if (formData.isGroupChat) {
        updateFormData({
          groupParticipants: formData.groupParticipants.filter(
            (id) => id !== userId
          ),
        });
      } else {
        updateFormData({ selectedUserId: "" });
      }
    },
    [formData.isGroupChat, formData.groupParticipants, updateFormData]
  );

  const selectChat = useCallback(
    (conversation: Conversation) => {
      dispatch(setSelectedChat(conversation));
      if (conversation._id) {
        dispatch(fetchMessages(conversation._id));
        if (conversation.unreadCount > 0) {
          dispatch(markMessagesAsRead(conversation._id));
        }
      }
    },
    [dispatch]
  );

  const createChat = async (): Promise<{
    success: boolean;
    conversation?: Conversation;
  }> => {
    try {
      setCreating(true);

      const endpoint = formData.isGroupChat
        ? "/api/chats/group"
        : "/api/chats/user";
      const payload = formData.isGroupChat
        ? { name: formData.groupName, participants: formData.groupParticipants }
        : { userId: formData.selectedUserId };

      const response = await client.post(endpoint, payload);

      if (response.data.success) {
        const newChat = response.data.data as Conversation;

        // Check if this is an existing conversation
        const isExistingChat = conversations.some(
          (conv) => conv._id === newChat._id
        );

        if (isExistingChat) {
          selectChat(newChat);
        } else {
          dispatch(addConversation(newChat));
          selectChat(newChat);
        }

        return { success: true, conversation: newChat };
      }

      return { success: false };
    } catch (error) {
      console.error("Error creating chat:", error);
      return { success: false };
    } finally {
      setCreating(false);
    }
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (formData.isGroupChat) {
      if (!formData.groupName.trim()) {
        return { isValid: false, error: "Group name is required" };
      }
      if (formData.groupParticipants.length < 1) {
        return {
          isValid: false,
          error: "At least 1 participant is required for a group chat",
        };
      }
    } else {
      if (!formData.selectedUserId) {
        return { isValid: false, error: "Please select a user" };
      }
    }
    return { isValid: true };
  };

  return {
    formData,
    users,
    loading,
    creating,
    updateFormData,
    addParticipant,
    removeParticipant,
    createChat,
    validateForm,
    findExistingConversation,
    selectChat,
    resetForm,
  };
};
