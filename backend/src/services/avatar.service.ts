import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class AvatarService {
  private userRepository = AppDataSource.getRepository(User);
  private avatarsPath = path.join(__dirname, '../../public/avatars');

  async getAvailableAvatars() {
    try {
      // Read all files from the avatars directory
      const files = fs.readdirSync(this.avatarsPath);
      
      // Filter only SVG files and create avatar objects
      const avatars = files
        .filter(file => file.endsWith('.svg'))
        .map(file => ({
          name: file,
          displayName: this.getDisplayName(file),
          url: `/avatars/${file}`
        }));

      return avatars;
    } catch (error) {
      console.error('Error reading avatars directory:', error);
      return [];
    }
  }

  async selectAvatar(userId: string, avatarName: string) {
    // Validate that the avatar exists
    const avatarPath = path.join(this.avatarsPath, avatarName);
    
    if (!fs.existsSync(avatarPath) || !avatarName.endsWith('.svg')) {
      throw new Error('Invalid avatar name');
    }

    // Update user's avatar URL
    const avatarUrl = `/avatars/${avatarName}`;
    
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    user.avatarUrl = avatarUrl;
    return await this.userRepository.save(user);
  }

  private getDisplayName(filename: string): string {
    // Convert filename to display name
    // avatar1.svg -> Avatar 1
    const nameWithoutExt = filename.replace('.svg', '');
    const number = nameWithoutExt.replace('avatar', '');
    return `Avatar ${number}`;
  }
}