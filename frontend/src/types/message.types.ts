/**
 * Message Types - Zentrale Type-Definitionen für Message-Management
 * 
 * Diese Types entsprechen der Backend-Struktur und werden verwendet von:
 * - messageApi.ts (Message API-Calls)
 * - socket.types.ts (Socket Message-Events)
 * - ChatRoomPage.tsx (Message-Anzeige)
 * - Message-Komponenten
 */

// ===== API RESPONSE TYPES (Backend-kompatibel) =====
export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface MessagesResponse extends MessageResponse<Message[]> {
  data: Message[];
  count: number;
  limit: number;
}

// ===== MESSAGE ENTITY TYPES (Backend-kompatibel) =====

/**
 * Message Entity - EXAKT wie im Backend definiert
 */
export interface Message {
  id: string;
  content: string;
  fileUrl?: string;
  fileType?: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
}

/**
 * Create Message Input - Für neue Nachricht-Erstellung (Backend-kompatibel)
 */
export interface CreateMessageInput {
  content: string;
  chatRoomId: string;
}

/**
 * Create File Message Input - Für Datei-Upload (Backend-kompatibel)
 */
export interface CreateFileMessageInput {
  file: File;
  chatRoomId: string;
}

// ===== FILE HANDLING TYPES =====

/**
 * File Types für Nachrichten
 */
export type MessageFileType = 
  | 'image/jpeg' 
  | 'image/png' 
  | 'image/gif' 
  | 'image/webp'
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/plain';

/**
 * File Upload Progress
 */
export interface FileUploadProgress {
  messageId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * File Info
 */
export interface MessageFileInfo {
  url: string;
  type: MessageFileType;
  name: string;
  size: number;
  thumbnail?: string; // Für Bilder/Videos
}

// ===== UTILITY FUNCTIONS =====

/**
 * Datei-Typ prüfen (für UI-Anzeige)
 */
export function getFileType(mimeType: string): 'image' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  const documentTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (documentTypes.includes(mimeType)) {
    return 'document';
  }
  
  return 'other';
}

/**
 * Dateiname aus URL extrahieren
 */
export function extractFilenameFromUrl(fileUrl: string): string {
  const parts = fileUrl.split('/');
  return parts[parts.length - 1] || 'unbekannte_datei';
}

/**
 * Datei-URL generieren (für Message-Dateien)
 */
export function getFileUrl(filename: string): string {
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';
  return `${baseUrl}/messages/files/${filename}`;
}

/**
 * 🔥 NEW: Avatar-URL generieren
 */
export function getAvatarUrl(avatarSrc: string): string {
  // Wenn es bereits eine vollständige URL ist, direkt verwenden
  if (avatarSrc.startsWith('http')) {
    return avatarSrc;
  }

  // Backend-Base-URL (ohne /api da Avatare statisch serviert werden)
  const baseUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api').replace('/api', '');
  
  // Alte URLs von /api/avatars/preset/ zu /avatars/ konvertieren
  let cleanSrc = avatarSrc;
  if (avatarSrc.startsWith('/api/avatars/preset/')) {
    cleanSrc = avatarSrc.replace('/api/avatars/preset/', '/avatars/');
  } else if (avatarSrc.startsWith('/api/avatars/')) {
    cleanSrc = avatarSrc.replace('/api/avatars/', '/avatars/');
  } else if (!avatarSrc.startsWith('/avatars/')) {
    cleanSrc = `/avatars/${avatarSrc}`;
  }
  
  return `${baseUrl}${cleanSrc}`;
}