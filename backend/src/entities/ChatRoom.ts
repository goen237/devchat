import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Message } from "./Message";
import { User } from "./User";

@Entity("chat_room") // Explizite Tabellenbenennung für Konsistenz
export class ChatRoom {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	name: string;

	@Column({ default: "private" })
	type: "private" | "group";

	@CreateDateColumn()
	createdAt: Date;

	@OneToMany(() => Message, (message) => message.chatRoom, {
		cascade: true,
		onDelete: "CASCADE"
	})
	messages: Message[];

	@ManyToMany(() => User, user => user.chatRooms)
	@JoinTable({
		name: "chat_room_participants_user", // Expliziter Junction-Tabellenname
		joinColumn: {
			name: "chatRoomId",
			referencedColumnName: "id"
		},
		inverseJoinColumn: {
			name: "userId",
			referencedColumnName: "id"
		}
	})
	participants: User[];
}
