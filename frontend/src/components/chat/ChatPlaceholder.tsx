//frontend\src\components\chat
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ChatPlaceholder = () => {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">No chat selected</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation by selecting a chat from the sidebar!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPlaceholder;
