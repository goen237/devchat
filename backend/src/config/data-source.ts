import "reflect-metadata";
import { DataSource } from "typeorm";
import { User, ChatRoom, Message } from "../entities";
import dotenv from "dotenv";

dotenv.config();

// Production/Development DataSource
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // nur in Entwicklung!
  logging: false,
  entities: [User, ChatRoom, Message],
  migrations: [],
  subscribers: [],
});

/**
 * Hilfsfunktion für Tests
 * Gibt die richtige DataSource zurück (Test oder Production)
 */
export function getDataSource(): DataSource {
  // In Tests: Nutze globale Test-DataSource
  if (process.env.NODE_ENV === 'test') {
    const testDataSource = (global as any).__TEST_DATASOURCE__;
    if (testDataSource) {
      console.log('✅ Using Test DataSource with', testDataSource.entityMetadatas.length, 'entities');
      console.log('📋 Entity names:', testDataSource.entityMetadatas.map((m: any) => m.name));
      return testDataSource;
    } else {
      console.warn('⚠️ NODE_ENV=test but no Test DataSource found!');
    }
  }
  
  // In Production/Dev: Nutze AppDataSource
  return AppDataSource;
}
