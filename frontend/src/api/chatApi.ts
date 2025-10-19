import { api } from "./client";


export async function deleteChatRoom(token: string, chatRoomId: string) {
  try {
    const res = await api.delete(`/chatrooms/${chatRoomId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Löschen des Chatrooms:", error);
    throw new Error("Fehler beim Löschen des Chatrooms");
  }
}

export async function getChatRooms(token: string) {
  try {
    const res = await api.get("/chatrooms", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Chatrooms geladen:", res.data);
    return res.data;
  } catch (error) {
    console.error("Fehler beim Laden der Chatrooms:", error);
    throw new Error("Fehler beim Laden der Chatrooms");
  }
}

// Weitere API-Methoden für Chatrooms folgen ...

export async function sendFileMessage(token: string, chatRoomId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await api.post(`/chatrooms/${chatRoomId}/messages/file`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Senden der Datei:", error);
    throw new Error("Fehler beim Senden der Datei");
  }
}

export async function createGroupChat(token: string, name: string, participantIds: string[]) {
  try {
    const res = await api.post("/chatrooms/group", { name, participantIds }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Erstellen des Gruppenchats:", error);
    throw new Error("Fehler beim Erstellen des Gruppenchats");
  }
}

export async function getChatMessages(token: string, chatRoomId: string) {
  try {
    const res = await api.get(`/chatrooms/${chatRoomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Laden der Nachrichten:", error);
    throw new Error("Fehler beim Laden der Nachrichten");
  }
}

export async function sendMessage(token: string, chatRoomId: string, content: string) {
  try {
    const res = await api.post(`/chatrooms/${chatRoomId}/messages`, { content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Senden der Nachricht:", error);
    throw new Error("Fehler beim Senden der Nachricht");
  }
}

export async function getAllUsers(token: string) {
  try {
    const res = await api.get("/users", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Laden der Nutzer:", error);
    throw new Error("Fehler beim Laden der Nutzer");
  }
}

export async function startPrivateChat(token: string, userId: string) {
  try {
    const res = await api.post("/chatrooms/private", { userId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Starten des privaten Chats:", error);
    throw new Error("Fehler beim Starten des privaten Chats");
  }
}
