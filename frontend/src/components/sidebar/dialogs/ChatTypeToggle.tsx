import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ChatTypeToggleProps {
  isGroupChat: boolean;
  onToggle: (isGroup: boolean) => void;
}

const ChatTypeToggle = ({ isGroupChat, onToggle }: ChatTypeToggleProps) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="group-chat"
        checked={isGroupChat}
        onCheckedChange={onToggle}
      />
      <Label htmlFor="group-chat" className="text-sm font-medium">
        Group Chat
      </Label>
    </div>
  );
};

export default ChatTypeToggle;
