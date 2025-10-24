import { api } from "./client";

/**
 * Profile API - Verwaltung von Benutzerprofilen
 * 
 * Avatar-Upload wurde entfernt - nur noch Auswahl aus verfügbaren Avataren
 * über die Avatar-API verfügbar.
 */

/**
 * Benutzerprofil abrufen
 */
export async function getProfile(token: string) {
    try {
        const res = await api.get("/profile", {
            headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
    } catch (error) {
        console.error("Fehler beim Laden des Profils:", error);
        throw new Error("Fehler beim Laden des Profils");
    }
}

/**
 * Benutzerprofil aktualisieren (ohne Avatar)
 */
export async function updateProfile(token: string, data: { username: string; email: string; oldPassword?: string; newPassword?: string; semester: number }) {
  try {
    const res = await api.put("/profile", data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Profils:", error);
    throw new Error("Fehler beim Aktualisieren des Profils");
  }
}

/**
 * Passwort ändern
 */
export async function updatePassword(token: string, oldPassword: string, newPassword: string) {
  try {
    const res = await api.put("/profile/password", { oldPassword, newPassword }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Passworts:", error);
    throw new Error("Fehler beim Aktualisieren des Passworts");
  }
}
