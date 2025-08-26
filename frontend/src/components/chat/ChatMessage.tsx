//frontend\src\components\chat
import type { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import MessageBubble from "./message/MessageBubble";
import MessageAvatar from "./message/MessageAvatar";
import DeletedMessageBubble from "./message/DeletedMessageBubble";

interface ChatMessageProps {
  message: Message;
  user: User;
  isGroup?: boolean;
  onDeleteMessage?: (id: string) => Promise<void> | void;
  onEditMessage?: (id: string, newContent: string) => Promise<void> | void;
}

const ChatMessage = ({
  message,
  user,
  isGroup = false,
  onDeleteMessage,
  onEditMessage
}: ChatMessageProps) => {
  const isOutgoing = message.sender._id === user?._id;
  const isDeleted =
    message.isDeleted || !message.content || message.content.trim() === "";

  if (isDeleted) {
    return (
      <div
        className={cn(
          "flex w-full items-end gap-3 group",
          isOutgoing ? "justify-end" : "justify-start"
        )}
        role="listitem"
      >
        {!isOutgoing && <MessageAvatar sender={message.sender} />}

        <DeletedMessageBubble
          message={message}
          isOutgoing={isOutgoing}
          isGroup={isGroup}
        />

        {isOutgoing && <div className="size-8 flex-shrink-0" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3 group",
        isOutgoing ? "justify-end" : "justify-start"
      )}
      role="listitem"
    >
      {!isOutgoing && <MessageAvatar sender={message.sender} />}

      <MessageBubble
        message={message}
        isOutgoing={isOutgoing}
        isGroup={isGroup}
        onDeleteMessage={onDeleteMessage}
        onEditMessage={onEditMessage}
      />

      {isOutgoing && <div className="size-8 flex-shrink-0" />}
    </div>
  );
};

export default ChatMessage;
