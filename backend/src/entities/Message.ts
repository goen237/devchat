import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { ChatRoom } from "./ChatRoom";

@Entity()
export class Message {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	content: string;

	@Column({ nullable: true })
	fileUrl?: string;

	@Column({ nullable: true })
	fileType?: string;

	@ManyToOne(() => User, (user) => user.sentMessages)
	sender: User;

	@ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, {
		onDelete: "CASCADE"
	})
	chatRoom: ChatRoom;

	@CreateDateColumn()
	createdAt: Date;
}
