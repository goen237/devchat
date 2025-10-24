import { api } from "./client";
import type { ChatRoom } from "../types/chatroom.types";
import type { User } from "../types/user.types";

/**
 * ChatRoom API - ChatRoom-Verwaltung
 * 
 * Verantwortlichkeiten:
 * - ChatRooms listen/erstellen/löschen
 * - Private/Gruppen-Chats starten
 * - User-Management für Chat-Partner-Auswahl
 * 
 * NICHT für: Nachrichten senden/empfangen/löschen (siehe messageApi.ts)
 * 
 * Types sind in separate Dateien ausgelagert:
 * - ChatRoom types: ../types/chatroom.types.ts
 * - User types: ../types/user.types.ts
 */

// ===== RE-EXPORTS für Backward Compatibility =====
export type { ChatRoom } from "../types/chatroom.types";
export type { User } from "../types/user.types";

// ===== HELPER FUNCTIONS =====
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Nicht authentifiziert');
  return { Authorization: `Bearer ${token}` };
};

const handleApiError = (error: unknown, defaultMessage: string): never => {
  console.error(defaultMessage, error);
  
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    if (apiError.response?.data?.message) {
      throw new Error(apiError.response.data.message);
    }
  }
  
  throw new Error(defaultMessage);
};

/**
 * ChatRoom löschen
 */
export async function deleteChatRoom(chatRoomId: string): Promise<void> {
  try {
    const res = await api.delete(`/chatrooms/${chatRoomId}`, {
      headers: getAuthHeader()
    });
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Fehler beim Löschen des Chatrooms');
    }
  } catch (error) {
    handleApiError(error, "Fehler beim Löschen des Chatrooms");
  }
}

/**
 * Alle ChatRooms des Users laden
 */
export async function getChatRooms(): Promise<ChatRoom[]> {
  try {
    const res = await api.get("/chatrooms", {
      headers: getAuthHeader()
    });
    
    console.log("Chatrooms geladen:", res.data);
    return res.data || [];
  } catch (error) {
    handleApiError(error, "Fehler beim Laden der Chatrooms");
    return [];
  }
}

/**
 * Gruppen-Chat erstellen
 */
export async function createGroupChat(name: string, participantIds: string[]): Promise<ChatRoom> {
  try {
    const res = await api.post("/chatrooms/group", { name, participantIds }, {
      headers: getAuthHeader()
    });
    
    return res.data || [];
  } catch (error) {
    handleApiError(error, "Fehler beim Erstellen des Gruppenchats");
    return { id: '', name: '', type: 'group', createdAt: '', participants: [] };
  }
}

/**
 * Privaten Chat starten
 */
export async function startPrivateChat(userId: string): Promise<ChatRoom> {
  try {
    const res = await api.post("/chatrooms/private", { userId }, {
      headers: getAuthHeader()
    });
    
    return res.data || [];
  } catch (error) {
    handleApiError(error, "Fehler beim Starten des privaten Chats");
    return { id: '', name: '', type: 'private', createdAt: '', participants: [] };
  }
}

// ===== USER APIs (für Chat-Funktionalität) =====

/**
 * Alle User laden (für Chat-Partner-Auswahl)
 */
export async function getAllUsers(): Promise<User[]> {
  try {
    const res = await api.get("/users", {
      headers: getAuthHeader()
    });
    
    return res.data || [];
  } catch (error) {
    handleApiError(error, "Fehler beim Laden der Nutzer");
    return [];
  }
}
