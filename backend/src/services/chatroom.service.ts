import { AppDataSource } from "../config/data-source";
import { ChatRoom } from "../entities/ChatRoom";
import { User } from "../entities/User";
import { Repository, In } from "typeorm";

export async function getUserChatRoomsService(userId: string) {
  try {
    console.log(`🔍 Loading chatrooms for user: ${userId}`);
      const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
    // 🔥 FIX: Erste Query um ChatRoom IDs zu finden wo User Mitglied ist
    const chatRoomIds = await chatRoomRepo
      .createQueryBuilder("chatroom")
      .select("chatroom.id")
      .leftJoin("chatroom.participants", "participant")
      .where("participant.id = :userId", { userId })
      .getMany();

    if (chatRoomIds.length === 0) {
      console.log('📭 No chatrooms found for user');
      return [];
    }

    // 🔥 FIX: Jetzt ALLE Participants für diese ChatRooms laden
    const chatRooms = await chatRoomRepo.find({
      where: {
        id: In(chatRoomIds.map(room => room.id))
      },
      relations: ['participants'], // ✅ Alle participants laden!
      order: {
        createdAt: 'DESC'
      }
    });

    console.log(`📊 Found ${chatRooms.length} chatrooms with full participants`);

    return chatRooms.map(room => {
      console.log(`🏠 Processing room: ${room.id}, type: ${room.type}`);
      console.log(`👥 Participants count: ${room.participants.length}`);
      
      const allParticipants = room.participants.map(user => {
        console.log(`  - User: ${user.username} (${user.id})`);
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatarUrl || null,
          isOnline: user.isOnline || false
        };
      });

      return {
        id: room.id,
        name: room.name,
        type: room.type,
        createdAt: room.createdAt.toISOString(),
        participants: allParticipants // ✅ ALLE participants, nicht gefiltert!
      };
    });
  } catch (error) {
    console.error('❌ Error in getUserChatRoomsService:', error);
    throw new Error('Fehler beim Laden der ChatRooms');
  }
}

export async function createGroupChatService(userId: string, name: string, participantIds: string[]) {
  const userRepo = AppDataSource.getRepository(User);
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
  
  const creator = await userRepo.findOneBy({ id: userId });
  const participants = await userRepo.findByIds(participantIds);
  
  if (!creator || participants.length < 1) {
    throw new Error("Teilnehmer nicht gefunden");
  }
  
  // 🔥 FIXED: Der Creator ist automatisch inclus
  const allParticipants = [creator, ...participants];
  
  const chatRoom = chatRoomRepo.create({ 
    name, 
    type: "group", 
    participants: allParticipants 
  });
  
  await chatRoomRepo.save(chatRoom);
  
  console.log(`✅ Neuer Gruppenchat erstellt: ${name} mit ${allParticipants.length} Teilnehmern`);
  
  // 🔥 FIXED: Konsistente Response-Struktur
  return {
    id: chatRoom.id,
    name: chatRoom.name,
    type: chatRoom.type,
    createdAt: chatRoom.createdAt,
    participants: allParticipants.map(p => ({
      id: p.id,
      username: p.username,
      email: p.email,
      avatarUrl: p.avatarUrl || null,
      isOnline: p.isOnline || false
    }))
  };
}

export async function deleteChatRoomService(userId: string, chatRoomId: string) {
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
  const chatRoom = await chatRoomRepo.findOneBy({ id: chatRoomId });
  if (!chatRoom) throw new Error("ChatRoom nicht gefunden");
  // Optional: Prüfe, ob userId berechtigt ist (z.B. Teilnehmer oder Creator)
  await chatRoomRepo.remove(chatRoom);
}

export async function startPrivateChatService(userId: string, otherUserId: string) {
  const userRepo = AppDataSource.getRepository(User);
  const thisUser = await userRepo.findOneBy({ id: userId });
  const otherUser = await userRepo.findOneBy({ id: otherUserId });
  
  if (!thisUser || !otherUser) {
    throw new Error("User nicht gefunden");
  }

  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
  
  // 🔥 FIXED: Vereinfachte Suche - lass TypeORM die Junction-Tabelle automatisch verwalten
  const existingChatRooms = await chatRoomRepo.find({
    where: { type: "private" },
    relations: ["participants"]
  });

  // Prüfe, ob bereits ein Chat zwischen diesen beiden Benutzern existiert
  let chatRoom = existingChatRooms.find(room => {
    const participantIds = room.participants.map(p => p.id);
    return participantIds.length === 2 && 
           participantIds.includes(userId) && 
           participantIds.includes(otherUserId);
  });

  if (!chatRoom) {
    chatRoom = new ChatRoom();
    chatRoom.name = `${thisUser.username} & ${otherUser.username}`;
    chatRoom.type = "private";
    chatRoom.participants = [thisUser, otherUser];
    await chatRoomRepo.save(chatRoom);
    
    console.log(`✅ Neuer privater Chat erstellt zwischen ${thisUser.username} und ${otherUser.username}`);
  } else {
    console.log(`📋 Bestehender privater Chat gefunden zwischen ${thisUser.username} und ${otherUser.username}`);
  }

  // 🔥 FIXED: Konsistente Response-Struktur wie getUserChatRoomsService
  return {
    id: chatRoom.id,
    name: chatRoom.name,
    type: chatRoom.type,
    createdAt: chatRoom.createdAt,
    participants: [
      {
        id: thisUser.id,
        username: thisUser.username,
        email: thisUser.email,
        avatarUrl: thisUser.avatarUrl || null,
        isOnline: thisUser.isOnline || false
      },
      {
        id: otherUser.id,
        username: otherUser.username,
        email: otherUser.email,
        avatarUrl: otherUser.avatarUrl || null,
        isOnline: otherUser.isOnline || false
      }
    ]
  };
}