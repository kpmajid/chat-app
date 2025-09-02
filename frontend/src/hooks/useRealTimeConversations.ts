import { useCallback, useEffect } from "react";
import { useAppDispatch } from "./redux";
import { addConversation } from "@/features/chat/chatSlice";
import { toast } from "sonner";
import type { Conversation } from "@/lib/types";
import { useSocket } from "./useSocket";

interface NewConversationEvent {
  conversation: Conversation;
  initiatedBy: {
    _id: string;
    username: string;
    avatar?: string;
  };
}

export const useRealTimeConversations = () => {
  const { socket, isConnected } = useSocket();
  const dispatch = useAppDispatch();

  const handleNewConversation = useCallback(
    (data: NewConversationEvent) => {
      console.log("new Conversation revieved: ", data);
      dispatch(addConversation(data.conversation));

      const isGroup = data.conversation.type === "group";
      const notificationMessage = isGroup
        ? `${data.initiatedBy.username} added you to "${data.conversation.group?.name}"`
        : `New chat started by ${data.initiatedBy.username}`;

      toast.info(notificationMessage, {
        description: isGroup ? "Group chat" : "Direct message",
      });
    },
    [dispatch]
  );

  // const handleUpdate

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Conversation events only - user status handled by useOnlineStatus
    socket.on("newConversation", handleNewConversation);
    return () => {
      socket.off("newConversation", handleNewConversation);
    };
  }, [socket, isConnected, handleNewConversation]);

  return {};
};
