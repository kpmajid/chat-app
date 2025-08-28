import { useEffect } from "react";
import type { Conversation, User } from "@/lib/types";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Users, Calendar, Settings } from "lucide-react";
import { AvatarImage } from "@radix-ui/react-avatar";

interface ChatDetailsPanelProps {
  user: User;
  chat: Conversation | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChatDetailsPanel = ({
  user,
  chat,
  isOpen,
  onClose,
}: ChatDetailsPanelProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!chat) return null;

  const isGroup = chat.type === "group";
  const chatPartner = !isGroup
    ? chat.participants.find((p) => p._id !== user._id)
    : null;
  const displayName = isGroup
    ? chat.group?.name
    : chatPartner?.username || "Chat";
  const displayAvatar = isGroup ? chat.group?.avatar : chatPartner?.avatar;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Details Panel */}
      <div
        data-chat-details-panel
        className={`
          lg:relative lg:flex lg:flex-shrink-0
          ${isOpen ? "lg:w-80" : "lg:w-0"}
          fixed lg:static right-0 top-0 h-full max-h-screen w-80 z-50 
          ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"} 
          bg-card border-l border-border 
          transition-all duration-300 ease-in-out 
          overflow-hidden`}
      >
        <div className="w-80 flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="text-lg font-semibold text-card-foreground">
              Chat Details
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 space-y-6">
              {/* Chat Info */}
              <div className="text-center space-y-4">
                <Avatar className="h-20 w-20 mx-auto">
                  <AvatarImage src={displayAvatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {displayName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">
                    {displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isGroup ? "Group Chat" : "Direct Message"}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Created Date */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {formatDate(chat.createdAt)}
                </p>
              </div>

              {/* Group Members */}
              {isGroup && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      <Users className="h-4 w-4" />
                      Members ({chat.participants.length})
                    </div>
                    <div className="space-y-2">
                      {chat.participants.map((participant) => (
                        <div
                          key={participant._id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                {participant.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            {participant.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-card rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-card-foreground">
                              {participant.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.online ? "Online" : "Offline"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Quick Actions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                  <Settings className="h-4 w-4" />
                  Quick Actions
                </div>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    View Media
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Shared Files
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Pinned Messages
                  </Button>
                  {isGroup && (
                    <Button variant="ghost" className="w-full justify-start">
                      Group Settings
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
};

export default ChatDetailsPanel;
