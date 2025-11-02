import { getDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { cacheWrapper } from "../utils/cache";

/**
 * Holt alle User
 * MIT CACHING: User-Liste ändert sich bei jedem Login/Register
 * Kurze TTL von 60 Sekunden
 */
export async function getAllUsersService() {
  return await cacheWrapper(
    'users:all',
    async () => {
      return await getDataSource().getRepository(User).find();
    },
    60 // 60 Sekunden Cache (User-Liste kann sich ändern)
  );
}

// Weitere User-Service-Methoden folgen ...
