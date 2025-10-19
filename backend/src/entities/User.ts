import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Message } from "./Message";
import { ChatRoom } from "./ChatRoom";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ type: "int", nullable: true })
  semester: number;

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ default: false })
  isGoogleUser: boolean;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  isOnline: boolean;

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @ManyToMany(() => ChatRoom, chatRoom => chatRoom.participants)
  chatRooms: ChatRoom[];
}
