//frontend\src\components\sidebar\chat-items
import type { Conversation } from "@/lib/types";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { selectSelectedChat, setSelectedChat } from "@/features/chat/chatSlice";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/hooks/redux";
import { fetchMessages } from "@/features/chat/chatThunks";

interface SidebarChatItemProps {
  conversation: Conversation;
}

const GroupChatItem = ({ conversation }: SidebarChatItemProps) => {
  const dispatch = useAppDispatch();
  const { user } = useSelector(selectAuth);
  const selectedChat = useSelector(selectSelectedChat);

  if (!conversation.group) return null;

  const conversationName = conversation.group.name;
  const avatar = conversation.group.avatar || "";
  const lastMessage = conversation.lastMessage;

  let lastMessageContent = `You created group ${conversationName}`;
  if (lastMessage && conversation.lastMessage?.content) {
    const senderName =
      lastMessage.sender._id === user?._id
        ? "You"
        : lastMessage.sender.username;
    lastMessageContent = `${senderName}: ${lastMessage.content}`;
  }

  const timestamp = conversation.lastMessage?.createdAt
    ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
    : new Date(conversation.createdAt).toLocaleDateString();

  const handleChatSelect = () => {
    dispatch(setSelectedChat(conversation));

    // Load messages for this conversation
    if (conversation._id) {
      dispatch(fetchMessages(conversation._id));
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
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={avatar} alt={conversationName} />
            <AvatarFallback className="rounded-lg bg-blue-500 text-white">
              {conversationName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{conversationName}</span>
            <span className="truncate text-xs text-muted-foreground">
              {lastMessageContent}
            </span>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {timestamp}
          </span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default GroupChatItem;
