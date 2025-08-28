import { Conversation } from "../models/Conversation";
import { io } from "../server";

export const notifyContactsAboutStatusChange = async (
  userId: string, 
  username: string, 
  isOnline: boolean
) => {
  try {
    const conversations = await Conversation.find({
      participants: userId,
    }).populate("participants", "_id");

    const contactIds = new Set<string>();
    conversations.forEach((conv) => {
      conv.participants.forEach((participant: any) => {
        if (participant._id.toString() !== userId) {
          contactIds.add(participant._id.toString());
        }
      });
    });

    const eventName = isOnline ? "userOnline" : "userOffline";
    contactIds.forEach((contactId) => {
      io.to(`user_${contactId}`).emit(eventName, {
        userId,
        username,
        online: isOnline,
      });
    });

    console.log(
      `Notified ${contactIds.size} contacts about ${username} going ${isOnline ? 'online' : 'offline'}`
    );
  } catch (error) {
    console.error("Error notifying contacts about status change:", error);
  }
};