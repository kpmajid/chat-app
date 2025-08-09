import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageCircle, Check } from "lucide-react";

import type { User } from "@/lib/types";

interface UserSelectorProps {
  users: User[];
  loading: boolean;
  isGroupChat: boolean;
  selectedUserId: string;
  groupParticipants: string[];
  findExistingConversation: (userId: string) => boolean;
  onUserSelect: (userId: string) => void;
}

const UserSelector = ({
  users,
  loading,
  isGroupChat,
  selectedUserId,
  groupParticipants,
  findExistingConversation,
  onUserSelect,
}: UserSelectorProps) => {
  const getUsersWithChatStatus = () => {
    return users.map((user) => ({
      ...user,
      hasExistingChat: findExistingConversation(user._id),
      isSelected: isGroupChat
        ? groupParticipants.includes(user._id)
        : selectedUserId === user._id,
    }));
  };

  const getPlaceholder = () => {
    if (loading) return "Loading users...";
    if (isGroupChat) return "Add participants...";
    return "Select a user...";
  };

  return (
    <div className="space-y-2">
      <Label>{isGroupChat ? "Select Participants" : "Select User"}</Label>
      <Select value="" onValueChange={onUserSelect} disabled={loading}>
        <SelectTrigger className="h-10 w-full ">
          <SelectValue placeholder={getPlaceholder()} />
        </SelectTrigger>

        <SelectContent>
          <ScrollArea className="max-h-48">
            {getUsersWithChatStatus().map((user) => (
              <SelectItem
                key={user._id}
                value={user._id}
                disabled={user.isSelected}
                className="data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none"
              >
                <div className="flex w-full items-center gap-2 text-sm">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={
                        user.avatar ||
                        "/placeholder.svg?height=48&width=48&query=user%20avatar"
                      }
                      alt={`${user.username}'s avatar`}
                    />
                    <AvatarFallback className="text-[10px]">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate">{user.username}</span>

                  <div className="flex items-center gap-1">
                    {!isGroupChat && user.hasExistingChat && (
                      <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    {user.isSelected && (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserSelector;
