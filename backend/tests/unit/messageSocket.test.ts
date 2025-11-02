// Tests for setupMessageSocket
jest.resetModules();

describe('messageSocket', () => {
  test('emits messageReceived on successful createMessage', async () => {
    // Mock createMessage before importing
    jest.doMock('../../src/services/message.service', () => ({
      createMessage: jest.fn(async (msg: any) => ({
        id: 'm1',
        content: msg.content,
        fileUrl: null,
        fileType: null,
        createdAt: new Date().toISOString(),
        sender: { id: msg.senderId, username: 'alice' }
      }))
    }));

    const { setupMessageSocket } = await import('../../src/sockets/messageSocket');

    const registered: any = {};
    const socket: any = {
      user: { id: 'u1', username: 'alice' },
      on: (event: string, handler: any) => { registered[event] = handler; },
      emit: jest.fn()
    };

    const emitMock = jest.fn();
    const io: any = { to: () => ({ emit: emitMock }) };

    setupMessageSocket(io, socket);

    // Call the handler as if a client emitted 'sendMessage'
    await registered['sendMessage']({ content: 'hello', chatroomId: 'r1' });

    expect(emitMock).toHaveBeenCalledWith('messageReceived', expect.objectContaining({ content: 'hello' }));
  });

  test('sends error event when createMessage throws', async () => {
    jest.resetModules();
    jest.doMock('../../src/services/message.service', () => ({
      createMessage: jest.fn(async () => { throw new Error('db down'); })
    }));

    const { setupMessageSocket } = await import('../../src/sockets/messageSocket');

    const registered: any = {};
    const socket: any = {
      user: { id: 'u2', username: 'bob' },
      on: (event: string, handler: any) => { registered[event] = handler; },
      emit: jest.fn()
    };

    const io: any = { to: () => ({ emit: jest.fn() }) };

    setupMessageSocket(io, socket);

    await registered['sendMessage']({ content: 'fail', chatroomId: 'r2' });

    expect(socket.emit).toHaveBeenCalledWith('error', expect.objectContaining({ type: 'MESSAGE_ERROR' }));
  });
});
