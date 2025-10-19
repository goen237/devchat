import { Router } from "express";
import { getUserChatRooms, startPrivateChat, createGroupChat } from "../controllers/chatroom.controller";
import { getRoomMessages, postMessage, postFileMessage } from "../controllers/message.controller";
import multer from "multer";
const upload = multer({ dest: "uploads/" });
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();


router.get("/", authMiddleware, getUserChatRooms);
router.post("/private", authMiddleware, startPrivateChat);
router.post("/group", authMiddleware, createGroupChat);

// Nachrichten eines Chatrooms abrufen
router.get("/:id/messages", authMiddleware, getRoomMessages);

// Neue Nachricht in Chatroom erstellen
router.post("/:id/messages", authMiddleware, postMessage);
// Datei-Nachricht in Chatroom erstellen
router.post("/:id/messages/file", authMiddleware, ...postFileMessage);

// ChatRoom löschen
router.delete("/:id", authMiddleware, require("../controllers/chatroom.controller").deleteChatRoom);

export default router;
