//frontend\src\components\sidebar\dialogs
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ChatTypeToggle from "./ChatTypeToggle";
import GroupNameInput from "./GroupNameInput";
import UserSelector from "./UserSelector";
import SelectedParticipants from "./SelectedParticipants";
import ExistingChatWarning from "./ExistingChatWarning";
import { useCreateChat } from "@/hooks/useCreateChat";

interface CreateChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateChatDialog = ({ isOpen, onClose }: CreateChatDialogProps) => {
  const {
    formData,
    users,
    loading,
    creating,
    updateFormData,
    addParticipant,
    removeParticipant,
    createChat,
    validateForm,
    findExistingConversation,
    selectChat,
  } = useCreateChat(isOpen);

  const selectedUser = users.find((u) => u._id === formData.selectedUserId);
  const selectedParticipants = users.filter((user) =>
    formData.groupParticipants.includes(user._id)
  );
  const existingConversation =
    !formData.isGroupChat && formData.selectedUserId
      ? findExistingConversation(formData.selectedUserId)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // If there's an existing conversation for individual chat, open it
    if (!formData.isGroupChat && existingConversation) {
      selectChat(existingConversation);
      onClose();
      return;
    }

    const result = await createChat();
    if (result.success) {
      onClose();
    } else {
      alert("Failed to create chat");
    }
  };

  const handleOpenExistingChat = () => {
    if (existingConversation) {
      selectChat(existingConversation);
      onClose();
    }
  };

  const isFormValid = () => {
    if (formData.isGroupChat) {
      return formData.groupName.trim() && formData.groupParticipants.length > 0;
    }
    return formData.selectedUserId;
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Start New Chat</DialogTitle>
        <DialogDescription>
          Create a new conversation with one person or start a group chat.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ChatTypeToggle
          isGroupChat={formData.isGroupChat}
          onToggle={(isGroup) =>
            updateFormData({
              isGroupChat: isGroup,
              // Reset form when switching types
              selectedUserId: "",
              groupParticipants: [],
              groupName: "",
            })
          }
        />

        {formData.isGroupChat && (
          <GroupNameInput
            value={formData.groupName}
            onChange={(value) => updateFormData({ groupName: value })}
          />
        )}

        <UserSelector
          users={users}
          loading={loading}
          isGroupChat={formData.isGroupChat}
          selectedUserId={formData.selectedUserId}
          groupParticipants={formData.groupParticipants}
          findExistingConversation={(userId) =>
            !!findExistingConversation(userId)
          }
          onUserSelect={addParticipant}
        />

        {/* Existing Chat Warning */}
        {!formData.isGroupChat && selectedUser && existingConversation && (
          <ExistingChatWarning
            selectedUser={selectedUser}
            onOpenExisting={handleOpenExistingChat}
          />
        )}

        {/* Selected Participants Display */}
        <SelectedParticipants
          isGroupChat={formData.isGroupChat}
          selectedUser={selectedUser}
          selectedParticipants={selectedParticipants}
          hasExistingChat={!!existingConversation}
          onRemoveParticipant={removeParticipant}
        />

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={creating}
          >
            Cancel
          </Button>

          {!formData.isGroupChat && existingConversation ? (
            <Button
              type="button"
              onClick={handleOpenExistingChat}
              disabled={creating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Open Existing Chat
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={creating || loading || !isFormValid()}
            >
              {creating
                ? "Creating..."
                : formData.isGroupChat
                ? "Create Group"
                : "Create Chat"}
            </Button>
          )}
        </div>
      </form>
    </DialogContent>
  );
};

export default CreateChatDialog;
