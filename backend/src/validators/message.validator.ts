// Nachricht validieren
export function validateMessageContent(content: string): string | null {
  if (!content || typeof content !== 'string') {
    return "Nachrichteninhalt erforderlich";
  }
  
  const trimmedContent = content.trim();
  if (trimmedContent.length === 0) {
    return "Nachricht darf nicht leer sein";
  }
  
  if (trimmedContent.length > 2000) {
    return "Nachricht ist zu lang (max. 2000 Zeichen)";
  }
  
  return null;
}

// Datei validieren (erweitert)
import { MulterFile } from "../types/multer";

export function validateFile(file: MulterFile): string | null {
  if (!file) {
    return "Keine Datei hochgeladen";
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-rar-compressed'
  ];

  if (file.size === 0) {
    return "Datei ist leer";
  }

  if (file.size > maxSize) {
    return "Datei ist zu groß (max. 10MB)";
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return `Dateityp ${file.mimetype} nicht erlaubt`;
  }

  // Prüfe auf gefährliche Dateierweiterungen
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.jar'];
  const fileExt = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (dangerousExtensions.includes(fileExt)) {
    return "Ausführbare Dateien sind nicht erlaubt";
  }

  // Prüfe Dateiname auf schädliche Zeichen
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (dangerousChars.test(file.originalname)) {
    return "Dateiname enthält nicht erlaubte Zeichen";
  }

  return null;
}

// ChatRoom ID validieren (erweitert)
export function validateChatRoomId(chatRoomId: string): string | null {
  if (!chatRoomId || typeof chatRoomId !== 'string') {
    return "ChatRoom ID erforderlich";
  }
  
  const trimmedId = chatRoomId.trim();
  if (trimmedId.length === 0) {
    return "ChatRoom ID darf nicht leer sein";
  }
  
  // UUID-Format prüfen (optional)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(trimmedId)) {
    return "Ungültige ChatRoom ID Format";
  }
  
  return null;
}

// Kombinierte Validierung für Message-Input
export interface CreateMessageInput {
  content?: string;
  chatRoomId?: string;
}

export function validateCreateMessageInput(input: CreateMessageInput): string | null {
  const chatRoomError = validateChatRoomId(input.chatRoomId || '');
  if (chatRoomError) return chatRoomError;
  
  const contentError = validateMessageContent(input.content || '');
  if (contentError) return contentError;
  
  return null;
}

// Kombinierte Validierung für Datei-Message-Input
export interface CreateFileMessageInput {
  chatRoomId?: string;
  file?: MulterFile;
}

export function validateCreateFileMessageInput(input: CreateFileMessageInput): string | null {
  const chatRoomError = validateChatRoomId(input.chatRoomId || '');
  if (chatRoomError) return chatRoomError;
  
  if (!input.file) {
    return "Datei erforderlich";
  }
  
  const fileError = validateFile(input.file);
  if (fileError) return fileError;
  
  return null;
}