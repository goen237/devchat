import { Request, Response } from "express";
import { 
  getUserChatRoomsService, 
  createGroupChatService, 
  deleteChatRoomService,
  startPrivateChatService 
} from "../services/chatroom.service";
import { validateGroupChatInput, validatePrivateChatInput } from "../validators/chatroom.validator";
import { handleControllerError } from "../utils/error-handler";

export async function getUserChatRooms(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const chatRooms = await getUserChatRoomsService(userId);
    res.json(chatRooms);
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Laden der Chatrooms");
  }
}

export async function startPrivateChat(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const { userId: otherUserId } = req.body;

    // Validation
    const validationError = validatePrivateChatInput({ userId: otherUserId });
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const chatRoom = await startPrivateChatService(userId, otherUserId);
    res.json(chatRoom);
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Starten des privaten Chats");
  }
}

export async function createGroupChat(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const { name, participantIds } = req.body;

    // Validation
    const validationError = validateGroupChatInput({ name, participantIds });
    if (validationError) {
      res.status(400).json({ message: validationError });
      return;
    }

    const chatRoom = await createGroupChatService(userId, name, participantIds);
    res.json(chatRoom);
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Erstellen des Gruppenchats");
  }
}

export async function deleteChatRoom(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const chatRoomId = req.params.id;

    if (!chatRoomId) {
      res.status(400).json({ message: "ChatRoom ID erforderlich" });
      return;
    }

    await deleteChatRoomService(userId, chatRoomId);
    res.json({ success: true });
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Löschen des Chatrooms");
  }
}