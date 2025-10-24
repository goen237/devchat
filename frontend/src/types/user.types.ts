/**
 * User Types - Zentrale Type-Definitionen für User-Management
 * 
 * Diese Types werden verwendet von:
 * - chatApi.ts (User API-Calls)
 * - messageApi.ts (Message Sender-Info)
 * - socket.types.ts (Socket User-Events)
 * - Verschiedene UI-Komponenten
 */

// ===== USER ENTITY TYPES =====

/**
 * User Entity - Hauptdatenstruktur für Benutzer
 */
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  semester?: number;
  isGoogleUser?: boolean;
  googleId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Public Info - Öffentliche User-Informationen (ohne sensible Daten)
 */
export interface UserPublicInfo {
  id: string;
  username: string;
  avatarUrl: string | null;
  isOnline?: boolean;
  semester?: number;
}

/**
 * User Profile - Vollständige Profil-Informationen
 */
export interface UserProfile extends User {
  bio?: string;
  preferences?: UserPreferences;
  stats?: UserStats;
}

/**
 * User Preferences - Benutzer-Einstellungen
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
  };
}

/**
 * User Statistics - Benutzer-Statistiken
 */
export interface UserStats {
  messagesSent: number;
  chatRoomsJoined: number;
  filesShared: number;
  joinedAt: string;
  lastActiveAt: string;
}

// ===== ONLINE STATUS TYPES =====

/**
 * Online User - Für Online-Status-Anzeige
 */
export interface OnlineUser {
  id: string;
  username: string;
  avatarUrl?: string | null;
  lastSeen?: string;
}

/**
 * User Online Status
 */
export type UserOnlineStatus = 'online' | 'offline' | 'away' | 'busy';

/**
 * User Presence Information
 */
export interface UserPresence {
  userId: string;
  status: UserOnlineStatus;
  lastSeen: string;
  currentActivity?: string;
}

// ===== API RESPONSE TYPES =====

/**
 * Generic API Response Structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * User API Response Types
 */
export type UsersResponse = ApiResponse<User[]>;
export type UserResponse = ApiResponse<User>;
export type UserProfileResponse = ApiResponse<UserProfile>;
export type OnlineUsersResponse = ApiResponse<OnlineUser[]>;

// ===== AUTHENTICATION TYPES =====

/**
 * Login Credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration Data
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  semester?: number;
}

/**
 * Google OAuth Data
 */
export interface GoogleAuthData {
  googleId: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

/**
 * JWT Token Response
 */
export interface AuthTokenResponse {
  token: string;
  user: User;
  expiresIn: number;
}

// ===== UTILITY TYPES =====

/**
 * User Search Filters
 */
export interface UserFilters {
  search?: string;
  semester?: number;
  onlineOnly?: boolean;
  excludeIds?: string[];
}

/**
 * User Sort Options
 */
export type UserSortBy = 'username' | 'email' | 'createdAt' | 'lastActiveAt';
export type UserSortOrder = 'asc' | 'desc';

export interface UserSortOptions {
  sortBy: UserSortBy;
  order: UserSortOrder;
}