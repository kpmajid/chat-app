//frontend\src\components\chat
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false }: ChatInputProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<string>("");

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const message = messageRef.current.trim();
      if (!message || disabled) return;

      onSendMessage(message);

      // Clear the textarea
      if (textareaRef.current) {
        textareaRef.current.value = "";
        textareaRef.current.style.height = "auto";
        messageRef.current = "";
      }
    },
    [onSendMessage, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      messageRef.current = e.target.value;

      // Auto-grow textarea
      const el = e.target;
      el.style.height = "auto";

      const lineHeight = Number.parseFloat(
        getComputedStyle(el).lineHeight || "24"
      );
      const maxHeight = 6 * lineHeight;
      el.style.height = Math.min(el.scrollHeight, maxHeight) + "px";
    },
    []
  );

  // Handle key down for Enter submission
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    },
    []
  );

  // Focus management
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex items-end gap-3 p-2"
        aria-label="Chat input"
      >
        <label htmlFor="chat-message" className="sr-only">
          Type a message
        </label>

        <div className="flex-1 relative">
          <Textarea
            id="chat-message"
            ref={textareaRef}
            onChange={handleChange}
            placeholder="Type a message..."
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none rounded-2xl",
              "border-border bg-card shadow-sm",
              "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              "transition-all duration-200",
              "pr-12", // Space for send button
              "break-all whitespace-pre-wrap overflow-wrap-anywhere",
              "scrollbar-width: thin"
            )}
            rows={1}
            onKeyDown={handleKeyDown}
            aria-multiline="true"
          />

          {/* Send button inside the input */}
          <Button
            type="submit"
            disabled={disabled}
            aria-label="Send message"
            size="sm"
            className={cn(
              "absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full",
              "bg-blue-600 hover:bg-blue-700 disabled:bg-muted",
              "shadow-sm transition-all duration-200"
            )}
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
