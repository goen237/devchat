import { api } from './client';

export interface Avatar {
  name: string;
  displayName: string;
  url: string;
}

export const avatarApi = {
  // Get all available avatars
  getAvailableAvatars: async (): Promise<Avatar[]> => {
    const response = await api.get('/avatars/list');
    return response.data.avatars;
  },

  // Select an avatar for the current user
  selectAvatar: async (avatarName: string) => {
    const response = await api.post('/avatars/select', {
      avatarName
    });
    return response.data;
  }
};