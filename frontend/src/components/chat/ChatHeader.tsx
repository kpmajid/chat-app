//frontend\src\components\chat
import type { Conversation, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

const ChatHeader = ({
  user,
  selectedChat,
}: {
  user: User;
  selectedChat: Conversation;
}) => {
  const { isMobile } = useSidebar();

  const chatPartner =
    selectedChat.type === "user"
      ? selectedChat.participants.find((p) => p._id !== user._id)
      : null;

  const displayName =
    selectedChat.type === "group"
      ? selectedChat.group?.name
      : chatPartner?.username || "Chat";

  const displayAvatar =
    selectedChat.type === "group"
      ? selectedChat.group?.avatar
      : chatPartner?.avatar;

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
        <Avatar>
          <AvatarImage src={displayAvatar} />
          <AvatarFallback>{displayName?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className=" font-semibold">{displayName}</h2>
          <p className="text-xs text-muted-foreground">
            {selectedChat.type === "group"
              ? `${selectedChat.participants.length} members`
              : "Active"}
          </p>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
