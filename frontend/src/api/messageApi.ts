import { api } from "./client";

export async function deleteMessage(token: string, messageId: string) {
  try {
    const res = await api.delete(`/messages/${messageId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Löschen der Nachricht:", error);
    throw new Error("Fehler beim Löschen der Nachricht");
  }
}
