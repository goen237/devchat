import { deleteMessageService } from "../services/message.service";
import { Request, Response } from "express";
import { createMessage, getMessagesByRoom, createFileMessage } from "../services/message.service";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
export const postFileMessage = [upload.single("file"), async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const roomId = req.params.id || req.body.roomId;
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Keine Datei" });
    const message = await createFileMessage(senderId, roomId, file);
    res.status(201).json(message);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}];

export const postMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).user.id;
    const roomId = req.params.id || req.body.roomId;
    const content = req.body.content;
    const message = await createMessage(content, senderId, roomId);
    res.status(201).json(message);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getRoomMessages = async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  try {
    const messages = await getMessagesByRoom(roomId, limit);
    res.json(messages);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const messageId = req.params.id;
    await deleteMessageService(userId, messageId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

