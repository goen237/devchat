import { Router } from "express";
import { postMessage, getRoomMessages, deleteMessage } from "../controllers/message.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Nachrichten eines Raums abrufen
router.get("/room/:roomId", authMiddleware, getRoomMessages);

// Neue Nachricht erstellen
router.post("/", authMiddleware, postMessage);

// Nachricht löschen
router.delete("/:id", authMiddleware, deleteMessage);

export default router;
