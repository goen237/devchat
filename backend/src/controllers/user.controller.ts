import { Request, Response } from "express";
import { getAllUsersService } from "../services/user.service";

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await getAllUsersService();
    res.json(users);
  } catch (err) {
    console.error("Fehler beim Laden der Nutzer:", err);
    res.status(500).json({ message: "Fehler beim Laden der Nutzer" });
  }
}
