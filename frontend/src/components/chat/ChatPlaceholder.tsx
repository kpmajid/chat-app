//frontend\src\components\chat
import { MessageCircle } from "lucide-react";

const ChatPlaceholder = () => {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Welcome to Chat</h3>
          <p className="text-muted-foreground">
            Select a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatPlaceholder;
