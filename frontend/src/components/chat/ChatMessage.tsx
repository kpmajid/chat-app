//frontend\src\components\chat
import type { Message, User } from "@/lib/types";
import { cn } from "@/lib/utils";

const ChatMessage = ({ message, user }: { message: Message; user: User }) => {
  const isOutgoing = message.sender._id === user?.username;

  return (
    <div
      className={cn(
        "flex",
        "mb-2",
        isOutgoing ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl p-2 shadow-sm",
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-muted rounded-tl-none"
        )}
      >
        {!isOutgoing && (
          <p className="text-xs font-semibold text-gray-600 mb-1">
            {message.sender.username}
          </p>
        )}
        <div className="text-sm">{message.content}</div>
        <p className="text-xs  mt-1 opacity-70 text-right">
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
