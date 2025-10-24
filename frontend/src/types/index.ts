/**
 * Types Index - Zentrale Exports aller Type-Definitionen
 * 
 * Diese Datei ermöglicht saubere Imports:
 * - import { ChatRoom, User, Message } from '../types';
 * 
 * Statt:
 * - import { ChatRoom } from '../types/chatroom.types';
 * - import { User } from '../types/user.types';
 * - import { Message } from '../types/message.types';
 */

// ===== IMPORTS für Type Guards =====
import type { User, UserPublicInfo } from './user.types';
import type { ChatRoom } from './chatroom.types';
import type { Message } from './message.types';

// ===== CORE ENTITY TYPES =====
export type { 
  User, 
  UserPublicInfo, 
  UserProfile, 
  UserPreferences, 
  UserStats,
  OnlineUser,
  UserOnlineStatus,
  UserPresence 
} from './user.types';

export type { 
  ChatRoom, 
  CreateChatRoomData, 
  StartPrivateChatData, 
  CreateGroupChatData,
  ChatRoomDisplayInfo,
  ChatRoomFilters,
  ChatRoomSortOptions 
} from './chatroom.types';

export type { 
  Message, 
  MessageResponse,
  MessagesResponse,
  CreateMessageInput,
  CreateFileMessageInput,
  MessageFileType,
  MessageFileInfo,
  FileUploadProgress 
} from './message.types';

// ===== SOCKET TYPES =====
export type { 
  SocketService,
  SocketState,
  SocketEventListeners,
  SendMessageData,
  ReceiveMessageData,
  UserOnlineData,
  OnlineUsersData,
  FileUploadInfoData,
  RoomJoinedData,
  UserJoinedData,
  UserLeftData,
  ErrorMessageData 
} from './socket.types';

// ===== API RESPONSE TYPES =====
export type { 
  ApiResponse 
} from './user.types';

// ===== AUTHENTICATION TYPES =====
export type { 
  LoginCredentials, 
  RegisterData, 
  GoogleAuthData, 
  AuthTokenResponse 
} from './user.types';

// ===== UTILITY TYPES =====
export type { 
  UserFilters, 
  UserSortOptions 
} from './user.types';

// Retirer les lignes inutilisées - MessageFilters, MessageSortOptions, MessagePagination n'existent plus

// ===== UTILITY FUNCTIONS =====
export { 
  getFileType,
  extractFilenameFromUrl,
  getFileUrl,
  getAvatarUrl 
} from './message.types';

// ===== TYPE GUARDS & UTILITIES =====

/**
 * Type Guard: Prüft ob ein Object ein User ist
 */
export const isUser = (obj: unknown): obj is User => {
  return obj !== null && 
         typeof obj === 'object' &&
         typeof (obj as User).id === 'string' && 
         typeof (obj as User).username === 'string' && 
         typeof (obj as User).email === 'string';
};

/**
 * Type Guard: Prüft ob ein Object eine ChatRoom ist
 */
export const isChatRoom = (obj: unknown): obj is ChatRoom => {
  return obj !== null && 
         typeof obj === 'object' &&
         typeof (obj as ChatRoom).id === 'string' && 
         typeof (obj as ChatRoom).name === 'string' && 
         ['private', 'group'].includes((obj as ChatRoom).type) &&
         Array.isArray((obj as ChatRoom).participants);
};

/**
 * Type Guard: Prüft ob ein Object eine Message ist
 */
export const isMessage = (obj: unknown): obj is Message => {
  return obj !== null && 
         typeof obj === 'object' &&
         typeof (obj as Message).id === 'string' && 
         typeof (obj as Message).content === 'string' && 
         typeof (obj as Message).createdAt === 'string' &&
         (obj as Message).sender && 
         typeof (obj as Message).sender.id === 'string';
};

/**
 * Utility: Erstellt UserPublicInfo aus User
 */
export const toUserPublicInfo = (user: User): UserPublicInfo => ({
  id: user.id,
  username: user.username,
  avatarUrl: user.avatarUrl,
  isOnline: user.isOnline,
  semester: user.semester
});

/**
 * 🔥 FIXED: Utility: Generiert Display-Name für ChatRoom mit Smart Titles
 */
export const getChatRoomDisplayName = (chatRoom: ChatRoom, currentUserId: string): string => {
  console.log('=== getChatRoomDisplayName Debug ===');
  console.log('ChatRoom:', chatRoom);
  console.log('Current User ID:', currentUserId);
  console.log('Participants:', chatRoom.participants);
  console.log('ChatRoom Type:', chatRoom.type);
  
  // Für Gruppen-Chats: 👥 + Gruppenname
  if (chatRoom.type === 'group') {
    const groupTitle = `👥 ${chatRoom.name || 'Gruppenchat'}`;
    console.log('Group Title:', groupTitle);
    return groupTitle;
  }
  
  // Für Private Chats: 🔒 + Username des anderen Users
  if (chatRoom.type === 'private') {
    if (!chatRoom.participants || chatRoom.participants.length === 0) {
      console.warn('⚠️ Keine Participants gefunden für privaten Chat');
      return '🔒 Privater Chat';
    }
    
    const otherUser = chatRoom.participants.find(p => {
      console.log(`Checking participant: ${p.id} vs current: ${currentUserId}`);
      return p.id !== currentUserId;
    });
    
    console.log('Other User found:', otherUser);
    const userName = otherUser?.username || 'Unbekannter User';
    const privateTitle = userName;
    console.log('Private Title:', privateTitle);
    return privateTitle;
  }
  
  // Fallback für andere Typen oder leere Daten
  const fallback = chatRoom.name || 'Chat';
  console.log('Fallback Title:', fallback);
  return fallback;
};