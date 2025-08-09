//frontend\src\components\sidebar
import type { Conversation } from "@/lib/types";

import UserChatItem from "./chat-items/UserChatItem";
import GroupChatItem from "./chat-items/GroupChatItem";

interface SidebarChatItemProps {
  conversation: Conversation;
}

const SidebarChatItem = ({ conversation }: SidebarChatItemProps) => {
  if (conversation.type === "user") {
    return <UserChatItem conversation={conversation} />;
  }

  if (conversation.type === "group") {
    return <GroupChatItem conversation={conversation} />;
  }

  return null;
};

export default SidebarChatItem;
