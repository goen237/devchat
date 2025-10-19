import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import messageRoutes from "./routes/message.routes";
import profileRoutes from "./routes/profile.routes";
import chatroomRoutes from "./routes/chatroom.routes";
import userRoutes from "./routes/user.routes";
import avatarRoutes from "./routes/avatar.routes";


const app = express();
app.use(express.json());


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true
}));

// Static file serving for uploads
import path from "path";
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/avatars", express.static(path.join(__dirname, "..", "public", "avatars")));

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chatrooms", chatroomRoutes);
app.use("/api/users", userRoutes);
app.use("/api/avatars", avatarRoutes);

export default app;
