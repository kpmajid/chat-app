//frontend\src\components\sidebar
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { selectAuth } from "@/features/auth/authSlice";
import {
  selectConversationsLoading,
  selectChatError,
} from "@/features/chat/chatSlice";
import { fetchConversations } from "@/features/chat/chatThunks";
import { useAppDispatch } from "@/hooks/redux";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import SidebarBrand from "./SidebarBrand";
import UserSearchForm from "./UserSearchForm";
import SidebarChatList from "./SidebarChatList";
import SidebarUserFooter from "./SidebarUserFooter";

const AppSidebar = ({ ...props }) => {
  const { user } = useSelector(selectAuth);
  const loading = useSelector(selectConversationsLoading);
  const error = useSelector(selectChatError);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchConversations());
    }
  }, [user?._id, dispatch]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-col gap-2">
          {/* Brand Section with Add Chat Button */}
          <SidebarBrand />

          {/* Search Section */}
          <UserSearchForm /* onSearch={handleSearch} */ />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading conversations...
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500">
            Error: {error}
          </div>
        ) : (
          <SidebarChatList />
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUserFooter />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
