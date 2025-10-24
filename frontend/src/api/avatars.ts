import { api } from './client';

/**
 * Avatar API - Verwaltung von vorgefertigten Avataren
 * 
 * Nur Auswahl aus vorgefertigten SVG-Avataren - kein Upload möglich
 */

export interface Avatar {
  id: string;        // Dateiname (z.B. "avatar1.svg")
  name: string;      // Display-Name (z.B. "Avatar 1") 
  url: string;       // API-URL zum Abrufen
  type: 'preset';    // Nur preset-Avatare verfügbar
}

/**
 * Authorization Header generieren
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Nicht authentifiziert');
  }
  return { Authorization: `Bearer ${token}` };
};

export const avatarApi = {
  /**
   * Alle verfügbaren vorgefertigte Avatare abrufen
   */
  getAvailableAvatars: async (): Promise<Avatar[]> => {
    try {
      const response = await api.get('/avatars/list');
      
      if (response.data.success) {
        // Nur preset-Avatare filtern (für den Fall dass Backend noch uploaded zurückgibt)
        const avatars = response.data.avatars || [];
        return avatars.filter((avatar: Avatar) => avatar.type === 'preset');
      } else {
        throw new Error(response.data.message || 'Fehler beim Laden der Avatare');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Avatare:', error);
      throw error;
    }
  },

  /**
   * Vorgefertigten Avatar auswählen (durch Avatar-ID)
   */
  selectAvatar: async (avatarId: string) => {
    try {
      const response = await api.post('/avatars/select', {
        avatarId
      }, {
        headers: getAuthHeader()
      });

      if (response.data.success) {
        return response.data.user;
      } else {
        throw new Error(response.data.message || 'Fehler beim Auswählen des Avatars');
      }
    } catch (error) {
      console.error('Fehler beim Auswählen des Avatars:', error);
      throw error;
    }
  },

  /**
   * Avatar-URL für Preset-Avatare generieren
   */
  getAvatarUrl: (avatar: Avatar): string => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';
    return `${baseUrl}/avatars/preset/${avatar.id}`;
  }
};