//frontend\src\components\sidebar
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from "@/components/ui/sidebar";

const UserSearchForm = ({ ...props }: React.ComponentProps<"form">) => {
  return (
    <form {...props}>
      <SidebarGroup className="p-0">
        <SidebarGroupContent className="relative">
          <Label htmlFor="search" className="sr-only">
            Search conversations
          </Label>
          <SidebarInput
            id="search"
            type="search"
            placeholder="search"
            className="h-9 pl-9 pr-4 bg-sidebar-accent/95 border-0 focus-visible:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-sidebar-ring transition-colors"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
};

export default UserSearchForm;
