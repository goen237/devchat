
import { AppDataSource } from "./config/data-source";
import app from "./app";
import http from "http";
import { initializeSocket } from "./sockets";

const server = http.createServer(app);

(async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully ✅");
    
    // Socket.io initialisieren
    initializeSocket(server);
    
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
      console.log(`--> Server + Socket.io running on http://localhost:${PORT}`);
      console.log(`--> Socket.io ready for connections`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
