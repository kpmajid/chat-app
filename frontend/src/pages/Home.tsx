//frontend\src\pages
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";

import { io } from "socket.io-client";

import type { Conversation, Message } from "@/lib/types";
import ChatLayout from "@/components/layout/ChatLayout";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import ChatPlaceholder from "@/components/chat/ChatPlaceholder";

const socket = io(import.meta.env.VITE_API_URL, {
  withCredentials: true,
  autoConnect: false,
});

const Home = () => {
  const { user } = useSelector(selectAuth);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  useEffect(() => {
    // Establish Socket.IO connection when component mounts (user is authenticated)
    socket.connect();

    // Listen for incoming messages from the server
    socket.on("message", (newMessage: Message) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup: Disconnect socket when component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  // Handle Esc key to deselect chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && selectedChat) {
        setSelectedChat(null);
        setMessages([]); // Clear messages when deselecting chat
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: messages.length + 1,
      sender: user?.username,
      content: message,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Send message to the server
    socket.emit("sendMessage", newMessage);
    setMessage("");
  };

  const handleChatSelect = (conversation: Conversation) => {
    setSelectedChat(conversation);
    setMessages([]) // Clear current messages

    // You might want to load messages for this conversation here
    // setMessages(loadMessagesForConversation(conversation._id));

    // TODO: Load messages for this conversation
    // try {
    //   const response = await client.get(`/api/chats/${conversation._id}/messages`);
    //   if (response.data.success) {
    //     setMessages(response.data.data);
    //   }
    // } catch (error) {
    //   console.error("Error loading messages:", error);
    // }
  };

  return (
    <ChatLayout onChatSelect={handleChatSelect} selectedChat={selectedChat}>
      {selectedChat ? (
        <>
          <ChatHeader user={user!} selectedChat={selectedChat} />
          <div className="flex flex-1 flex-col">
            <ChatMessages messages={messages} user={user!} />
            <ChatInput
              message={message}
              setMessage={setMessage}
              onSubmit={handleSendMessage}
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
