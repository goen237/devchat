// Unit tests for src/services/message.service.ts

jest.mock('../../src/config/data-source', () => ({ getDataSource: jest.fn() }));
jest.mock('../../src/validators/message.validator', () => ({
  validateMessageContent: jest.fn(),
  validateFile: jest.fn(),
  validateChatRoomId: jest.fn()
}));

import { createMessage, getMessagesByRoom, createFileMessage, deleteMessage } from '../../src/services/message.service';
import { getDataSource } from '../../src/config/data-source';
import * as validators from '../../src/validators/message.validator';

describe('message.service', () => {
  let messageRepo: any;
  let userRepo: any;
  let chatRoomRepo: any;

  beforeEach(() => {
    jest.clearAllMocks();

    messageRepo = {
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn()
    };
    userRepo = { findOneBy: jest.fn() };
    chatRoomRepo = { findOneBy: jest.fn(), findOne: jest.fn() };

    (getDataSource as jest.Mock).mockReturnValue({
      getRepository: (entity: any) => {
        const name = entity && (entity.name || entity);
        if (name && name.toString().includes('Message')) return messageRepo;
        if (name && name.toString().includes('User')) return userRepo;
        return chatRoomRepo;
      }
    });
  });

  test('createMessage validates and saves message', async () => {
    (validators.validateMessageContent as jest.Mock).mockReturnValue(null);
    (validators.validateChatRoomId as jest.Mock).mockReturnValue(null);

    // validateUserMembership: chatRoomRepo.findOne with participants
    chatRoomRepo.findOne.mockResolvedValue({ id: 'room1', participants: [{ id: 'u1' }] });

    userRepo.findOneBy.mockResolvedValue({ id: 'u1', username: 'Alice', avatarUrl: null });
    chatRoomRepo.findOneBy.mockResolvedValue({ id: 'room1' });

    // simulate save assigning id and createdAt
    messageRepo.create.mockReturnValue({ content: 'hi' });
    messageRepo.save.mockImplementation(async (m: any) => ({ ...m, id: 'm1', createdAt: new Date() }));

    const res = await createMessage({ content: 'hi', senderId: 'u1', chatRoomId: 'room1' });
    expect(res.id).toBe('m1');
    expect(res.sender.username).toBe('Alice');
  });

  test('getMessagesByRoom returns mapped messages', async () => {
    // validateUserMembership via chatRoomRepo
    chatRoomRepo.findOne.mockResolvedValue({ id: 'room1', participants: [{ id: 'u1' }] });

    // mock query builder
    const qb: any = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([
        { id: 'm1', content: 'c', createdAt: new Date(), sender: { id: 'u1', username: 'A', avatarUrl: null } }
      ])
    };
    (messageRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

    const res = await getMessagesByRoom('room1', 'u1', 10);
    expect(res).toHaveLength(1);
    expect(res[0].sender.id).toBe('u1');
  });

  test('createFileMessage validates file and saves', async () => {
    (validators.validateFile as jest.Mock).mockReturnValue(null);
    (validators.validateChatRoomId as jest.Mock).mockReturnValue(null);
    chatRoomRepo.findOne.mockResolvedValue({ id: 'room1', participants: [{ id: 'u1' }] });
    userRepo.findOneBy.mockResolvedValue({ id: 'u1', username: 'Alice', avatarUrl: null });
    chatRoomRepo.findOneBy.mockResolvedValue({ id: 'room1' });

    const file = { filename: 'f.txt', originalname: 'f.txt', mimetype: 'text/plain' } as any;
    messageRepo.create.mockReturnValue({});
    messageRepo.save.mockImplementation(async (m: any) => ({ ...m, id: 'mf1', createdAt: new Date(), fileUrl: '/uploads/f.txt', fileType: 'text/plain' }));

    const res = await createFileMessage({ senderId: 'u1', chatRoomId: 'room1', file });
    expect(res.fileUrl).toBe('/uploads/f.txt');
    expect(res.fileType).toBe('text/plain');
  });

  test('deleteMessage deletes if sender matches', async () => {
    messageRepo.findOne.mockResolvedValue({ id: 'm1', sender: { id: 'u1' } });
    messageRepo.remove.mockResolvedValue(undefined);

    await deleteMessage('u1', 'm1');
    expect(messageRepo.remove).toHaveBeenCalled();
  });

  test('deleteMessage throws if not found', async () => {
    messageRepo.findOne.mockResolvedValue(null);
    await expect(deleteMessage('u1', 'mX')).rejects.toThrow('Nachricht nicht gefunden');
  });

  test('deleteMessage throws if not sender', async () => {
    messageRepo.findOne.mockResolvedValue({ id: 'm1', sender: { id: 'u2' } });
    await expect(deleteMessage('u1', 'm1')).rejects.toThrow('Nur der Absender kann die Nachricht löschen');
  });
});
