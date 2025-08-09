//frontend\src\lib
export type ConversationType = "user" | "group";

export interface ChatGroup {
  _id: string;
  name: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  timestamp: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  _id: string;
  name: string;
  members: Array<{
    user: string;
    role: "admin" | "member";
  }>;
  avatar?: string; // Add this field to your Group model if not present
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
  lastMessage?: LastMessage;
  updatedAt: string;
  createdAt: string;
}
