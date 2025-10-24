import { Request, Response } from "express";
import { getUserProfile, updateUserPassword, updateUserProfile } from "../services/profile.service";

export const getProfile = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const user = await getUserProfile(userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Profil konnte nicht geladen werden" });
  }
};


export const updateProfile = async (req: Request, res: Response) => {
  const { email, username, semester } = req.body;
  const userId = (req as any).user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updatedUser = await updateUserProfile(userId, { email, username, semester });
    res.json(updatedUser);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { oldPassword, newPassword } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "Beide Passwörter sind erforderlich." });
  try {
    const updatedUserPassword = await updateUserPassword(userId, { oldPassword, newPassword });
    res.json(updatedUserPassword);
  } catch (err) {
    res.status(500).json({ error: "Fehler beim Ändern des Passworts." });
  }
};

