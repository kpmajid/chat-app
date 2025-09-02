// features/chat/chatThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import client from "@/api/client";
import type { Conversation } from "@/lib/types";

// Fetch all conversations
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await client.get("/api/chats/");

      if (response.data.success) {
        return response.data.data as Conversation[];
      } else {
        throw new Error(
          response.data.message || "Failed to fetch conversations"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

// Create or get user conversation
export const createOrGetUserConversation = createAsyncThunk(
  "chat/createOrGetUserConversation",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await client.post("/api/chats/user", { userId });

      if (response.data.success) {
        return {
          conversation: response.data.data as Conversation,
          isExisting: response.data.message === "Chat retrieved successfully",
        };
      } else {
        throw new Error(
          response.data.message || "Failed to create conversation"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

// Create group conversation
export const createGroupConversation = createAsyncThunk(
  "chat/createGroupConversation",
  async (
    payload: { name: string; participants: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await client.post("/api/chats/group", payload);

      if (response.data.success) {
        return response.data.data as Conversation;
      } else {
        throw new Error(
          response.data.message || "Failed to create group conversation"
        );
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

// Fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await client.get(`/api/messages/${conversationId}`);

      if (response.data.success) {
        return response.data.data.messages;
      } else {
        throw new Error(response.data.message || "Failed to fetch messages");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  "chat/markMessagesAsRead",
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await client.post("/api/messages/mark-read", {
        conversationId,
      });

      if (response.data.success) {
        return { conversationId, unreadCount: 0 };
      } else {
        throw new Error(response.data.message || "Failed to mark as read");
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  }
);
