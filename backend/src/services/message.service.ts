import { AppDataSource } from "../config/data-source";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { ChatRoom } from "../entities/ChatRoom";
import { validateMessageContent, validateFile, validateChatRoomId } from "../validators/message.validator";
import { MulterFile } from "../types/multer";

export interface MessageResponse {
  id: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

export interface CreateMessageInput {
  content: string;
  senderId: string;
  chatRoomId: string;
}

export interface CreateFileMessageInput {
  senderId: string;
  chatRoomId: string;
  file: MulterFile;
}

// Prüfen ob User Mitglied des ChatRooms ist
async function validateUserMembership(userId: string, chatRoomId: string): Promise<void> {
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);
  
  const chatRoom = await chatRoomRepo.findOne({
    where: { id: chatRoomId },
    relations: ["participants"]
  });

  if (!chatRoom) {
    throw new Error("ChatRoom nicht gefunden");
  }

  const isParticipant = chatRoom.participants.some(participant => participant.id === userId);
  if (!isParticipant) {
    throw new Error("Zugriff verweigert: Sie sind kein Mitglied dieses ChatRooms");
  }
}



export async function createMessage(input: CreateMessageInput): Promise<MessageResponse> {
  const { content, senderId, chatRoomId } = input;
  
  // Validierungen
  const contentError = validateMessageContent(content);
  if (contentError) {
    throw new Error(contentError);
  }
  
  const chatRoomIdError = validateChatRoomId(chatRoomId);
  if (chatRoomIdError) {
    throw new Error(chatRoomIdError);
  }
  
  await validateUserMembership(senderId, chatRoomId);

  const messageRepo = AppDataSource.getRepository(Message);
  const userRepo = AppDataSource.getRepository(User);
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);

  const sender = await userRepo.findOneBy({ id: senderId });
  const chatRoom = await chatRoomRepo.findOneBy({ id: chatRoomId });

  if (!sender) {
    throw new Error("Benutzer nicht gefunden");
  }
  if (!chatRoom) {
    throw new Error("ChatRoom nicht gefunden");
  }

  const message = messageRepo.create({ 
    content: content.trim(), 
    sender, 
    chatRoom 
  });
  
  const savedMessage = await messageRepo.save(message);

  return {
    id: savedMessage.id,
    content: savedMessage.content,
    createdAt: savedMessage.createdAt,
    sender: {
      id: sender.id,
      username: sender.username,
      avatarUrl: sender.avatarUrl || null
    }
  };
}

export async function getMessagesByRoom(chatRoomId: string, userId: string, limit = 50): Promise<MessageResponse[]> {
  // Validierungen
  await validateUserMembership(userId, chatRoomId);

  if (limit > 100) {
    limit = 100; // Maximal 100 Nachrichten
  }

  const messageRepo = AppDataSource.getRepository(Message);

  const messages = await messageRepo
    .createQueryBuilder("message")
    .leftJoinAndSelect("message.sender", "sender")
    .where("message.chatRoomId = :chatRoomId", { chatRoomId })
    .orderBy("message.createdAt", "ASC")
    .limit(limit)
    .getMany();

  return messages.map(message => ({
    id: message.id,
    content: message.content,
    fileUrl: message.fileUrl,
    fileType: message.fileType,
    createdAt: message.createdAt,
    sender: {
      id: message.sender.id,
      username: message.sender.username,
      avatarUrl: message.sender.avatarUrl || null
    }
  }));
}

export async function createFileMessage(input: CreateFileMessageInput): Promise<MessageResponse> {
  const { senderId, chatRoomId, file } = input;
  
  // Validierungen
  const fileError = validateFile(file);
  if (fileError) {
    throw new Error(fileError);
  }
  
  const chatRoomIdError = validateChatRoomId(chatRoomId);
  if (chatRoomIdError) {
    throw new Error(chatRoomIdError);
  }
  
  await validateUserMembership(senderId, chatRoomId);

  const messageRepo = AppDataSource.getRepository(Message);
  const userRepo = AppDataSource.getRepository(User);
  const chatRoomRepo = AppDataSource.getRepository(ChatRoom);

  const sender = await userRepo.findOneBy({ id: senderId });
  const chatRoom = await chatRoomRepo.findOneBy({ id: chatRoomId });

  if (!sender) {
    throw new Error("Benutzer nicht gefunden");
  }
  if (!chatRoom) {
    throw new Error("ChatRoom nicht gefunden");
  }

  const fileUrl = `/uploads/${file.filename}`;
  const message = messageRepo.create({ 
    content: file.originalname, 
    sender, 
    chatRoom, 
    fileUrl, 
    fileType: file.mimetype 
  });
  
  const savedMessage = await messageRepo.save(message);

  return {
    id: savedMessage.id,
    content: savedMessage.content,
    fileUrl: savedMessage.fileUrl,
    fileType: savedMessage.fileType,
    createdAt: savedMessage.createdAt,
    sender: {
      id: sender.id,
      username: sender.username,
      avatarUrl: sender.avatarUrl || null
    }
  };
}

export async function deleteMessage(userId: string, messageId: string): Promise<void> {
  const messageRepo = AppDataSource.getRepository(Message);
  
  const message = await messageRepo.findOne({ 
    where: { id: messageId }, 
    relations: ["sender"] 
  });
  
  if (!message) {
    throw new Error("Nachricht nicht gefunden");
  }
  
  if (message.sender.id !== userId) {
    throw new Error("Nur der Absender kann die Nachricht löschen");
  }
  
  await messageRepo.remove(message);
}