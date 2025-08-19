import { useCallback, useMemo } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useSelector } from "react-redux";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { selectMessages, selectSelectedChat } from "@/features/chat/chatSlice";
import { selectAuth } from "@/features/auth/authSlice";

const ChatContent = () => {
  const { user } = useSelector(selectAuth);

  const selectedChat = useSelector(selectSelectedChat);
  const messages = useSelector(selectMessages);
  const { sendMessage, isConnected } = useRealTimeMessages();

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!selectedChat || !isConnected) return;
      sendMessage(message, selectedChat._id);
    },
    [selectedChat, isConnected, sendMessage]
  );

  const isGroup = useMemo(
    () => selectedChat?.type === "group",
    [selectedChat?.type]
  );

  return (
    <div className="flex flex-col h-full">
      <ChatHeader user={user!} selectedChat={selectedChat!} />
      <ChatMessages messages={messages} user={user!} isGroup={isGroup} />
      <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected} />
    </div>
  );
};

ChatContent.displayName = "ChatContent";

export default ChatContent;
