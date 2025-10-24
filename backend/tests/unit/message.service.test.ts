/**
 * Unit Tests: Message Service
 * Testet Nachrichten-Erstellung, Abrufen und Löschen
 */

import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser,
  createTestChatRoom,
  createTestMessage
} from '../setup';
import {
  createMessage,
  getMessagesByRoom,
  deleteMessage
} from '../../src/services/message.service';

describe('Message Service - Unit Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('createMessage()', () => {
    it('should create a message successfully', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const message = await createMessage({
        content: 'Hello World',
        senderId: user.id,
        chatRoomId: chatRoom.id
      });

      expect(message).toBeDefined();
      expect(message.id).toBeDefined();
      expect(message.content).toBe('Hello World');
      expect(message.sender.id).toBe(user.id);
      expect(message.sender.username).toBe(user.username);
    });

    it('should trim message content', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const message = await createMessage({
        content: '  Hello World  ',
        senderId: user.id,
        chatRoomId: chatRoom.id
      });

      expect(message.content).toBe('Hello World');
    });

    it('should throw error if content is empty', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      await expect(
        createMessage({
          content: '',
          senderId: user.id,
          chatRoomId: chatRoom.id
        })
      ).rejects.toThrow();
    });

    it('should throw error if content is too long', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const longContent = 'a'.repeat(5001); // > 5000 chars

      await expect(
        createMessage({
          content: longContent,
          senderId: user.id,
          chatRoomId: chatRoom.id
        })
      ).rejects.toThrow();
    });

    it('should throw error if user is not a participant', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1]); // Nur user1

      await expect(
        createMessage({
          content: 'Hello',
          senderId: user2.id, // user2 ist nicht im ChatRoom
          chatRoomId: chatRoom.id
        })
      ).rejects.toThrow('Zugriff verweigert');
    });

    it('should throw error if chatroom not found', async () => {
      const user = await createTestUser();

      await expect(
        createMessage({
          content: 'Hello',
          senderId: user.id,
          chatRoomId: 'nonexistent-id'
        })
      ).rejects.toThrow();
    });

    it('should throw error if sender not found', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      await expect(
        createMessage({
          content: 'Hello',
          senderId: 'nonexistent-id',
          chatRoomId: chatRoom.id
        })
      ).rejects.toThrow();
    });
  });

  describe('getMessagesByRoom()', () => {
    it('should return messages for a chatroom', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      
      await createTestMessage(user, chatRoom, 'Message 1');
      await createTestMessage(user, chatRoom, 'Message 2');

      const messages = await getMessagesByRoom(chatRoom.id, user.id);

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('Message 1');
      expect(messages[1].content).toBe('Message 2');
    });

    it('should return messages in chronological order', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      
      const msg1 = await createTestMessage(user, chatRoom, 'First');
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay
      const msg2 = await createTestMessage(user, chatRoom, 'Second');

      const messages = await getMessagesByRoom(chatRoom.id, user.id);

      expect(messages[0].id).toBe(msg1.id);
      expect(messages[1].id).toBe(msg2.id);
    });

    it('should return empty array if no messages', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      const messages = await getMessagesByRoom(chatRoom.id, user.id);

      expect(messages).toEqual([]);
    });

    it('should limit messages to specified limit', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      
      // Erstelle 60 Nachrichten
      for (let i = 0; i < 60; i++) {
        await createTestMessage(user, chatRoom, `Message ${i}`);
      }

      const messages = await getMessagesByRoom(chatRoom.id, user.id, 10);

      expect(messages.length).toBeLessThanOrEqual(10);
    });

    it('should enforce maximum limit of 100', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      
      for (let i = 0; i < 120; i++) {
        await createTestMessage(user, chatRoom, `Message ${i}`);
      }

      const messages = await getMessagesByRoom(chatRoom.id, user.id, 150);

      expect(messages.length).toBeLessThanOrEqual(100);
    });

    it('should throw error if user is not a participant', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1]);

      await expect(
        getMessagesByRoom(chatRoom.id, user2.id)
      ).rejects.toThrow('Zugriff verweigert');
    });

    it('should include sender information', async () => {
      const user = await createTestUser({ username: 'alice' });
      const chatRoom = await createTestChatRoom([user]);
      await createTestMessage(user, chatRoom);

      const messages = await getMessagesByRoom(chatRoom.id, user.id);

      expect(messages[0].sender).toBeDefined();
      expect(messages[0].sender.id).toBe(user.id);
      expect(messages[0].sender.username).toBe('alice');
      expect(messages[0].sender.avatarUrl).toBeDefined();
    });
  });

  describe('deleteMessage()', () => {
    it('should delete a message successfully', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);
      const message = await createTestMessage(user, chatRoom);

      await deleteMessage(user.id, message.id);

      const messages = await getMessagesByRoom(chatRoom.id, user.id);
      expect(messages).toHaveLength(0);
    });

    it('should throw error if message not found', async () => {
      const user = await createTestUser();

      await expect(
        deleteMessage(user.id, 'nonexistent-id')
      ).rejects.toThrow('Nachricht nicht gefunden');
    });

    it('should throw error if user is not the sender', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const chatRoom = await createTestChatRoom([user1, user2]);
      const message = await createTestMessage(user1, chatRoom);

      await expect(
        deleteMessage(user2.id, message.id)
      ).rejects.toThrow('Nur der Absender kann die Nachricht löschen');
    });
  });
});
