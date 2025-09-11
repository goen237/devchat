import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
// import { Message } from "./Message";

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

  @Column({ nullable: true, unique: true })
  googleId: string;

  @Column({ default: false })
  isGoogleUser: boolean;

  @Column({ default: false })
  isOnline: boolean;

//   @OneToMany(() => Message, (message) => message.sender)
//   sentMessages: Message[];
}
