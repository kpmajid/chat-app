//frontend\src\components\layout
import AppSidebar from "../sidebar/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
}

const ChatLayout = ({
  children,
}: ChatLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex flex-grow h-screen ">
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
};



export default ChatLayout;
