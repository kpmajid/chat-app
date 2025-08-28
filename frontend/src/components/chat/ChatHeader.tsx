//frontend\src\components\chat
import type { Conversation, User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineIndicator from "../OnlineIndicator";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

interface ChatHeaderProps {
  user: User;
  selectedChat: Conversation;
  onToggleDetails: () => void;
}

const ChatHeader = ({
  user,
  selectedChat,
  onToggleDetails,
}: ChatHeaderProps) => {
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
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isMobile && <SidebarTrigger />}

          <button
            className="flex items-center gap-3 min-w-0 flex-1 text-left hover:bg-accent/50 rounded-lg p-2 -m-2 transition-colors"
            onClick={onToggleDetails}
            aria-label="Open chat details"
          >
            <div className="relative">
              <Avatar className="size-10 ring-2 ring-border/5">
                <AvatarImage src={displayAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {displayName?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              {selectedChat.type === "user" && chatPartner && (
                <OnlineIndicator isOnline={chatPartner.online} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-base truncate">
                {displayName}
              </h2>
              <p className="text-xs text-muted-foreground">
                {selectedChat.type === "group"
                  ? `${selectedChat.participants.length} members`
                  : chatPartner?.online
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1" aria-label="Chat actions">
          {/* Future: Search, Call, Video, Info buttons */}
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
