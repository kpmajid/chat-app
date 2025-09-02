//frontend\src\components\sidebar\chat-items
import type { Conversation } from "@/lib/types";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineIndicator from "@/components/OnlineIndicator";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { selectSelectedChat, setSelectedChat } from "@/features/chat/chatSlice";
import { selectAuth } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import { fetchMessages, markMessagesAsRead } from "@/features/chat/chatThunks";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SidebarChatItemProps {
  conversation: Conversation;
}

const UserChatItem = ({ conversation }: SidebarChatItemProps) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector(selectAuth);
  const selectedChat = useSelector(selectSelectedChat);

  // Find the other participant (not the current user)
  const otherParticipant = conversation.participants.find(
    (participant) => participant._id !== user?._id
  );

  if (!otherParticipant) return null;

  const conversationName = otherParticipant.username;
  const avatar = otherParticipant.avatar || "";
  const lastMessage = conversation.lastMessage;
  const unreadCount = conversation.unreadCount;

  let lastMessageContent = "No messages yet";
  let isDeletedMessage = false;

  if (lastMessage) {
    const isDeleted =
      lastMessage.isDeleted ||
      !lastMessage.content ||
      lastMessage.content.trim() === "";

    if (isDeleted) {
      isDeletedMessage = true;
      lastMessageContent =
        lastMessage.sender._id === user?._id
          ? "You deleted this message"
          : "This message was deleted";
    } else if (lastMessage.content) {
      lastMessageContent = lastMessage.content;
    }
  }

  const timestamp = conversation.lastMessage?.createdAt
    ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
    : new Date(conversation.createdAt).toLocaleDateString();

  const handleChatSelect = () => {
    dispatch(setSelectedChat(conversation));

    // Load messages for this conversation
    if (conversation._id) {
      dispatch(fetchMessages(conversation._id));
      if (conversation.unreadCount > 0) {
        dispatch(markMessagesAsRead(conversation._id));
      }
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        onClick={handleChatSelect}
        isActive={selectedChat?._id === conversation._id}
        className={cn(
          "w-full justify-start gap-3 p-3 h-auto",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
        )}
      >
        <div className="flex flex-grow items-center gap-2">
          <div className="relative">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatar} alt={conversationName} />
              <AvatarFallback className="rounded-lg">
                {conversationName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <OnlineIndicator isOnline={otherParticipant.online} />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <div className="flex">
              <span className="truncate font-semibold">{conversationName}</span>
              <div className="ml-auto flex items-center gap-2">
                {unreadCount > 0 && (
                  <Badge className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {timestamp}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 overflow-hidden">
              {isDeletedMessage ? (
                <>
                  <AlertCircle className="size-3 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground italic">
                    {lastMessageContent}
                  </span>
                </>
              ) : (
                <span className="truncate text-xs text-muted-foreground min-w-0">
                  {lastMessageContent}
                </span>
              )}
            </div>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default UserChatItem;
