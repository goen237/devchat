import { Response } from "express";

export function handleControllerError(error: unknown, res: Response, defaultMessage: string): void {
  console.error(defaultMessage, error);
  
  if (error instanceof Error) {
    if (error.message.includes("not found") || error.message.includes("nicht gefunden")) {
      res.status(404).json({ message: "Ressource nicht gefunden" });
      return;
    }
    if (error.message.includes("unauthorized") || error.message.includes("nicht autorisiert")) {
      res.status(403).json({ message: "Zugriff nicht autorisiert" });
      return;
    }
  }
  
  res.status(500).json({ message: defaultMessage });
}