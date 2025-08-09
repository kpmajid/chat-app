import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Users, X, MessageCircle } from "lucide-react";
import type { User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SelectedParticipantsProps {
  isGroupChat: boolean;
  selectedUser?: User;
  selectedParticipants: User[];
  hasExistingChat?: boolean;
  onRemoveParticipant: (userId: string) => void;
}

function UserToken({
  user,
  onRemove,
}: {
  user: User;
  onRemove: () => void;
  className?: string;
}) {
  return (
    <Badge className="inline-flex h-8 items-center gap-2 rounded-full px-2 pr-1.5 text-sm">
      <Avatar className="h-6 w-6">
        <AvatarImage
          src={
            user.avatar ||
            "/placeholder.svg?height=48&width=48&query=user%20avatar"
          }
          alt={`${user.username}'s avatar`}
        />
        <AvatarFallback className="text-xs bg-muted">
          {user.username?.charAt(0)?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="truncate max-w-[10rem]">{user.username}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="ml-0.5 h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
        onClick={onRemove}
        aria-label={`Remove ${user.username}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </Badge>
  );
}

const SelectedParticipants = ({
  isGroupChat,
  selectedUser,
  selectedParticipants,
  hasExistingChat,
  onRemoveParticipant,
}: SelectedParticipantsProps) => {
  if (!isGroupChat && selectedUser) {
    return (
      <div className="space-y-2">
        <Label>Selected User</Label>
        {/* Keep border for single user selection (input-like look) */}
        <div className="flex items-center gap-3 rounded-xl border bg-background px-3 py-2 dark:bg-muted/20">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={
                  selectedUser.avatar ||
                  "/placeholder.svg?height=56&width=56&query=user%20avatar"
                }
                alt={`${selectedUser.username}'s avatar`}
              />
              <AvatarFallback className="text-xs bg-muted">
                {selectedUser.username?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">
              {selectedUser.username}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {hasExistingChat && (
              // Small pill badge with icon, similar to your “Existing chat” chip
              <Badge
                variant="secondary"
                className="h-7 rounded-full px-2 text-xs gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                Existing chat
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemoveParticipant(selectedUser._id)}
              aria-label={`Remove ${selectedUser.username}`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isGroupChat && selectedParticipants.length > 0) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Selected Participants ({selectedParticipants.length})
        </Label>

        <div className="rounded-xl ">
          <ScrollArea className="max-h-32">
            <div className="flex flex-wrap gap-2 p-2">
              {selectedParticipants.map((participant) => (
                <UserToken
                  key={participant._id}
                  user={participant}
                  onRemove={() => onRemoveParticipant(participant._id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
        {/* <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
          {selectedParticipants.map((participant) => (
            <Badge
              key={participant._id}
              variant="secondary"
              className="flex items-center gap-2 pr-1"
            >
              <Avatar className="h-4 w-4">
                <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xs">
                  {participant.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{participant.username}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onRemoveParticipant(participant._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div> */}
      </div>
    );
  }

  return null;
};

export default SelectedParticipants;
