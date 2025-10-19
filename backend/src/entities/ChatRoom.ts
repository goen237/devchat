import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";

@Entity()
export class ChatRoom {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	name: string;

	@Column({ default: "private" })
	type: "private" | "group";

	@ManyToMany(() => User)
	@JoinTable()
	creator: User[];

	@CreateDateColumn()
	createdAt: Date;

	@OneToMany(() => Message, (message) => message.room)
	messages: Message[];

	@ManyToMany(() => User, user => user.chatRooms)
	@JoinTable()
	participants: User[];
}
