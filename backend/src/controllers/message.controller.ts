import { Request, Response } from "express";
import { 
  createMessage, 
  getMessagesByRoom, 
  createFileMessage, 
  deleteMessage 
} from "../services/message.service";
import { handleControllerError } from "../utils/error-handler";
import { upload } from "../config/multer";

// Text-Nachricht erstellen
export const postMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const senderId = (req as any).user.id;
    const { chatRoomId, content } = req.body;

    const message = await createMessage({
      content,
      senderId,
      chatRoomId
    });

    res.status(201).json({
      success: true,
      message: "Nachricht erfolgreich erstellt",
      data: message
    });
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Erstellen der Nachricht");
  }
};

// Datei-Nachricht erstellen (mit Multer-Middleware)
export const postFileMessage = [
  upload.single("file"), 
  async (req: Request, res: Response): Promise<void> => {
    try {
      const senderId = (req as any).user.id;
      const { chatRoomId } = req.body;
      const file = req.file;

      if (!file) {
        res.status(400).json({ 
          success: false, 
          message: "Keine Datei hochgeladen" 
        });
        return;
      }

      const message = await createFileMessage({
        senderId,
        chatRoomId,
        file
      });

      // Optional: Socket-Event für Real-time Updates triggern
      // (Falls Socket.io Server-Instanz verfügbar ist)
      // Versuche, die io-Instanz zuerst aus req.app ('io') zu holen, fallback auf global
      const ioInstance = (req.app && typeof (req.app as any).get === "function")
        ? (req.app as any).get("io")
        : (global as any).io;

      if (ioInstance) {
        ioInstance.to(chatRoomId).emit("receiveMessage", message);
      }

      res.status(201).json({
        success: true,
        message: "Datei erfolgreich hochgeladen",
        data: message
      });
    } catch (error) {
      handleControllerError(error, res, "Fehler beim Hochladen der Datei");
    }
  }
];

// Nachrichten eines Chatrooms abrufen
export const getRoomMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const messages = await getMessagesByRoom(roomId, userId, limit);

    res.json({
      success: true,
      data: messages,
      count: messages.length,
      limit
    });
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Laden der Nachrichten");
  }
};

// Nachricht löschen
export const deleteMessageController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id: messageId } = req.params;

    await deleteMessage(userId, messageId);

    res.json({
      success: true,
      message: "Nachricht erfolgreich gelöscht"
    });
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Löschen der Nachricht");
  }
};

// Datei herunterladen/anzeigen
export const getFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    const path = require('path');
    const fs = require('fs');
    
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    // Prüfe ob Datei existiert
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        message: "Datei nicht gefunden"
      });
      return;
    }
    
    // Security: Verhindere Directory Traversal
    if (!filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
      res.status(403).json({
        success: false,
        message: "Zugriff verweigert"
      });
      return;
    }
    
    // Datei senden
    res.sendFile(filePath);
  } catch (error) {
    handleControllerError(error, res, "Fehler beim Laden der Datei");
  }
};

