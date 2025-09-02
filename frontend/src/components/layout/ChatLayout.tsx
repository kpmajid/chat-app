//frontend\src\components\layout
import AppSidebar from "../sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMessageListeners } from "@/hooks/useMessageListeners";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useRealTimeConversations } from "@/hooks/useRealTimeConversations";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({ children }: ChatLayoutProps) => {
  useOnlineStatus();
  useRealTimeConversations();
  useMessageListeners()

  return (
    <SidebarProvider>
      <div className="flex flex-grow h-screen overflow-hidden">
        <AppSidebar />
        <SidebarInset className="h-full">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ChatLayout;
