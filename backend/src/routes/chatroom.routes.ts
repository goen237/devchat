import { Router } from "express";
import { getUserChatRooms, startPrivateChat, createGroupChat, deleteChatRoom } from "../controllers/chatroom.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// ChatRoom-Management (keine Message-Routes hier!)
router.get("/", authMiddleware, getUserChatRooms);
router.post("/private", authMiddleware, startPrivateChat);
router.post("/group", authMiddleware, createGroupChat);
router.delete("/:id", authMiddleware, deleteChatRoom);

export default router;
