/**
 * Redis Configuration & Client Setup
 * 
 * Redis wird verwendet für:
 * - Session Management (Token Blacklist)
 * - Rate Limiting (Spam-Schutz)
 * - Caching (Performance)
 * - Online User Tracking
 */

import { createClient } from 'redis';

// Redis Client Instance (wird in der ganzen App verwendet)
export const redisClient = createClient({
  // URL aus Environment Variable oder Fallback zu localhost
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Optionale Konfiguration
  socket: {
    // Reconnect-Strategie: abgestuftes Backoff, stoppt nach mehreren Versuchen
    reconnectStrategy: (retries, cause) => {
      // Stoppe die Versuche nach N Wiederholungen (gibt ein Error zurück, damit der Client das als Abbruch behandelt)
      const MAX_RETRIES = 10;
      if (retries > MAX_RETRIES) {
        console.warn('❌ Redis: Too many reconnection attempts. Stopping retries.', cause);
        // Ein Error signalisiert dem Client, dass keine weiteren Versuche geplant sind und liefert den Grund
        return new Error('Too many reconnection attempts');
      }

      // Linear/backoff delay (erste Versuche kurz, später länger, begrenzt auf 30s)
      const delay = Math.min(1000 * (retries + 1), 30_000);
      console.log(`🔄 Redis: Reconnecting in ${delay}ms (attempt ${retries + 1})`);
      return delay;
    }
  }
});

// Event Listener für Fehler
redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

// Event Listener für erfolgreiche Verbindung
redisClient.on('connect', () => {
  console.log('🔄 Redis: Connecting...');
});

redisClient.on('ready', () => {
  console.log('✅ Redis: Connected and ready');
});

// Event Listener für Verbindungstrennung
redisClient.on('end', () => {
  console.log('🔌 Redis: Connection closed');
});

/**
 * Initialisiert die Redis-Verbindung
 * Muss beim Server-Start aufgerufen werden
 */
export async function connectRedis(): Promise<void> {
  try {
    // Prüfe ob bereits verbunden
    if (redisClient.isOpen) {
      console.log('⚠️ Redis: Already connected');
      return;
    }
    
    // Verbinde zu Redis (async!)
    await redisClient.connect();
    console.log('✅ Redis connection established successfully');
  } catch (error) {
    console.error('❌ Failed to connect to Redis:', error);
    console.warn('⚠️ App will continue without Redis (Cache & Rate Limiting disabled)');
    // WICHTIG: App läuft weiter, auch wenn Redis nicht verfügbar
    // So kann Development ohne Redis funktionieren
  }
}

/**
 * Schließt die Redis-Verbindung sauber
 * Wird beim Server-Shutdown aufgerufen
 */
export async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.quit();
    console.log('✅ Redis connection closed gracefully');
  } catch (error) {
    console.error('❌ Error closing Redis connection:', error);
  }
}

/**
 * Prüft ob Redis verfügbar und verbunden ist
 * Nützlich für Health Checks und vor Redis-Operationen
 */
export function isRedisConnected(): boolean {
  try {
    // Prüfe ob Client existiert und verbunden ist
    return redisClient.isOpen;
  } catch (error) {
    return false;
  }
}

/**
 * Helper-Funktionen für häufige Redis-Operationen
 */

/**
 * Speichert einen Wert mit automatischem Ablauf (TTL = Time To Live)
 * @param key - Redis Key (z.B. "user:123")
 * @param value - Wert als String
 * @param ttlSeconds - Ablaufzeit in Sekunden
 */
export async function setWithExpiry(
  key: string, 
  value: string, 
  ttlSeconds: number
): Promise<void> {
  try {
    // SETEX = SET with EXpiry
    await redisClient.setEx(key, ttlSeconds, value);
  } catch (error) {
    console.error(`Redis SETEX error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Holt einen Wert aus Redis
 * @param key - Redis Key
 * @returns Wert oder null wenn nicht gefunden
 */
export async function get(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

/**
 * Löscht einen Key aus Redis
 * @param key - Redis Key
 */
export async function del(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error(`Redis DEL error for key ${key}:`, error);
  }
}

/**
 * Inkrementiert einen Counter
 * Wird für Rate Limiting verwendet
 * @param key - Redis Key
 * @returns Neuer Wert nach Inkrement
 */
export async function increment(key: string): Promise<number> {
  try {
    // INCR = INCRement (erhöht um 1)
    return await redisClient.incr(key);
  } catch (error) {
    console.error(`Redis INCR error for key ${key}:`, error);
    throw error;
  }
}

/**
 * Setzt Ablaufzeit für einen existierenden Key
 * @param key - Redis Key
 * @param ttlSeconds - Ablaufzeit in Sekunden
 */
export async function expire(key: string, ttlSeconds: number): Promise<void> {
  try {
    await redisClient.expire(key, ttlSeconds);
  } catch (error) {
    console.error(`Redis EXPIRE error for key ${key}:`, error);
  }
}
