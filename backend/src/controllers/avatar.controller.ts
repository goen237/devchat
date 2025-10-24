// controllers/avatar.controller.ts - FUNKTIONS-BASIERT
import { Request, Response } from 'express';
import { AvatarService } from '../services/avatar.service';
import { handleControllerError } from '../utils/error-handler';

const avatarService = new AvatarService();

export async function getAvailableAvatars(req: Request, res: Response): Promise<void> {
  try {
    const avatars = await avatarService.getAvailableAvatars();
    res.json({
      success: true,
      avatars
    });
  } catch (error) {
    handleControllerError(error, res, 'Fehler beim Laden der Avatare');
  }
}

export async function selectAvatar(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user.id; // TODO: AuthenticatedRequest verwenden
    const { avatarId } = req.body;

    if (!avatarId) {
      res.status(400).json({
        success: false,
        message: 'Avatar ID erforderlich'
      });
      return;
    }

    const updatedUser = await avatarService.selectAvatar(userId, avatarId);
    
    res.json({
      success: true,
      message: 'Avatar erfolgreich aktualisiert',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        avatarUrl: updatedUser.avatarUrl
      }
    });
  } catch (error) {
    handleControllerError(error, res, 'Fehler beim Auswählen des Avatars');
  }
}

// 🔥 UPDATED: serveAvatar funktioniert jetzt nur für preset avatare
export async function serveAvatar(req: Request, res: Response): Promise<void> {
  try {
    const { type, filename } = req.params;
    
    if (type !== 'preset') {
      res.status(400).json({ message: 'Ungültiger Avatar-Typ' });
      return;
    }

    const filePath = await avatarService.getAvatarFile(filename);
    res.sendFile(filePath);
  } catch (error) {
    handleControllerError(error, res, 'Avatar-Datei nicht gefunden');
  }
}