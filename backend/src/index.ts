
import { AppDataSource } from "./config/data-source";
import app from "./app";
import https from "http";
import { Server as SocketIOServer } from "socket.io";
import { createMessage } from "./services/message.service";
import { User } from "./entities/User";
const onlineUsers = new Map<string, string>(); // socketId -> userId


const server = https.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("userOnline", async (userId: string) => {
    onlineUsers.set(socket.id, userId);
    // Setze User in DB auf online
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: userId });
    if (user) {
      user.isOnline = true;
      await userRepo.save(user);
    }
    sendOnlineUsers();
  });

  socket.on("disconnect", async () => {
    const userId = onlineUsers.get(socket.id);
    onlineUsers.delete(socket.id);
    if (userId) {
      const userRepo = AppDataSource.getRepository(User);
      const user = await userRepo.findOneBy({ id: userId });
      if (user) {
        user.isOnline = false;
        await userRepo.save(user);
      }
    }
    sendOnlineUsers();
  });

  function sendOnlineUsers() {
    const userIds = Array.from(onlineUsers.values());
    io.emit("onlineUsers", userIds);
  }

  // ...existing chat events...
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", socket.id);
  });
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit("userLeft", socket.id);
  });
  socket.on("sendMessage", async (data) => {
    try {
      const message = await createMessage(data.content, data.senderId, data.roomId);
      io.to(data.roomId).emit("receiveMessage", message);
    } catch (err) {
      socket.emit("errorMessage", { error: (err as Error).message });
    }
  });
});

(async () => {
  try {
    await AppDataSource.initialize();
    console.log("DB connected ✅");
    server.listen(4000, () => {
      console.log("Server + Socket.io running on http://localhost:4000");
    });
  } catch (err) {
    console.error("DB connection failed ❌", err);
  }
})();
