//frontend\src\components\sidebar
import { useState } from "react";

import { Command, MessageSquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import CreateChatDialog from "./dialogs/CreateChatDialog";

const SidebarBrand = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex items-center justify-between py-2 border-b border-sidebar-border">
      {/* Brand Section */}
      <div className="flex items-center gap-2">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Command className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <h2 className=" font-semibold">Chat-App</h2>

          <p className="text-xs text-muted-foreground">Messaging</p>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="Start new chat"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <CreateChatDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

export default SidebarBrand;
