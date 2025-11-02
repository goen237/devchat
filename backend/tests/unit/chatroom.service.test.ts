// Unit tests for src/services/chatroom.service.ts

jest.mock('../../src/config/data-source', () => ({
  getDataSource: jest.fn()
}));

jest.mock('../../src/utils/cache', () => ({
  cacheWrapper: jest.fn(),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn()
}));

import { getUserChatRoomsService, createGroupChatService, deleteChatRoomService, startPrivateChatService } from '../../src/services/chatroom.service';
import { getDataSource } from '../../src/config/data-source';
import { cacheWrapper, deleteCache } from '../../src/utils/cache';
import { ChatRoom } from '../../src/entities/ChatRoom';
import { User } from '../../src/entities/User';

describe('chatroom.service', () => {
  let chatRoomRepo: any;
  let userRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    chatRoomRepo = {
      createQueryBuilder: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findByIds: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn()
    };

    userRepo = {
      findOneBy: jest.fn(),
      findByIds: jest.fn()
    };

    // getRepository should return repo based on entity name
    (getDataSource as jest.Mock).mockReturnValue({
      getRepository: (entity: any) => {
        if (entity && (entity === ChatRoom || entity.name === 'ChatRoom')) return chatRoomRepo;
        return userRepo;
      }
    });
  });

  describe('getUserChatRoomsService', () => {
    test('returns mapped chatrooms when found', async () => {
      // Mock cacheWrapper to call fetchFunction (simulate cache miss)
      (cacheWrapper as jest.Mock).mockImplementation(async (_key: string, fetchFn: any) => fetchFn());

      // Simulate QueryBuilder returning ids
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 'r1' }])
      };
      chatRoomRepo.createQueryBuilder.mockReturnValue(qb);

      const roomFromDb = {
        id: 'r1',
        name: 'Room1',
        type: 'group',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        participants: [ { id: 'u1', username: 'alice', email: 'a@b', avatarUrl: null, isOnline: true } ]
      };

      chatRoomRepo.find.mockResolvedValue([roomFromDb]);

      const res = await getUserChatRoomsService('u1');
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe('r1');
      expect(res[0].participants[0].username).toBe('alice');
      expect(typeof res[0].createdAt).toBe('string');
    });
  });

  describe('createGroupChatService', () => {
    test('creates group chat and invalidates caches', async () => {
      const creator = { id: 'c1', username: 'creator', email: 'c@x', avatarUrl: null, isOnline: false };
      const participant = { id: 'p1', username: 'p', email: 'p@x' };

      userRepo.findOneBy.mockResolvedValue(creator);
      userRepo.findByIds.mockResolvedValue([participant]);

      const chatRoom = { id: 'new', name: 'grp', type: 'group', createdAt: new Date(), participants: [creator, participant] };
      chatRoomRepo.create.mockReturnValue(chatRoom);
      chatRoomRepo.save.mockResolvedValue(chatRoom);

      const res = await createGroupChatService('c1', 'grp', ['p1']);
      expect(chatRoomRepo.create).toHaveBeenCalled();
      expect(chatRoomRepo.save).toHaveBeenCalledWith(chatRoom);
      expect(deleteCache).toHaveBeenCalled();
      expect(res.id).toBe('new');
      expect(res.participants.length).toBe(2);
    });
  });

  describe('deleteChatRoomService', () => {
    test('removes chatroom and invalidates caches', async () => {
      const chatRoom = { id: 'rdel', participants: [ { id: 'u1' }, { id: 'u2' } ] };
      chatRoomRepo.findOne.mockResolvedValue(chatRoom);
      chatRoomRepo.remove.mockResolvedValue(undefined);

      await deleteChatRoomService('u1', 'rdel');
      expect(chatRoomRepo.remove).toHaveBeenCalledWith(chatRoom);
      expect(deleteCache).toHaveBeenCalled();
    });
  });

  describe('startPrivateChatService', () => {
    test('creates new private chat when none exists', async () => {
      const userA = { id: 'uA', username: 'A', email: 'a@x', avatarUrl: null, isOnline: false };
      const userB = { id: 'uB', username: 'B', email: 'b@x', avatarUrl: null, isOnline: false };

      userRepo.findOneBy.mockImplementation(({ id }: any) => {
        if (id === 'uA') return Promise.resolve(userA);
        if (id === 'uB') return Promise.resolve(userB);
        return Promise.resolve(null);
      });

      // No existing private chats
      chatRoomRepo.find.mockResolvedValue([]);

      // Make save mutate the passed object like TypeORM does (assign id)
      chatRoomRepo.save.mockImplementation(async (room: any) => {
        room.id = 'priv1';
        room.createdAt = new Date();
        return room;
      });

      const res = await startPrivateChatService('uA', 'uB');
      expect(res.type).toBe('private');
      expect(res.participants.length).toBe(2);
      expect(res.id).toBe('priv1');
    });

    test('returns existing private chat if present', async () => {
      const userA = { id: 'uA', username: 'A', email: 'a@x', avatarUrl: null, isOnline: false };
      const userB = { id: 'uB', username: 'B', email: 'b@x', avatarUrl: null, isOnline: false };

      userRepo.findOneBy.mockImplementation(({ id }: any) => {
        if (id === 'uA') return Promise.resolve(userA);
        if (id === 'uB') return Promise.resolve(userB);
        return Promise.resolve(null);
      });

      const existingRoom = { id: 'e1', name: 'A & B', type: 'private', createdAt: new Date(), participants: [userA, userB] };
      chatRoomRepo.find.mockResolvedValue([existingRoom]);

      const res = await startPrivateChatService('uA', 'uB');
      expect(res.id).toBe('e1');
    });
  });
});
