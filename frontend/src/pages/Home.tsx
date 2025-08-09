//frontend\src\pages
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";
import {
  selectSelectedChat,
  selectMessages,
  setSelectedChat,
} from "@/features/chat/chatSlice";
import { useAppDispatch } from "@/hooks/redux";

import ChatLayout from "@/components/layout/ChatLayout";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatPlaceholder from "@/components/chat/ChatPlaceholder";

const Home = () => {
  const { user } = useSelector(selectAuth);
  const selectedChat = useSelector(selectSelectedChat);
  const messages = useSelector(selectMessages);
  const dispatch = useAppDispatch();
  const [message, setMessage] = useState("");

  // Handle Esc key to deselect chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedChat) {
        dispatch(setSelectedChat(null));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChat, dispatch]);

  return (
    <ChatLayout>
      {selectedChat ? (
        <>
          <ChatHeader user={user!} selectedChat={selectedChat} />
          <div className="flex flex-1 flex-col">
            <ChatMessages messages={messages} user={user!} />
            <ChatInput
              message={message}
              setMessage={setMessage}
            />
          </div>
        </>
      ) : (
        <ChatPlaceholder />
      )}
    </ChatLayout>
  );
};

export default Home;
