//frontend\src\components\chat
import { useEffect, useMemo, useRef, useState } from "react";

import type { Message, User } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";

const ChatMessages = ({
  messages,
  user,
  isGroup,
}: {
  messages: Message[];
  user: User;
  isGroup: boolean;
  typingUsers?: User[];
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = messages?.length > 0;
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Keep a threshold so light scrolling doesn't block autoscroll
  const nearBottomThreshold = 96; // px

  // Auto-scroll to bottom when new messages arrive if user is near bottom
  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages?.length, isNearBottom]);

  // Track scroll position to detect whether user is near the bottom
  useEffect(() => {
    // We need to get the actual scrollable viewport from ScrollArea
    const scrollViewport = containerRef.current?.parentElement;
    if (!scrollViewport) return;

    const handleScroll = () => {
      const distanceFromBottom =
        scrollViewport.scrollHeight -
        scrollViewport.scrollTop -
        scrollViewport.clientHeight;
      setIsNearBottom(distanceFromBottom <= nearBottomThreshold);
    };

    // Initialize position on mount
    handleScroll();

    scrollViewport.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollViewport.removeEventListener("scroll", handleScroll);
  }, []);

  // For screen readers: concatenate latest content
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
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg._id}
                user={user}
                message={msg}
                isGroup={isGroup}
              />
            ))}
          </div>

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;
