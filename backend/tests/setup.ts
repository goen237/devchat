/**
 * Test Setup & Utilities
 * Wird vor allen Tests ausgeführt
 */

import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/config/data-source';
import { User } from '../src/entities/User';
import { ChatRoom } from '../src/entities/ChatRoom';
import { Message } from '../src/entities/Message';
import { hashPassword } from '../src/utils/password';

let testDataSource: DataSource;

/**
 * Initialisiert die Test-Datenbank
 */
export async function initializeTestDatabase(): Promise<DataSource> {
  if (!testDataSource || !testDataSource.isInitialized) {
    // Test-Datenbank Konfiguration
    testDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME_TEST || 'devchat_test',
      entities: [User, ChatRoom, Message],
      synchronize: true, // Automatisches Schema-Update für Tests
      logging: false,
      dropSchema: true // Schema bei jedem Test neu erstellen
    });

    await testDataSource.initialize();
  }
  
  return testDataSource;
}

/**
 * Schließt die Test-Datenbank
 */
export async function closeTestDatabase(): Promise<void> {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
}

/**
 * Bereinigt alle Tabellen
 */
export async function cleanDatabase(): Promise<void> {
  const connection = testDataSource;
  const entities = connection.entityMetadatas;

  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
  }
}

/**
 * Erstellt einen Test-User
 */
export async function createTestUser(data?: Partial<User>): Promise<User> {
  const userRepo = testDataSource.getRepository(User);
  
  const defaultData = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    passwordHash: await hashPassword('TestPassword123!'),
    semester: 3,
    isGoogleUser: false,
    isOnline: false
  };

  const user = userRepo.create({ ...defaultData, ...data });
  return await userRepo.save(user);
}

/**
 * Erstellt einen Test-ChatRoom
 */
export async function createTestChatRoom(
  participants: User[], 
  data?: Partial<ChatRoom>
): Promise<ChatRoom> {
  const chatRoomRepo = testDataSource.getRepository(ChatRoom);
  
  const defaultData = {
    name: `Test ChatRoom ${Date.now()}`,
    type: 'group' as const,
    participants
  };

  const chatRoom = chatRoomRepo.create({ ...defaultData, ...data });
  return await chatRoomRepo.save(chatRoom);
}

/**
 * Erstellt eine Test-Nachricht
 */
export async function createTestMessage(
  sender: User,
  chatRoom: ChatRoom,
  content?: string
): Promise<Message> {
  const messageRepo = testDataSource.getRepository(Message);
  
  const message = messageRepo.create({
    content: content || `Test message ${Date.now()}`,
    sender,
    chatRoom
  });
  
  return await messageRepo.save(message);
}

/**
 * Gibt die Test-Datenquelle zurück
 */
export function getTestDataSource(): DataSource {
  return testDataSource;
}
