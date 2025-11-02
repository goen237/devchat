import { getDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { AuthenticatedSocket, UserOnlineData, UserOfflineData, SocketServer } from './types';

/**
 * 👤 USER SOCKET
 * Verwaltet User online/offline Status
 */

export function setupUserSocket(io: SocketServer, socket: AuthenticatedSocket) {
  const user = socket.user;
  
  console.log(`--> User ${user.username} connected`);

  // User online setzen
  setUserOnline(user.id, socket);

  // User offline setzen bei Disconnect
  socket.on('disconnect', () => {
    console.log(`--> User ${user.username} disconnected`);
    setUserOffline(user.id, io);
  });
}

async function setUserOnline(userId: string, socket: AuthenticatedSocket) {
  try {
    const userRepo = getDataSource().getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    
    if (!user) return;

    user.isOnline = true;
    await userRepo.save(user);

    const data: UserOnlineData = {
      userId: user.id,
      username: user.username
    };
    
    socket.broadcast.emit('userOnline', data);
    console.log(`✅ ${user.username} is online`);
    
  } catch (error) {
    console.error('--> Error setting user online:', error);
  }
}

async function setUserOffline(userId: string, io: SocketServer) {
  try {
    const userRepo = getDataSource().getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });
    
    if (!user) return;

    user.isOnline = false;
    await userRepo.save(user);

    const data: UserOfflineData = {
      userId: user.id,
      username: user.username
    };
    
    io.emit('userOffline', data);
    console.log(`--> ${user.username} is offline`);
    
  } catch (error) {
    console.error('--> Error setting user offline:', error);
  }
}
