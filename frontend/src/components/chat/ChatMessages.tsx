//frontend\src\components\chat
import type { Message, User } from "@/lib/types";

import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";

const ChatMessages = ({
  messages,
  user,
}: {
  messages: Message[];
  user: User;
}) => {
  return (
    <ScrollArea className="flex-1 p-4">
      {messages.map((msg) => (
        //ChatMessage
        <ChatMessage key={msg._id} user={user} message={msg} />
      ))}
    </ScrollArea>
  );
};

export default ChatMessages;
