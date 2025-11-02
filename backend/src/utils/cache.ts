/**
 * Caching Utility mit Redis
 * 
 * PROBLEM:
 * Datenbank-Queries sind langsam (10-100ms)
 * Wiederholte Queries für gleiche Daten verschwenden Ressourcen
 * 
 * LÖSUNG:
 * Speichere häufig verwendete Daten in Redis (< 1ms)
 * Erste Query = DB → Redis speichern → Return
 * Weitere Queries = Redis → Return (Cache Hit!)
 * 
 * WANN CACHING NUTZEN?
 * ✅ Daten ändern sich selten (User Profiles, Chatroom Info)
 * ✅ Häufig abgerufen (Online Users, Popular Chatrooms)
 * ❌ Echtzeit-kritisch (neue Messages - Socket.io besser)
 * ❌ User-spezifisch (Permissions - Security Risk)
 */

import { redisClient, isRedisConnected } from '../config/redis';

/**
 * Speichert Daten im Cache
 * @param key - Eindeutiger Cache-Key (z.B. "chatroom:123")
 * @param data - Daten zum Cachen (wird zu JSON)
 * @param ttlSeconds - Ablaufzeit in Sekunden (Standard: 5 Minuten)
 */
export async function setCache(
  key: string,
  data: any,
  ttlSeconds: number = 300 // 5 Minuten Default
): Promise<void> {
  try {
    // ⚠️ Prüfe ob Redis verbunden ist
    if (!isRedisConnected()) {
      console.log(`⚠️ Cache SET skipped (Redis not connected): ${key}`);
      return; // Fail silently - App funktioniert ohne Cache
    }
    
    // Konvertiere Objekt zu JSON-String
    const jsonData = JSON.stringify(data);
    
    // Speichere in Redis mit TTL
    await redisClient.setEx(key, ttlSeconds, jsonData);
    
    console.log(`✅ Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    console.error(`❌ Cache SET error for ${key}:`, error);
    // Fehler nicht weiterwerfen - Cache ist optional
  }
}

/**
 * Holt Daten aus dem Cache
 * @param key - Cache-Key
 * @returns Daten oder null wenn nicht gefunden
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    // ⚠️ Prüfe ob Redis verbunden ist
    if (!isRedisConnected()) {
      console.log(`⚠️ Cache GET skipped (Redis not connected): ${key}`);
      return null; // Cache Miss - App holt Daten aus DB
    }
    
    const data = await redisClient.get(key);
    
    if (data === null) {
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    }
    
    console.log(`✅ Cache HIT: ${key}`);
    
    // Parse JSON zurück zu Objekt
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`❌ Cache GET error for ${key}:`, error);
    return null;
  }
}

/**
 * Löscht Daten aus dem Cache
 * Wird aufgerufen wenn Daten aktualisiert wurden
 * @param key - Cache-Key
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    // ⚠️ Prüfe ob Redis verbunden ist
    if (!isRedisConnected()) {
      console.log(`⚠️ Cache DELETE skipped (Redis not connected): ${key}`);
      return;
    }
    
    await redisClient.del(key);
    console.log(`🗑️ Cache DELETE: ${key}`);
  } catch (error) {
    console.error(`❌ Cache DELETE error for ${key}:`, error);
  }
}

/**
 * Löscht mehrere Cache-Keys mit Pattern
 * Z.B. alle Chatroom-Caches: "chatroom:*"
 * @param pattern - Redis Pattern (z.B. "user:*")
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    // ⚠️ Prüfe ob Redis verbunden ist
    if (!isRedisConnected()) {
      console.log(`⚠️ Cache DELETE PATTERN skipped (Redis not connected): ${pattern}`);
      return;
    }
    
    // Finde alle Keys die zum Pattern passen
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      // Lösche alle gefundenen Keys
      await redisClient.del(keys);
      console.log(`🗑️ Cache DELETE PATTERN: ${pattern} (${keys.length} keys)`);
    }
  } catch (error) {
    console.error(`❌ Cache DELETE PATTERN error for ${pattern}:`, error);
  }
}

/**
 * Cache-Wrapper für Funktionen
 * Automatisches Caching mit Fallback zur Original-Funktion
 * 
 * @param key - Cache-Key
 * @param fetchFunction - Funktion die Daten holt (async)
 * @param ttlSeconds - Cache-Dauer
 * @returns Gecachte oder frische Daten
 * 
 * BEISPIEL:
 * const chatroom = await cacheWrapper(
 *   `chatroom:${id}`,
 *   () => chatroomRepository.findOne({ where: { id } }),
 *   300 // 5 Minuten
 * );
 */
export async function cacheWrapper<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // 1. Versuche aus Cache zu holen
  const cached = await getCache<T>(key);
  
  if (cached !== null) {
    return cached; // ✅ Cache Hit - Return sofort
  }
  
  // 2. Cache Miss - Hole Daten von Quelle (DB)
  const data = await fetchFunction();
  
  // 3. Speichere in Cache für nächstes Mal
  await setCache(key, data, ttlSeconds);
  
  return data;
}

/**
 * VERWENDUNG IN SERVICES:
 * 
 * // 1. EINFACHES CACHING
 * import { setCache, getCache, deleteCache } from '../utils/cache';
 * 
 * async getChatroom(id: string) {
 *   // Versuche aus Cache
 *   const cached = await getCache(`chatroom:${id}`);
 *   if (cached) return cached;
 *   
 *   // Cache Miss - hole aus DB
 *   const chatroom = await chatroomRepo.findOne({ where: { id } });
 *   
 *   // Speichere in Cache
 *   await setCache(`chatroom:${id}`, chatroom, 300); // 5 Min
 *   
 *   return chatroom;
 * }
 * 
 * // 2. MIT CACHE-WRAPPER (EINFACHER!)
 * import { cacheWrapper } from '../utils/cache';
 * 
 * async getChatroom(id: string) {
 *   return cacheWrapper(
 *     `chatroom:${id}`,
 *     () => chatroomRepo.findOne({ where: { id } }),
 *     300 // 5 Minuten
 *   );
 * }
 * 
 * // 3. CACHE INVALIDIERUNG (Nach Update/Delete)
 * async updateChatroom(id: string, data: any) {
 *   await chatroomRepo.update(id, data);
 *   await deleteCache(`chatroom:${id}`); // ❗ Cache ungültig machen
 * }
 * 
 * // 4. PATTERN DELETE (Alle User-Caches löschen)
 * async deleteUser(id: string) {
 *   await userRepo.delete(id);
 *   await deleteCachePattern(`user:${id}:*`); // Alle Caches dieses Users
 * }
 * 
 * CACHE-STRATEGIEN:
 * 
 * - Profile Daten: 10-30 Minuten (ändert sich selten)
 *   await setCache(`profile:${userId}`, profile, 1800);
 * 
 * - Chatroom Info: 5 Minuten (Name, Typ ändern sich selten)
 *   await setCache(`chatroom:${id}`, chatroom, 300);
 * 
 * - Online Users: 30 Sekunden (ändert sich oft)
 *   await setCache('online_users', users, 30);
 * 
 * - Top Chatrooms: 5 Minuten (Liste ändert sich langsam)
 *   await setCache('chatrooms:popular', rooms, 300);
 * 
 * WICHTIG:
 * - IMMER Cache löschen nach Updates!
 * - Nicht cachen: Passwörter, Tokens, persönliche Daten
 * - TTL kurz halten bei häufig ändernden Daten
 * - Cache-Keys konsistent benennen: "entity:id" oder "entity:id:property"
 */
