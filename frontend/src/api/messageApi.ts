import { api } from "./client";
import type { Message } from "../types/message.types";

/**
 * Message API - HTTP-basierte Nachrichtenverwaltung
 * 
 * Für:
 * - Nachrichten laden (GET)
 * - Datei-Upload (POST multipart/form-data)
 * - Nachrichten löschen (DELETE)
 * 
 * Text-Nachrichten werden über Socket.io gesendet (Real-time)
 */

// ===== HELPER FUNCTIONS =====

/**
 * Authorization Header aus localStorage Token generieren
 */
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Nicht authentifiziert');
  }
  return { Authorization: `Bearer ${token}` };
};

/**
 * API Error Handling
 */
interface ApiErrorLike {
  response?: {
    data?: { message?: string };
    status?: number;
  };
}

const isApiErrorLike = (err: unknown): err is ApiErrorLike =>
  typeof err === 'object' && err !== null && 'response' in err;

const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error(defaultMessage, error);
  
  if (isApiErrorLike(error)) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    
    if (error.response?.status === 401) {
      throw new Error('Authentifizierung fehlgeschlagen');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Zugriff verweigert');
    }
  }
  
  throw new Error(defaultMessage);
};

// ===== API FUNCTIONS =====

/**
 * Nachrichten eines ChatRooms laden
 */
export async function getRoomMessages(roomId: string, limit = 50): Promise<Message[]> {
  try {
    const response = await api.get(`/messages/room/${roomId}`, {
      headers: getAuthHeader(),
      params: { limit }
    });

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || 'Fehler beim Laden der Nachrichten');
    }
  } catch (error) {
    handleApiError(error, 'Fehler beim Laden der Nachrichten');
    return []; // TypeScript satisfaction
  }
}

/**
 * Text-Nachricht erstellen (HTTP - nur für Fallback)
 * Normalerweise wird sendMessage über Socket.io verwendet
 */
// export async function createMessage(content: string, chatRoomId: string): Promise<Message> {
//   try {
//     const response = await api.post('/messages', {
//       content,
//       chatRoomId
//     }, {
//       headers: getAuthHeader()
//     });

//     if (response.data.success) {
//       return response.data.data;
//     } else {
//       throw new Error(response.data.message || 'Fehler beim Erstellen der Nachricht');
//     }
//   } catch (error) {
//     handleApiError(error, 'Fehler beim Erstellen der Nachricht');
//     throw error; // Re-throw für Caller
//   }
// }

/**
 * Datei-Nachricht erstellen (HTTP multipart/form-data)
 * Verwendet FormData für Datei-Upload
 */
export async function uploadFileMessage(file: File, chatRoomId: string): Promise<Message> {
  try {
    // Datei-Validierung (Client-side)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      throw new Error('Datei ist zu groß (max. 10MB)');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Dateityp ${file.type} nicht erlaubt`);
    }

    // FormData für Multipart-Upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('chatRoomId', chatRoomId);

    const response = await api.post('/messages/file', formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      },
      // Upload-Progress verfolgen (optional)
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        console.log(`📤 Upload: ${percentCompleted}%`);
      }
    });

    if (response.data.success) {
      console.log('📎 Datei erfolgreich hochgeladen:', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Fehler beim Hochladen der Datei');
    }
  } catch (error) {
    handleApiError(error, 'Fehler beim Hochladen der Datei');
    throw error; // Re-throw für Caller
  }
}

/**
 * 🔥 NEW: Text-Nachricht über HTTP senden (Fallback wenn Socket offline)
 */
export async function sendTextMessage(content: string, chatRoomId: string): Promise<Message> {
  try {
    console.log('🌐 Sending text message via HTTP...');
    
    const response = await api.post('/messages', {
      content,
      chatRoomId
    }, {
      headers: getAuthHeader()
    });

    if (response.data.success) {
      console.log('✅ Text message sent via HTTP:', response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Fehler beim Senden der Nachricht');
    }
  } catch (error) {
    handleApiError(error, 'Fehler beim Senden der Text-Nachricht');
    throw error; // Re-throw für Caller
  }
}

/**
 * Nachricht löschen
 */
export async function deleteMessage(messageId: string): Promise<void> {
  try {
    const response = await api.delete(`/messages/${messageId}`, {
      headers: getAuthHeader()
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Fehler beim Löschen der Nachricht');
    }

    console.log('🗑️ Nachricht erfolgreich gelöscht');
  } catch (error) {
    handleApiError(error, 'Fehler beim Löschen der Nachricht');
  }
}
