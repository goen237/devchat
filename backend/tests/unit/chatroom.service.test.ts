/**
 * Unit Tests: ChatRoom Service
 * Testet ChatRoom-Erstellung, Abrufen und Löschen
 */

import { 
  initializeTestDatabase, 
  closeTestDatabase, 
  cleanDatabase,
  createTestUser,
  createTestChatRoom
} from '../setup';
import {
  getUserChatRoomsService,
  createGroupChatService,
  startPrivateChatService,
  deleteChatRoomService
} from '../../src/services/chatroom.service';

describe('ChatRoom Service - Unit Tests', () => {
  beforeAll(async () => {
    await initializeTestDatabase();
  });

  afterAll(async () => {
    await closeTestDatabase();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('getUserChatRoomsService()', () => {
    it('should return empty array if user has no chatrooms', async () => {
      const user = await createTestUser();
      const chatRooms = await getUserChatRoomsService(user.id);
      
      expect(chatRooms).toBeDefined();
      expect(chatRooms).toEqual([]);
    });

    it('should return user chatrooms with participants', async () => {
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      
      await createTestChatRoom([user1, user2], {
        name: 'Test Chat',
        type: 'group'
      });

      const chatRooms = await getUserChatRoomsService(user1.id);

      expect(chatRooms).toHaveLength(1);
      expect(chatRooms[0].name).toBe('Test Chat');
      expect(chatRooms[0].type).toBe('group');
      expect(chatRooms[0].participants).toHaveLength(2);
      expect(chatRooms[0].participants[0].username).toBeDefined();
    });

    it('should return multiple chatrooms', async () => {
      const user = await createTestUser();
      const user2 = await createTestUser();
      const user3 = await createTestUser();

      await createTestChatRoom([user, user2], { name: 'Chat 1' });
      await createTestChatRoom([user, user3], { name: 'Chat 2' });

      const chatRooms = await getUserChatRoomsService(user.id);

      expect(chatRooms).toHaveLength(2);
    });

    it('should include all participant details', async () => {
      const user1 = await createTestUser({ 
        username: 'alice',
        email: 'alice@test.com'
      });
      const user2 = await createTestUser({ 
        username: 'bob',
        email: 'bob@test.com'
      });

      await createTestChatRoom([user1, user2]);

      const chatRooms = await getUserChatRoomsService(user1.id);
      const participants = chatRooms[0].participants;

      expect(participants).toHaveLength(2);
      expect(participants[0]).toHaveProperty('id');
      expect(participants[0]).toHaveProperty('username');
      expect(participants[0]).toHaveProperty('email');
      expect(participants[0]).toHaveProperty('avatarUrl');
      expect(participants[0]).toHaveProperty('isOnline');
    });
  });

  describe('createGroupChatService()', () => {
    it('should create a group chat with multiple participants', async () => {
      const creator = await createTestUser({ username: 'creator' });
      const user2 = await createTestUser({ username: 'user2' });
      const user3 = await createTestUser({ username: 'user3' });

      const groupChat = await createGroupChatService(
        creator.id,
        'Study Group',
        [user2.id, user3.id]
      );

      expect(groupChat).toBeDefined();
      expect(groupChat.name).toBe('Study Group');
      expect(groupChat.type).toBe('group');
      expect(groupChat.participants).toHaveLength(3); // Creator + 2 participants
    });

    it('should include creator as participant', async () => {
      const creator = await createTestUser({ username: 'creator' });
      const user2 = await createTestUser();

      const groupChat = await createGroupChatService(
        creator.id,
        'Team Chat',
        [user2.id]
      );

      const participantIds = groupChat.participants.map(p => p.id);
      expect(participantIds).toContain(creator.id);
    });

    it('should throw error if creator not found', async () => {
      const user = await createTestUser();

      await expect(
        createGroupChatService('nonexistent-id', 'Chat', [user.id])
      ).rejects.toThrow('Teilnehmer nicht gefunden');
    });

    it('should throw error if participants not found', async () => {
      const creator = await createTestUser();

      await expect(
        createGroupChatService(creator.id, 'Chat', ['nonexistent-id'])
      ).rejects.toThrow('Teilnehmer nicht gefunden');
    });
  });

  describe('startPrivateChatService()', () => {
    it('should create a private chat between two users', async () => {
      const user1 = await createTestUser({ username: 'alice' });
      const user2 = await createTestUser({ username: 'bob' });

      const privateChat = await startPrivateChatService(user1.id, user2.id);

      expect(privateChat).toBeDefined();
      expect(privateChat.type).toBe('private');
      expect(privateChat.participants).toHaveLength(2);
      expect(privateChat.name).toContain('alice');
      expect(privateChat.name).toContain('bob');
    });

    it('should return existing private chat if already exists', async () => {
      const user1 = await createTestUser({ username: 'alice' });
      const user2 = await createTestUser({ username: 'bob' });

      const chat1 = await startPrivateChatService(user1.id, user2.id);
      const chat2 = await startPrivateChatService(user1.id, user2.id);

      expect(chat1.id).toBe(chat2.id); // Gleiche Chat-ID
    });

    it('should work regardless of user order', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();

      const chat1 = await startPrivateChatService(user1.id, user2.id);
      const chat2 = await startPrivateChatService(user2.id, user1.id);

      expect(chat1.id).toBe(chat2.id);
    });

    it('should throw error if user not found', async () => {
      const user = await createTestUser();

      await expect(
        startPrivateChatService(user.id, 'nonexistent-id')
      ).rejects.toThrow('User nicht gefunden');
    });
  });

  describe('deleteChatRoomService()', () => {
    it('should delete a chatroom', async () => {
      const user = await createTestUser();
      const chatRoom = await createTestChatRoom([user]);

      await deleteChatRoomService(user.id, chatRoom.id);

      const chatRooms = await getUserChatRoomsService(user.id);
      expect(chatRooms).toHaveLength(0);
    });

    it('should throw error if chatroom not found', async () => {
      const user = await createTestUser();

      await expect(
        deleteChatRoomService(user.id, 'nonexistent-id')
      ).rejects.toThrow('ChatRoom nicht gefunden');
    });
  });
});
