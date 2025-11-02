/**
 * Rate Limiting Middleware mit Redis
 * 
 * ZWECK:
 * - Schützt die API vor Spam und DDoS-Attacken
 * - Limitiert Anfragen pro IP-Adresse in einem Zeitfenster
 * - Speichert Counter in Redis (schnell & ephemeral)
 * 
 * WIE ES FUNKTIONIERT:
 * 1. Extrahiere IP-Adresse des Clients
 * 2. Erstelle Redis-Key: "rate_limit:{ip}"
 * 3. Inkrementiere Counter
 * 4. Setze TTL (Time To Live) beim ersten Request
 * 5. Blockiere wenn Limit überschritten
 */

import { Request, Response, NextFunction } from 'express';
import { redisClient, isRedisConnected } from '../config/redis';

// Rate Limit Konfiguration
interface RateLimitOptions {
  windowMs: number;  // Zeitfenster in Millisekunden
  maxRequests: number;  // Max Anzahl Requests pro Fenster
  message?: string;  // Custom Fehlermeldung
}

/**
 * Standard Rate Limit (allgemeine Endpoints)
 * - 100 Requests pro 15 Minuten
 */
export const standardRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  maxRequests: 100,
  message: 'Too many requests, please try again later.'
});

/**
 * Strict Rate Limit (Auth Endpoints: Login, Register)
 * - 5 Requests pro 15 Minuten
 * Verhindert Brute-Force-Attacken auf Passwörter
 */
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  maxRequests: 5,
  message: 'Too many login attempts, please try again later.'
});

/**
 * Erstellt Rate Limit Middleware
 */
function createRateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ⚠️ FALLBACK: Wenn Redis nicht verbunden, überspringe Rate Limiting
      if (!isRedisConnected()) {
        console.log('⚠️ Rate limiting skipped (Redis not connected)');
        return next(); // Erlaube Request ohne Rate Limiting
      }
      
      // 1. Extrahiere IP-Adresse
      // x-forwarded-for: Echte IP hinter Proxy/Load Balancer
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                 req.socket.remoteAddress || 
                 'unknown';
      
      // 2. Erstelle eindeutigen Redis-Key
      // Format: "rate_limit:192.168.1.1"
      const key = `rate_limit:${ip}`;
      
      // 3. Hole aktuellen Counter aus Redis
      const current = await redisClient.get(key);
      
      if (current === null) {
        // ERSTER REQUEST in diesem Zeitfenster
        // - Setze Counter auf 1
        // - Setze TTL (automatisches Löschen nach windowMs)
        await redisClient.set(key, '1', {
          PX: options.windowMs // PX = Millisekunden
        });
        
        // Setze Response Headers (informiert Client über Limit)
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', options.maxRequests - 1);
        
        return next(); // ✅ Request erlaubt
      }
      
      // 4. Prüfe ob Limit erreicht
      const currentCount = parseInt(current);
      
      if (currentCount >= options.maxRequests) {
        // ❌ LIMIT ÜBERSCHRITTEN
        // Hole TTL für Retry-After Header
        const ttl = await redisClient.pTTL(key); // pTTL = milliseconds
        
        res.setHeader('X-RateLimit-Limit', options.maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('Retry-After', Math.ceil(ttl / 1000)); // Sekunden
        
        return res.status(429).json({
          error: options.message || 'Too many requests',
          retryAfter: Math.ceil(ttl / 1000)
        });
      }
      
      // 5. Inkrementiere Counter
      await redisClient.incr(key);
      
      // Setze Response Headers
      res.setHeader('X-RateLimit-Limit', options.maxRequests);
      res.setHeader('X-RateLimit-Remaining', options.maxRequests - currentCount - 1);
      
      next(); // ✅ Request erlaubt
      
    } catch (error) {
      // FALLBACK: Bei Redis-Fehler, erlaube Request
      // Besser etwas unsicher als komplett offline
      console.error('Rate limit error:', error);
      next();
    }
  };
}

/**
 * VERWENDUNG in Routes:
 * 
 * import { standardRateLimit, authRateLimit } from './middleware/rateLimit';
 * 
 * // Allgemeine Endpoints
 * app.use('/api', standardRateLimit);
 * 
 * // Auth Endpoints
 * router.post('/login', authRateLimit, authController.login);
 * router.post('/register', authRateLimit, authController.register);
 */
