import { useCallback, useMemo, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import { useSelector } from "react-redux";
import { selectMessages, selectSelectedChat } from "@/features/chat/chatSlice";
import { selectAuth } from "@/features/auth/authSlice";
import ChatDetailsPanel from "./ChatDetailsPanel";
import { useMessageActions } from "@/hooks/useMessageActions";

const ChatContent = () => {
  const { user } = useSelector(selectAuth);
  const selectedChat = useSelector(selectSelectedChat);
  const messages = useSelector(selectMessages);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { sendMessage, deleteMessage, editMessage, isConnected } =
    useMessageActions();

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!selectedChat || !isConnected) return;
      sendMessage(message, selectedChat._id);
    },
    [selectedChat, isConnected, sendMessage]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (!selectedChat || !isConnected) return;
      return deleteMessage(messageId);
    },
    [deleteMessage, isConnected, selectedChat]
  );

  const handleUpdateMessage = useCallback(
    (messageId: string, content: string) => {
      if (!selectedChat || !isConnected) return;
      return editMessage(messageId, content);
    },
    [editMessage, isConnected, selectedChat]
  );

  const isGroup = useMemo(
    () => selectedChat?.type === "group",
    [selectedChat?.type]
  );

  return (
    <div className="flex h-full relative overflow-hidden">
      <div className="flex flex-col h-full flex-1 transition-all duration-300 min-w-0">
        <ChatHeader
          user={user!}
          selectedChat={selectedChat!}
          onToggleDetails={() => setIsDetailsOpen(!isDetailsOpen)}
        />
        <ChatMessages
          messages={messages}
          user={user!}
          isGroup={isGroup}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleUpdateMessage}
        />
        <ChatInput onSendMessage={handleSendMessage} disabled={!isConnected} />
      </div>
      <ChatDetailsPanel
        user={user!}
        chat={selectedChat}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

ChatContent.displayName = "ChatContent";

export default ChatContent;
