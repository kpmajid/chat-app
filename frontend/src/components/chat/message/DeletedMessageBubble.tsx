import { formatTimestamp } from "@/lib/formatTimestamp";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface DeletedMessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  isGroup: boolean;
}

const DeletedMessageBubble = ({
  message,
  isOutgoing,
  isGroup,
}: DeletedMessageBubbleProps) => {
  const deletedTime = message.deletedAt
    ? formatTimestamp(message.deletedAt)
    : formatTimestamp(message.createdAt!);

  const deletedText = isOutgoing
    ? "You deleted this message"
    : "This message was deleted";

  return (
    <div className="flex flex-col max-w-[75%] sm:max-w-[65%]">
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
            "bg-muted/50 text-muted-foreground border-muted",
            isOutgoing ? "rounded-br-md" : "rounded-bl-md"
          )}
        >
          <div className="flex items-center gap-2 text-sm leading-relaxed">
            <AlertCircle className="size-4 flex-shrink-0" />
            <span className="italic">{deletedText}</span>
          </div>

          <span
            className={cn(
              "absolute bottom-1 right-2",
              "text-[10px] leading-none opacity-70 select-none",
              "text-muted-foreground"
            )}
          >
            {deletedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DeletedMessageBubble;
