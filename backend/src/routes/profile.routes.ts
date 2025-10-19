import { Router } from "express";
import multer from "multer";
import { getProfile, updateProfile, updatePassword, uploadAvatar } from "../controllers/profile.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

const avatarUpload = multer({ dest: "avatars/" });

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put("/password", authMiddleware, updatePassword);
// Avatar-Upload
router.post("/avatar", authMiddleware, avatarUpload.single("avatar"), uploadAvatar);

export default router;
