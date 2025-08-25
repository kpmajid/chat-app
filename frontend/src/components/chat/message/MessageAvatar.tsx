import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";

interface MessageAvatarProps {
  sender: User;
}

const MessageAvatar = ({ sender }: MessageAvatarProps) => {
  return (
    <div className="flex-shrink-0">
      <Avatar className="size-8">
        <AvatarImage
          src={sender.avatar || "/placeholder.svg"}
          alt={`${sender.username} avatar`}
        />
        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          {sender.username?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default MessageAvatar;
