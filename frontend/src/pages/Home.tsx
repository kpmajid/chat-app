//frontend\src\pages
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectSelectedChat, setSelectedChat } from "@/features/chat/chatSlice";
import { useAppDispatch } from "@/hooks/redux";

import ChatLayout from "@/components/layout/ChatLayout";
import ChatPlaceholder from "@/components/chat/ChatPlaceholder";
import ChatContent from "@/components/chat/ChatContent";

const Home = () => {
  const selectedChat = useSelector(selectSelectedChat);
  const dispatch = useAppDispatch();

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
      {selectedChat ? <ChatContent /> : <ChatPlaceholder />}
    </ChatLayout>
  );
};

export default Home;
