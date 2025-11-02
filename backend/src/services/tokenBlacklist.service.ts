/**
 * Token Blacklist Service
 * 
 * PROBLEM:
 * JWT Tokens sind stateless - sie können nicht "ungültig gemacht" werden.
 * Ein Token ist gültig bis es abläuft (exp claim).
 * 
 * LÖSUNG:
 * Speichere ausgeloggte Tokens in Redis Blacklist.
 * Bei jedem Request prüfen wir: Ist Token in Blacklist?
 * 
 * VORTEILE VON REDIS:
 * - Sehr schnell (in-memory)
 * - Automatisches Löschen mit TTL (nach Token Ablauf unnötig)
 * - Shared State (bei mehreren Backend-Instanzen)
 */

import { redisClient, isRedisConnected } from '../config/redis';
import jwt from 'jsonwebtoken';

/**
 * Fügt Token zur Blacklist hinzu (bei Logout)
 */
export async function blacklistToken(token: string): Promise<void> {
  try {
    // ⚠️ Prüfe ob Redis verbunden ist
    if (!isRedisConnected()) {
      console.warn('⚠️ Token blacklist skipped (Redis not connected)');
      console.warn('   Token remains valid until expiration');
      return; // Token kann nicht invalidiert werden ohne Redis
    }
    
    // 1. Dekodiere Token um Ablaufzeit zu extrahieren
    const decoded = jwt.decode(token) as { exp: number } | null;
    
    if (!decoded || !decoded.exp) {
      // Token hat keine Ablaufzeit - speichere für 24h
      await redisClient.set(`blacklist:${token}`, 'logged_out', {
        EX: 86400 // 24 Stunden in Sekunden
      });
      return;
    }
    
    // 2. Berechne verbleibende Zeit bis Token abläuft
    const now = Math.floor(Date.now() / 1000); // Unix Timestamp in Sekunden
    const ttl = decoded.exp - now; // Zeit in Sekunden bis Ablauf
    
    if (ttl > 0) {
      // 3. Speichere Token in Redis mit TTL
      // KEY: "blacklist:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      // VALUE: "logged_out"
      // TTL: Verbleibende Zeit bis Token abläuft
      await redisClient.set(`blacklist:${token}`, 'logged_out', {
        EX: ttl // EX = Sekunden
      });
      
      console.log(`Token blacklisted for ${ttl} seconds`);
    }
    // Wenn ttl <= 0: Token bereits abgelaufen, nichts tun
    
  } catch (error) {
    console.error('Error blacklisting token:', error);
    // Werfe Fehler weiter - Logout sollte nicht fehlschlagen
    throw error;
  }
}

/**
 * Prüft ob Token in Blacklist ist
 * Wird in authMiddleware aufgerufen
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    // ⚠️ Prüfe ob Redis verbunden ist
    if (!isRedisConnected()) {
      console.log('⚠️ Token blacklist check skipped (Redis not connected)');
      return false; // Annahme: Token ist gültig (Failsafe)
    }
    
    // Prüfe ob Key existiert in Redis
    const result = await redisClient.exists(`blacklist:${token}`);
    return result === 1; // exists gibt 1 zurück wenn Key existiert
    
  } catch (error) {
    console.error('Error checking token blacklist:', error);
    // Bei Redis-Fehler: Annahme Token ist gültig (Failsafe)
    return false;
  }
}

/**
 * VERWENDUNG:
 * 
 * 1. In auth.controller.ts (Logout):
 * 
 *    async logout(req: Request, res: Response) {
 *      const token = req.headers.authorization?.split(' ')[1];
 *      await blacklistToken(token);
 *      res.json({ message: 'Logged out successfully' });
 *    }
 * 
 * 2. In authMiddleware.ts (Token Validierung):
 * 
 *    // Nach JWT-Verifikation:
 *    if (await isTokenBlacklisted(token)) {
 *      return res.status(401).json({ error: 'Token has been revoked' });
 *    }
 * 
 * WARUM REDIS?
 * - In-Memory = extrem schnell (< 1ms)
 * - TTL = automatisches Cleanup (kein manuelles Löschen)
 * - Skalierbar = alle Backend-Instanzen teilen Blacklist
 * 
 * ALTERNATIVE OHNE REDIS:
 * - Datenbank: Langsamer, mehr Load
 * - In-Memory Array: Verloren bei Neustart, nicht shared
 * - Token Refresh: Komplexer, mehr Code
 */
