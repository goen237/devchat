import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User, ChatRoom, Message } from '../../src/entities';

export async function initializeTestDataSource() {
  // Create an in-memory SQLite datasource for fast integration tests
  const testDataSource = new DataSource({
    type: 'sqlite',
    database: ':memory:',
    synchronize: true,
    logging: false,
    entities: [User, ChatRoom, Message]
  });

  // Assign to global so getDataSource() picks it up during tests
  (global as any).__TEST_DATASOURCE__ = testDataSource;

  if (!testDataSource.isInitialized) {
    await testDataSource.initialize();
    // Optionally seed minimal data here
  }

  return testDataSource;
}

export async function destroyTestDataSource() {
  const ds = (global as any).__TEST_DATASOURCE__ as DataSource | undefined;
  if (ds && ds.isInitialized) {
    await ds.destroy();
    (global as any).__TEST_DATASOURCE__ = undefined;
  }
}
