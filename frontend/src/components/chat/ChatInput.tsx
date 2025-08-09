//frontend\src\components\chat
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ChatInput = ({
  message,
  setMessage,
}: // onSubmit,
{
  message: string;
  setMessage: (msg: string) => void;
  // onSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <form
      //  onSubmit={onSubmit}
      className="flex items-center gap-2 p-4 border-t"
    >
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1"
      />
      <Button type="submit" disabled={!message.trim()}>
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
