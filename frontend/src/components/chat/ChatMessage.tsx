//frontend\src\components\chat
import type { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimestamp } from "@/lib/format";

const ChatMessage = ({
  message,
  user,
  isGroup = false,
}: {
  message: Message;
  user: User;
  isGroup?: boolean;
}) => {
  const isOutgoing = message.sender._id === user?._id;
  const time = formatTimestamp(message.timestamp ?? message.createdAt) || "";

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3 group",
        isOutgoing ? "justify-end" : "justify-start"
      )}
      role="listitem"
    >
      {/* Avatar for incoming messages (always show) */}
      {!isOutgoing && (
        <div className="flex-shrink-0">
          <Avatar className="size-8">
            <AvatarImage
              src={message.sender.avatar || "/placeholder.svg"}
              alt={`${message.sender.username} avatar`}
            />
            <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {message.sender.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Message bubble */}
      <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
        {/* Sender name for group chats only */}
        {!isOutgoing && isGroup && (
          <span className="text-xs text-muted-foreground mb-1 ml-3">
            {message.sender.username}
          </span>
        )}

        {/* Message content with timestamp in bottom corner */}
        <div
          className={cn(
            "relative px-3 py-2 pb-5 rounded-2xl", // Extra bottom padding for timestamp
            "shadow-sm border transition-all duration-200",
            isOutgoing
              ? cn(
                  "bg-blue-600 text-white border-blue-600/20",
                  "rounded-br-md" // Sharp corner for sent messages
                )
              : cn(
                  "bg-card text-card-foreground border-border",
                  "rounded-bl-md" // Sharp corner for received messages
                )
          )}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed break-words whitespace-pre-wrap pr-8">
            {message.content}
          </div>
          
          {/* Timestamp in bottom right corner */}
          <span
            className={cn(
              "absolute bottom-1 right-2",
              "text-[10px] leading-none opacity-70 select-none",
              isOutgoing 
                ? "text-blue-100/80" 
                : "text-muted-foreground"
            )}
          >
            {time}
          </span>
        </div>
      </div>

      {/* Spacer for outgoing messages to maintain consistent width */}
      {isOutgoing && <div className="size-8 flex-shrink-0" />}
    </div>
  );
};

export default ChatMessage;
