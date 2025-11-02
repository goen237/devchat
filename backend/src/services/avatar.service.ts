// services/avatar.service.ts - KOMPLETT NEU SCHREIBEN
import fs from 'fs';
import path from 'path';
import { getDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { cacheWrapper, deleteCache } from '../utils/cache';

export interface Avatar {
  id: string;
  name: string;
  url: string;
  type: 'preset';
}

export class AvatarService {
  private userRepository = getDataSource().getRepository(User);
  // 🔥 FIXED: Korrekter Pfad zu den Avatar-Dateien
  private presetAvatarsPath = path.join(__dirname, '../../public/avatars');
  private uploadedAvatarsPath = path.join(__dirname, '../../uploads');

  // Alle verfügbaren Avatare (Preset)
  // MIT CACHING: Avatar-Liste ändert sich selten (nur bei Deployment)
  async getAvailableAvatars(): Promise<Avatar[]> {
    return await cacheWrapper(
      'avatars:available',
      async () => {
        const presetAvatars = await this.getPresetAvatars();
        return [...presetAvatars];
      },
      3600 // 1 Stunde Cache (Avatar-Liste ändert sich extrem selten)
    );
  }

  // 🔥 FIXED: Preset-Avatare (sowohl SVG als auch JPG)
  async getPresetAvatars(): Promise<Avatar[]> {
    try {
      console.log('🔍 Reading avatars from:', this.presetAvatarsPath);
      const files = fs.readdirSync(this.presetAvatarsPath);
      console.log('📁 Found files:', files);
      
      return files
        .filter(file => file.endsWith('.jpg') || file.endsWith('.svg'))
        .filter(file => !file.includes('README'))
        .map(file => ({
          id: file,
          name: this.getDisplayName(file),
          // 🔥 FIXED: Korrekte URL für statisch servierte Dateien
          url: `/avatars/${file}`,
          type: 'preset' as const
        }));
    } catch (error) {
      console.error('❌ Error reading preset avatars:', error);
      return [];
    }
  }


  // Avatar auswählen
  // Cache-Invalidierung: Löscht User-Profile-Cache nach Avatar-Update
  async selectAvatar(userId: string, avatarId: string): Promise<User> {
    const avatars = await this.getAvailableAvatars();
    const selectedAvatar = avatars.find(a => a.id === avatarId);
    
    if (!selectedAvatar) {
      throw new Error('Avatar nicht gefunden');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User nicht gefunden');
    }

    user.avatarUrl = selectedAvatar.url;
    await this.userRepository.save(user);
    
    // 🗑️ CACHE INVALIDIERUNG: Lösche User-Profile-Cache
    await deleteCache(`profile:${userId}`);
    
    return user;
  }

  // Avatar-Datei bereitstellen (nur noch für Preset-Avatare)
  async getAvatarFile(filename: string): Promise<string> {
    const filePath = path.join(this.presetAvatarsPath, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error('Avatar-Datei nicht gefunden');
    }
    
    return filePath;
  }

  // 🔥 FIXED: Intelligente Display-Namen für verschiedene Avatar-Typen
  private getDisplayName(filename: string): string {
    const nameWithoutExt = filename.replace(/\.(jpg|svg)$/, '');
    
    // Simpsons Avatare
    if (nameWithoutExt.startsWith('simpsons_-_')) {
      const characterName = nameWithoutExt
        .replace('simpsons_-_', '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return characterName;
    }
    
    // Standard Avatare (avatar1, avatar2, etc.)
    if (nameWithoutExt.startsWith('avatar')) {
      const number = nameWithoutExt.replace('avatar', '');
      return `Avatar ${number}`;
    }
    
    // Fallback: Dateiname ohne Unterstriche
    return nameWithoutExt.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}