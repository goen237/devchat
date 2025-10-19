import { Request, Response } from 'express';
import { AvatarService } from '../services/avatar.service';

export class AvatarController {
  private avatarService = new AvatarService();

  getAvailableAvatars = async (req: Request, res: Response) => {
    try {
      const avatars = await this.avatarService.getAvailableAvatars();
      res.json({
        success: true,
        avatars
      });
    } catch (error) {
      console.error('Error getting available avatars:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching available avatars'
      });
    }
  };

  selectAvatar = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { avatarName } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      if (!avatarName) {
        return res.status(400).json({
          success: false,
          message: 'Avatar name is required'
        });
      }

      const updatedUser = await this.avatarService.selectAvatar(userId, avatarName);
      
      res.json({
        success: true,
        message: 'Avatar updated successfully',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          avatarUrl: updatedUser.avatarUrl
        }
      });
    } catch (error) {
      console.error('Error selecting avatar:', error);
      
      if (error instanceof Error && error.message === 'Invalid avatar name') {
        return res.status(400).json({
          success: false,
          message: 'Invalid avatar selected'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error updating avatar'
      });
    }
  };
}