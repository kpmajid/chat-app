import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TypingIndicator = ({
  users,
  align = "left",
}: {
  users: User[];
  align?: "left" | "right";
}) => {
  if (!users?.length) return null;
  
  const names = users.map((u) => u.username).join(", ");
  const isMultiple = users.length > 1;
  
  return (
    <div
      className={`flex items-end gap-3 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
      aria-live="polite"
      aria-label={`${names} ${isMultiple ? "are" : "is"} typing`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Avatar className="size-8">
          <AvatarImage
            src={users[0].avatar || "/placeholder.svg"}
            alt={`${users[0].username} avatar`}
          />
          <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {users[0].username?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
      
      {/* Typing bubble */}
      <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm max-w-[200px]">
        <span className="sr-only">{names} typing</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">
            {isMultiple ? `${users.length} people typing` : `${users[0].username} is typing`}
          </span>
          <div className="flex items-center gap-0.5">
            <span
              className="inline-block size-1 rounded-full bg-muted-foreground/70 animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <span
              className="inline-block size-1 rounded-full bg-muted-foreground/70 animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="inline-block size-1 rounded-full bg-muted-foreground/70 animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
