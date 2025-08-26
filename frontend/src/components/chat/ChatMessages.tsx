//frontend\src\components\chat
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import type { Message, User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";

import { formatDateDivider } from "@/lib/formatDateDivider";
import { Badge } from "../ui/badge";

interface ChatMessagesProps {
  messages: Message[];
  user: User;
  isGroup: boolean;
  typingUsers?: User[];
  onDeleteMessage?: (id: string) => Promise<void> | void;
  onEditMessage?: (id: string, newContent: string) => Promise<void> | void;
}

const ChatMessages = ({
  messages,
  user,
  isGroup,
  onDeleteMessage,
  onEditMessage,
}: ChatMessagesProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages?.length > 0;
  const [isNearBottom, setIsNearBottom] = useState(true);
  const nearBottomThreshold = 96;

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages?.length, isNearBottom]);

  useEffect(() => {
    const scrollViewport = containerRef.current?.parentElement;
    if (!scrollViewport) return;

    const handleScroll = () => {
      const distanceFromBottom =
        scrollViewport.scrollHeight -
        scrollViewport.scrollTop -
        scrollViewport.clientHeight;
      setIsNearBottom(distanceFromBottom <= nearBottomThreshold);
    };

    handleScroll();

    scrollViewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollViewport.removeEventListener("scroll", handleScroll);
  }, []);

  const liveRegionText = useMemo(() => {
    if (!hasMessages) return "No messages yet";
    const last = messages[messages.length - 1];
    return `${last.sender.username} says ${last.content}`;
  }, [messages, hasMessages]);

  if (!hasMessages) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full">
        <div
          className="px-4 py-4 space-y-4"
          ref={containerRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Chat messages"
        >
          <div className="sr-only">{liveRegionText}</div>

          <div ref={topSentinelRef} aria-hidden="true" />

          {/* Messages list */}
          <div className="space-y-2">
            {messages.map((msg, index) => {
              const currentDate = new Date(msg.createdAt!).toDateString();
              const previousDate =
                index > 0
                  ? new Date(messages[index - 1].createdAt!).toDateString()
                  : null;

              const showDateDivider = currentDate !== previousDate;

              return (
                <Fragment key={msg._id}>
                  {showDateDivider && (
                    <div className="flex items-center justify-center py-4 px-4">
                      <Badge variant="outline">
                        {formatDateDivider(new Date(msg.createdAt!))}
                      </Badge>
                    </div>
                  )}
                  <ChatMessage
                    user={user}
                    message={msg}
                    isGroup={isGroup}
                    onDeleteMessage={onDeleteMessage}
                    onEditMessage={onEditMessage}
                  />
                </Fragment>
              );
            })}
          </div>

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
