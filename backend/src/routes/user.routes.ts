import { Router } from "express";
import { getAllUsers } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getAllUsers);

export default router;
