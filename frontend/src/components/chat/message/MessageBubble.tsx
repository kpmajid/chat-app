import { formatTimestamp } from "@/lib/formatTimestamp";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import MessageActions from "./MessageActions";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
  isGroup: boolean;
  onDeleteMessage?: (id: string) => Promise<void> | void;
  onEditMessage?: (id: string, newContent: string) => Promise<void> | void;
}

const MessageBubble = ({
  message,
  isOutgoing,
  isGroup,
  onDeleteMessage,
  onEditMessage,
}: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = async () => {
    console.log(onEditMessage)
    if (
      editContent.trim() &&
      editContent !== message.content &&
      onEditMessage
    ) {
      await onEditMessage(message._id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const time = formatTimestamp(message.createdAt!);

  return (
    <div
      className={cn(
        "flex flex-col max-w-[75%] sm:max-w-[65%]",
        isOutgoing ? "items-end" : "items-start"
      )}
    >
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
              ? "bg-blue-600 text-white border-blue-600/20 rounded-br-md"
              : "bg-card text-card-foreground border-border rounded-bl-md",
            isEditing &&
              "ring-2 ring-blue-400/50 dark:ring-blue-500/50 shadow-lg"
          )}
        >
          {isEditing ? (
            <div className="space-y-1">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={cn(
                  "w-full min-h-[60px] resize-none",
                  "text-sm leading-relaxed",
                  "border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  "bg-transparent",
                  "text-white placeholder:text-blue-100/60 selection:bg-white/20",
                  "bg-white/15 rounded-lg px-2 py-1"
                )}
                placeholder="Edit your message..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === "Escape") {
                    handleCancelEdit();
                  }
                }}
              />
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={handleCancelEdit}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:scale-105 active:scale-95 text-white/80 hover:bg-white/10 hover:text-white border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm bg-white/20 text-white hover:bg-white/30 border border-white/30"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap pr-8">
              {message.content}
              {message.editedAt && (
                <span className="text-xs opacity-70 ml-2">(edited)</span>
              )}
            </div>
          )}

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

        {!isEditing && (
          <MessageActions
            message={message}
            isOutgoing={isOutgoing}
            onDeleteMessage={onDeleteMessage}
            onEditMessage={() => setIsEditing(true)}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
