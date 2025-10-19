import { api } from "./client";

export async function uploadAvatar(token: string, file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  try {
    const res = await api.post("/profile/avatar", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });
    return res.data;
  } catch (error) {
    console.error("Fehler beim Hochladen des Avatars:", error);
    throw new Error("Fehler beim Hochladen des Avatars");
  }
}

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
