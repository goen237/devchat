
import { getDataSource } from "./config/data-source";
import { connectRedis, disconnectRedis } from "./config/redis";
import app from "./app";
import http from "http";
import { initializeSocket } from "./sockets";

const server = http.createServer(app);

(async () => {
  try {
    // 1. Datenbank verbinden
    await getDataSource().initialize();
    console.log("✅ Database connected successfully");
    
    // 2. Redis verbinden
    // Redis ist optional - App läuft auch ohne
    try {
      await connectRedis();
      console.log("✅ Redis connected successfully");
    } catch (err) {
      console.warn("⚠️ Redis connection failed - Running without cache");
      console.warn("   Rate limiting and token blacklist disabled");
    }
    
    // 3. Socket.io initialisieren
    initializeSocket(server);
    
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
      console.log(`💾 Database: Connected`);
      console.log(`🔴 Redis: ${process.env.REDIS_URL ? 'Connected' : 'Disabled'}\n`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⚠️ SIGTERM received, shutting down gracefully...');
  
  // 1. Stoppe Server (keine neuen Requests)
  server.close(() => {
    console.log('✅ Server closed');
  });
  
  // 2. Schließe Redis-Verbindung
  await disconnectRedis();
  
  console.log('👋 Process terminated\n');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⚠️ SIGINT received, shutting down gracefully...');
  
  // 1. Stoppe Server
  server.close(() => {
    console.log('✅ Server closed');
  });
  
  // 2. Schließe Redis-Verbindung
  await disconnectRedis();
  
  console.log('👋 Process terminated\n');
  process.exit(0);
});

