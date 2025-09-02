// features/chat/chatSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Conversation, Message } from "@/lib/types";
import {
  fetchConversations,
  createOrGetUserConversation,
  createGroupConversation,
  fetchMessages,
  markMessagesAsRead,
} from "./chatThunks";

interface ChatState {
  conversations: Conversation[];
  selectedChat: Conversation | null;
  messages: Message[];
  conversationsLoading: boolean;
  messagesLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  selectedChat: null,
  messages: [],
  conversationsLoading: false,
  messagesLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Conversations
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },

    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.some(
        (conv) => conv._id === action.payload._id
      );
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },

    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(
        (conv) => conv._id === action.payload._id
      );
      if (index !== -1) {
        state.conversations.splice(index, 1);
        state.conversations.unshift(action.payload);
      } else {
        state.conversations.unshift(action.payload);
      }
    },

    removeConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (conv) => conv._id !== action.payload
      );
    },

    // Selected Chat
    setSelectedChat: (state, action: PayloadAction<Conversation | null>) => {
      state.selectedChat = action.payload;
      // Clear messages when changing chat
      if (action.payload?._id !== state.selectedChat?._id) {
        state.messages = [];
      }
    },

    clearSelectedChat: (state) => {
      state.selectedChat = null;
      state.messages = [];
    },

    // Messages
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },

    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      if (state.messages.length > 100) {
        state.messages.shift();
      }
    },

    updateMessage: (
      state,
      action: PayloadAction<Partial<Message> & { _id: string }>
    ) => {
      const index = state.messages.findIndex(
        (msg) => msg._id === action.payload._id
      );
      if (index !== -1) {
        state.messages[index] = { ...state.messages[index], ...action.payload };
      }
    },

    removeMessage: (state, action: PayloadAction<string>) => {
      state.messages = state.messages.filter(
        (msg) => msg._id !== action.payload
      );
    },

    // Error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Helper actions
    findOrCreateConversation: (
      state,
      action: PayloadAction<{ userId: string; currentUserId: string }>
    ) => {
      const { userId, currentUserId } = action.payload;
      const existingConversation = state.conversations.find(
        (conv) =>
          conv.type === "user" &&
          conv.participants.some((p) => p._id === userId) &&
          conv.participants.some((p) => p._id === currentUserId)
      );

      if (existingConversation) {
        state.selectedChat = existingConversation;
      }
      // If not found, the component will handle creation
    },

    //update the user online status?
    updateUserOnlineStatus: (
      state,
      action: PayloadAction<{
        userId: string;
        online: boolean;
      }>
    ) => {
      const { userId, online } = action.payload;

      // Update in conversations
      state.conversations = state.conversations.map((conversation) => ({
        ...conversation,
        participants: conversation.participants.map((participant) =>
          participant._id === userId ? { ...participant, online } : participant
        ),
      }));

      // Update in selected chat if it matches
      if (state.selectedChat) {
        state.selectedChat = {
          ...state.selectedChat,
          participants: state.selectedChat.participants.map((participant) =>
            participant._id === userId
              ? { ...participant, online }
              : participant
          ),
        };
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;

      // Update conversation unread count
      const conversation = state.conversations.find(
        (conv) => conv._id === conversationId
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload as string;
      })

      // Create or get user conversation
      .addCase(createOrGetUserConversation.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(createOrGetUserConversation.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        const { conversation, isExisting } = action.payload;

        if (!isExisting) {
          // Add new conversation if it's newly created
          const exists = state.conversations.some(
            (conv) => conv._id === conversation._id
          );
          if (!exists) {
            state.conversations.unshift(conversation);
          }
        }

        // Set as selected chat
        state.selectedChat = conversation;
        state.messages = []; // Clear messages for new selection
      })
      .addCase(createOrGetUserConversation.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload as string;
      })

      // Create group conversation
      .addCase(createGroupConversation.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(createGroupConversation.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        // Add new group conversation
        state.conversations.unshift(action.payload);
        state.selectedChat = action.payload;
        state.messages = []; // Clear messages for new selection
      })
      .addCase(createGroupConversation.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload as string;
      })

      // Fetch messages - this should show loading in chat area, not sidebar
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload as string;
      })

      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { conversationId } = action.payload;
        const conversation = state.conversations.find(
          (conv) => conv._id === conversationId
        );
        if (conversation) {
          conversation.unreadCount = 0;
        }
      });
  },
});

export const {
  setConversations,
  addConversation,
  updateConversation,
  removeConversation,
  setSelectedChat,
  clearSelectedChat,
  setMessages,
  addMessage,
  updateMessage,
  setError,
  findOrCreateConversation,
  updateUserOnlineStatus,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectChat = (state: { chat: ChatState }) => state.chat;
export const selectConversations = (state: { chat: ChatState }) =>
  state.chat.conversations;
export const selectSelectedChat = (state: { chat: ChatState }) =>
  state.chat.selectedChat;
export const selectMessages = (state: { chat: ChatState }) =>
  state.chat.messages;
export const selectConversationsLoading = (state: { chat: ChatState }) =>
  state.chat.conversationsLoading;
export const selectMessagesLoading = (state: { chat: ChatState }) =>
  state.chat.messagesLoading;
export const selectChatError = (state: { chat: ChatState }) => state.chat.error;
