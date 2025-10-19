import { AppDataSource } from "../config/data-source";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { ChatRoom } from "../entities/ChatRoom";

export const createMessage = async (content: string, senderId: string, roomId: string) => {
  const messageRepo = AppDataSource.getRepository(Message);
  const userRepo = AppDataSource.getRepository(User);
  const roomRepo = AppDataSource.getRepository(ChatRoom);

  const sender = await userRepo.findOneByOrFail({ id: senderId });
  const room = await roomRepo.findOneByOrFail({ id: roomId });

  const message = messageRepo.create({ content, sender, room });
  await messageRepo.save(message);
  return message;
};

export const getMessagesByRoom = async (roomId: string, limit = 50) => {
  const messageRepo = AppDataSource.getRepository(Message);
  return messageRepo.find({
    where: { room: { id: roomId } },
    order: { createdAt: "ASC" },
    take: limit,
    relations: ["sender", "room"],
  });
};

export const createFileMessage = async (senderId: string, roomId: string, file: Express.Multer.File) => {
  const messageRepo = AppDataSource.getRepository(Message);
  const userRepo = AppDataSource.getRepository(User);
  const roomRepo = AppDataSource.getRepository(ChatRoom);

  const sender = await userRepo.findOneByOrFail({ id: senderId });
  const room = await roomRepo.findOneByOrFail({ id: roomId });

  const fileUrl = `/uploads/${file.filename}`;
  const fileType = file.mimetype;
  const message = messageRepo.create({ content: file.originalname, sender, room, fileUrl, fileType });
  await messageRepo.save(message);
  return message;
};


export const deleteMessageService = async (userId: string, messageId: string) => {
  const messageRepo = AppDataSource.getRepository(Message);
  const message = await messageRepo.findOne({ where: { id: messageId }, relations: ["sender"] });
  if (!message) throw new Error("Nachricht nicht gefunden");
  if (message.sender.id !== userId) throw new Error("Nur der Absender kann die Nachricht löschen");
  await messageRepo.remove(message);
};