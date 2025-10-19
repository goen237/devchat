import { Request, Response } from "express";
import { getUserChatRoomsService, createGroupChatService, deleteChatRoomService } from "../services/chatroom.service";
import { AppDataSource } from "../config/data-source";
import { ChatRoom } from "../entities/ChatRoom";
import { User } from "../entities/User";

export async function getUserChatRooms(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const chatRooms = await getUserChatRoomsService(userId);
    res.json(chatRooms);
  } catch (err) {
    console.error("Fehler beim Laden der Chatrooms:", err);
    res.status(500).json({ message: "Fehler beim Laden der Chatrooms" });
  }
}

export async function startPrivateChat(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const otherUserId = req.body.userId;
    if (!otherUserId) return res.status(400).json({ message: "userId fehlt" });

    // Prüfe, ob ein privater ChatRoom existiert
    const userRepo = AppDataSource.getRepository(User);
    const thisUser = await userRepo.findOneBy({ id: userId });
    const otherUser = await userRepo.findOneBy({ id: otherUserId });
    if (!thisUser || !otherUser) return res.status(404).json({ message: "User nicht gefunden" });

    const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
    
    // Suche nach existierendem privatem Chat mit beiden Benutzern
    let chatRoom = await chatRoomRepo
      .createQueryBuilder("chatroom")
      .leftJoinAndSelect("chatroom.participants", "user")
      .where("chatroom.type = :type", { type: "private" })
      .andWhere(qb => {
        const subQuery = qb.subQuery()
          .select("COUNT(DISTINCT participant.id)")
          .from("chatroom_participants_user", "rel")
          .leftJoin("user", "participant", "participant.id = rel.userId")
          .where("rel.chatroomId = chatroom.id")
          .andWhere("participant.id IN (:...userIds)", { userIds: [userId, otherUserId] })
          .getQuery();
        return `(${subQuery}) = 2`;
      })
      .getOne();

    if (!chatRoom) {
      chatRoom = new ChatRoom();
      chatRoom.name = `private-${thisUser.id}-${otherUser.id}`;
      chatRoom.type = "private";
      chatRoom.participants = [thisUser, otherUser];
      await chatRoomRepo.save(chatRoom);
    }

    // Retourner avec le nom d'affichage approprié
    const response = {
      ...chatRoom,
      displayName: otherUser.username
    };

    res.json(response);
  } catch (err) {
    console.error("Fehler beim Starten des privaten Chats:", err);
    res.status(500).json({ message: "Fehler beim Starten des privaten Chats" });
  }
}
export async function createGroupChat(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const { name, participantIds } = req.body;
  if (!name || !participantIds || participantIds.length < 2) {
    return res.status(400).json({ message: "Name und mindestens zwei Teilnehmer erforderlich" });
  }
  try {
    const chatRoom = await createGroupChatService(userId, name, participantIds);
    res.json(chatRoom);
  } catch (err) {
    console.error("Fehler beim Erstellen des Gruppenchats:", err);
    res.status(500).json({ message: "Fehler beim Erstellen des Gruppenchats" });
  }
}

export async function deleteChatRoom(req: Request, res: Response) {
  const userId = (req as any).user.id;
  const chatRoomId = req.params.id;
  try {
    await deleteChatRoomService(userId, chatRoomId);
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler beim Löschen des Chatrooms:", err);
    res.status(500).json({ message: "Fehler beim Löschen des Chatrooms" });
  }
}