import { Router } from 'express';
import { AvatarController } from '../controllers/avatar.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const avatarController = new AvatarController();

// Get all available avatars
router.get('/list', avatarController.getAvailableAvatars);

// Update user's selected avatar
router.post('/select', authMiddleware, avatarController.selectAvatar);

export default router;