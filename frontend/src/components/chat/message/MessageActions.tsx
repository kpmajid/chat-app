import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react";
import DeleteMessageDialog from "./DeleteMessageDialog";

interface MessageActionsProps {
  message: Message;
  isOutgoing: boolean;
  onDeleteMessage?: (id: string) => Promise<void> | void;
  onEditMessage?: () => void;
}

const MessageActions = ({
  message,
  isOutgoing,
  onDeleteMessage,
  onEditMessage,
}: MessageActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const canDelete = isOutgoing;
  const canEdit = isOutgoing;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDeleteMessage) {
      await onDeleteMessage(message._id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="absolute -top-2 -right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-1.5 rounded-full bg-background border shadow-sm",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                "hover:bg-muted focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              aria-label="Message actions"
            >
              <MoreVertical className="size-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleCopy} className="gap-2">
              <Copy className="size-3" />
              Copy message
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem onClick={onEditMessage} className="gap-2">
                <Edit className="size-3" />
                Edit message
              </DropdownMenuItem>
            )}
            {canDelete && (
              <DropdownMenuItem
                onClick={handleDeleteClick}
                className="gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="size-3" />
                Delete message
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {canDelete && (
        <DeleteMessageDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default MessageActions;
