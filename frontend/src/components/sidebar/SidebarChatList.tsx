//frontend\src\components\sidebar

import { SidebarMenu } from "@/components/ui/sidebar";
import SidebarChatItem from "./SidebarChatItem";
import { useSelector } from "react-redux";
import { selectConversations } from "@/features/chat/chatSlice";

const SidebarChatList = () => {
  const conversations = useSelector(selectConversations);

  if (!conversations.length) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No chats yet
      </div>
    );
  }

  return (
    <SidebarMenu>
      {conversations.map((conversation) => (
        <SidebarChatItem key={conversation._id} conversation={conversation} />
      ))}
    </SidebarMenu>
  );
};

export default SidebarChatList;
