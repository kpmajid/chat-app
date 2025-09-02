//frontend\src\lib\types.ts
export type ConversationType = "user" | "group";

export interface ChatGroup {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  googleId?: string;
  username: string;
  email: string;
  avatar?: string;
  online: boolean;
  createdAt: string; // Add timestamps
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  readBy?: string[];
  editedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  avatar?: string;
  members: Array<{
    user: User | string;
    role: "admin" | "member";
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LastMessage {
  _id: string;
  conversation: string;
  sender: User;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  type: "user" | "group";
  participants: User[];
  group?: Group;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}
