import { formatTimestamp } from "@/lib/formatTimestamp";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import MessageActions from "./MessageActions";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  isGroup: boolean;
  onDeleteMessage?: (id: string) => Promise<void> | void;
}

const MessageBubble = ({
  message,
  isOutgoing,
  isGroup,
  onDeleteMessage,
}: MessageBubbleProps) => {
  const time = formatTimestamp(message.createdAt!);
  const canDelete = isOutgoing;

  return (
    <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
      {/* Sender name for group chats only */}
      {!isOutgoing && isGroup && (
        <span className="text-xs text-muted-foreground mb-1 ml-3">
          {message.sender.username}
        </span>
      )}

      <div className="relative">
        <div
          className={cn(
            "relative px-3 py-2 pb-5 rounded-2xl",
            "shadow-sm border transition-all duration-200",
            isOutgoing
              ? cn("bg-blue-600 text-white border-blue-600/20", "rounded-br-md")
              : cn(
                  "bg-card text-card-foreground border-border",
                  "rounded-bl-md"
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
              isOutgoing ? "text-blue-100/80" : "text-muted-foreground"
            )}
          >
            {time}
          </span>
        </div>

        <MessageActions
          message={message}
          canDelete={canDelete}
          onDeleteMessage={onDeleteMessage}
        />
      </div>
    </div>
  );
};

export default MessageBubble;
