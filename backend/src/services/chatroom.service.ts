import { AppDataSource } from "../config/data-source";
import { ChatRoom } from "../entities/ChatRoom";
import { User } from "../entities/User";

export async function getUserChatRoomsService(userId: string) {
  const chatRooms = await AppDataSource.getRepository(ChatRoom)
    .createQueryBuilder("chatroom")
    .leftJoinAndSelect("chatroom.participants", "user")
    .where("user.id = :userId", { userId })
    .getMany();

  // Améliorer les noms d'affichage pour les chats privés
  return chatRooms.map(room => {
    if (room.name.startsWith('private-')) {
      // Pour les chats privés, trouver l'autre participant
      const otherParticipant = room.participants.find(p => p.id !== userId);
      return {
        ...room,
        displayName: otherParticipant?.username || 'Chat privé',
        isPrivate: true
      };
    }
    return {
      ...room,
      displayName: room.name,
      isPrivate: false
    };
  });
}

export async function createGroupChatService(userId: string, name: string, participantIds: string[]) {
  const userRepo = AppDataSource.getRepository(User);
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
  const creator = await userRepo.findOneBy({ id: userId });
  const participants = await userRepo.findByIds(participantIds);
  if (!creator || participants.length < 1) throw new Error("Teilnehmer nicht gefunden");
  
  // Le créateur est automatiquement inclus
  const allParticipants = [creator, ...participants];
  const chatRoom = chatRoomRepo.create({ 
    name, 
    type: "group", 
    creator: [creator], 
    participants: allParticipants 
  });
  await chatRoomRepo.save(chatRoom);
  return chatRoom;
}

export async function deleteChatRoomService(userId: string, chatRoomId: string) {
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
  const chatRoom = await chatRoomRepo.findOneBy({ id: chatRoomId });
  if (!chatRoom) throw new Error("ChatRoom nicht gefunden");
  // Optional: Prüfe, ob userId berechtigt ist (z.B. Teilnehmer oder Creator)
  await chatRoomRepo.remove(chatRoom);
}

