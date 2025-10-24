import { Router } from "express";
import { 
  postMessage, 
  getRoomMessages, 
  deleteMessageController, 
  postFileMessage,
  getFile 
} from "../controllers/message.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Nachrichten eines Raums abrufen
router.get("/room/:roomId", authMiddleware, getRoomMessages);

// Neue Text-Nachricht erstellen
router.post("/", authMiddleware, postMessage);

// Neue Datei-Nachricht erstellen
router.post("/file", authMiddleware, ...postFileMessage);

// Nachricht löschen
router.delete("/:id", authMiddleware, deleteMessageController);

// Datei herunterladen (öffentlich für Chat-Teilnehmer)
router.get("/files/:filename", getFile);

export default router;
