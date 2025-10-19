import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Message } from "../entities/Message";
import { ChatRoom } from "../entities/ChatRoom";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true, // nur in Entwicklung!
  logging: false,
  entities: [User, ChatRoom, Message],
  migrations: [],
  subscribers: [],
});
