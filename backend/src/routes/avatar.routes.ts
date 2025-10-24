// routes/avatar.routes.ts
import { Router } from 'express';
import { getAvailableAvatars, selectAvatar, serveAvatar } from '../controllers/avatar.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Alle verfügbaren Avatare abrufen
router.get('/list', getAvailableAvatars);

// Avatar auswählen (authentifiziert)
router.post('/select', authMiddleware, selectAvatar);

// Avatar-Dateien bereitstellen
router.get('/:type/:filename', serveAvatar);

export default router;