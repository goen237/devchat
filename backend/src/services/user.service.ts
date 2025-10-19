import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";

export async function getAllUsersService() {
  return await AppDataSource.getRepository(User).find();
}

// Weitere User-Service-Methoden folgen ...
