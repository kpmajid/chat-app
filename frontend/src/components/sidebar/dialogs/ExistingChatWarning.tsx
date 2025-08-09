import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type {  User } from "@/lib/types";

interface ExistingChatWarningProps {
  selectedUser: User;
  onOpenExisting: () => void;
}

const ExistingChatWarning = ({
  selectedUser,
  onOpenExisting,
}: ExistingChatWarningProps) => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex flex-wrap items-center gap-1">
        <span>You already have a conversation with</span>
        <strong>{selectedUser.username}</strong>.
        <Button
          type="button"
          variant="link"
          className="p-0 h-auto text-blue-600 hover:text-blue-800"
          onClick={onOpenExisting}
        >
          Open existing chat
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default ExistingChatWarning;
