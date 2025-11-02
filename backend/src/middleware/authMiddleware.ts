import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../services/tokenBlacklist.service";

/**
 * Auth Middleware
 * Validiert JWT Token und prüft Blacklist
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Prüfe ob Authorization Header existiert
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  // 2. Extrahiere Token (Format: "Bearer <token>")
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    // 3. Verifiziere JWT Signatur
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // 4. Prüfe ob Token in Blacklist (wurde ausgeloggt)
    // WICHTIG: Diese Prüfung passiert NACH JWT-Verifikation
    // So verhindern wir, dass ungültige Tokens Redis belasten
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ 
        error: "Token has been revoked",
        message: "Please log in again" 
      });
    }
    
    // 5. ✅ Token ist gültig - Speichere User-Info in Request
    // Unterstütze beide Token-Formate (userId und id)
    (req as any).user = { id: payload.userId || payload.id };
    
    next();
  } catch (err) {
    // JWT-Verifikation fehlgeschlagen
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
