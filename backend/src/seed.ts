import { getDataSource } from "./config/data-source";
import { User } from "./entities/User";
import { ChatRoom } from "./entities/ChatRoom";
import { Message } from "./entities/Message";
import bcrypt from "bcrypt";

async function seed() {
  await getDataSource().initialize();

  // User anlegen
  const user1 = new User();
  user1.username = "alice";
  user1.email = "alice@example.com";
  user1.passwordHash = await bcrypt.hash("password1", 10);
  user1.semester = 1;

  const user2 = new User();
  user2.username = "bob";
  user2.email = "bob@example.com";
  user2.passwordHash = await bcrypt.hash("password2", 10);
  user2.semester = 2;

  await getDataSource().manager.save([user1, user2]);

  // ChatRoom anlegen
  const chatRoom = new ChatRoom();
  chatRoom.name = "Test-Chat";
  chatRoom.participants = [user1, user2];
  await getDataSource().manager.save(chatRoom);

  // Nachrichten anlegen
  const msg1 = new Message();
  msg1.content = "Hallo Bob!";
  msg1.sender = user1;
  msg1.chatRoom = chatRoom;

  const msg2 = new Message();
  msg2.content = "Hi Alice!";
  msg2.sender = user2;
  msg2.chatRoom = chatRoom;

  await getDataSource().manager.save([msg1, msg2]);

  console.log("Seed-Daten erfolgreich erstellt!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Fehler beim Seeding:", err);
  process.exit(1);
});
