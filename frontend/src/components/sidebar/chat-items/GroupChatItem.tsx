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
import { AlertCircle } from "lucide-react";

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

  let senderName;
  let messageContent = `You created group ${conversationName}`;
  let isDeletedMessage = false;

  if (lastMessage) {
    const isDeleted =
      lastMessage.isDeleted ||
      !lastMessage.content ||
      lastMessage.content.trim() === "";

    senderName =
      lastMessage.sender._id === user?._id
        ? "You"
        : lastMessage.sender.username;

    if (isDeleted) {
      isDeletedMessage = true;

      messageContent =
        lastMessage.sender._id === user?._id
          ? "You deleted this message"
          : "This message was deleted";
    } else if (lastMessage.content) {
      messageContent = lastMessage.content;
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

          <div className="grid flex-1 text-left text-sm leading-tight ">
            {/* <span className="truncate font-semibold">{conversationName}</span> */}

            <div className="flex">
              <span className="truncate font-semibold">{conversationName}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {timestamp}
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-hidden">
              {senderName && (
                <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {senderName} :
                </span>
              )}
              {isDeletedMessage ? (
                <>
                  <AlertCircle className="size-3 flex-shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground italic">
                    {messageContent}
                  </span>
                </>
              ) : (
                <span className="truncate text-xs text-muted-foreground min-w-0">
                  {messageContent}
                </span>
              )}
            </div>
          </div>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default GroupChatItem;
