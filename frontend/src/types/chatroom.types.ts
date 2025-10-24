/**
 * ChatRoom Types - Zentrale Type-Definitionen für ChatRoom-Management
 * 
 * Diese Types werden verwendet von:
 * - chatApi.ts (ChatRoom API-Calls)
 * - DashboardPage.tsx (ChatRoom-Liste)
 * - CreateGroupChatModal.tsx (Gruppen-Chat-Erstellung)
 * - Andere ChatRoom-bezogene Komponenten
 */

import type { User } from './user.types';

// ===== CHAT ROOM TYPES =====

/**
 * ChatRoom Entity - Hauptdatenstruktur für Chat-Räume
 */
export interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  createdAt: string;
  participants: User[];
  displayName?: string;
  displayAvatar?: string | null;
}

/**
 * ChatRoom Creation Data - Für neue ChatRoom-Erstellung
 */
export interface CreateChatRoomData {
  name: string;
  type: 'private' | 'group';
  participantIds: string[];
}

/**
 * Private Chat Start Data - Für privaten Chat zwischen zwei Usern
 */
export interface StartPrivateChatData {
  userId: string;
}

/**
 * Group Chat Creation Data - Für Gruppen-Chat-Erstellung
 */
export interface CreateGroupChatData {
  name: string;
  participantIds: string[];
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
 * ChatRoom API Response Types
 */
export type ChatRoomsResponse = ApiResponse<ChatRoom[]>;
export type ChatRoomResponse = ApiResponse<ChatRoom>;
export type DeleteChatRoomResponse = ApiResponse<void>;

// ===== UTILITY TYPES =====

/**
 * ChatRoom Display Information - Für UI-Anzeige optimiert
 */
export interface ChatRoomDisplayInfo {
  id: string;
  displayName: string;
  displayAvatar: string | null;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  isOnline?: boolean;
}

/**
 * ChatRoom Filter Options - Für Suche und Filterung
 */
export interface ChatRoomFilters {
  type?: 'private' | 'group' | 'all';
  search?: string;
  onlineOnly?: boolean;
}

/**
 * ChatRoom Sort Options - Für Sortierung
 */
export type ChatRoomSortBy = 'name' | 'createdAt' | 'lastActivity' | 'participantCount';
export type ChatRoomSortOrder = 'asc' | 'desc';

export interface ChatRoomSortOptions {
  sortBy: ChatRoomSortBy;
  order: ChatRoomSortOrder;
}