/**
 * ChatRoom Service Test - Participants Loading
 * 
 * Testet ob die participants korrekt geladen werden
 */

import { AppDataSource } from '../config/data-source';
import { getUserChatRoomsService } from '../services/chatroom.service';

async function testChatRoomParticipants() {
    console.log('🧪 Teste ChatRoom Participants Loading...\n');
    
    try {
        // Datenbank-Verbindung initialisieren
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Datenbank verbunden');
        }
        
        // Test mit einer beliebigen User ID aus der Datenbank
        const userRepo = AppDataSource.getRepository('User');
        const users = await userRepo.find({ take: 1 });
        
        if (users.length === 0) {
            console.log('❌ Keine User in der Datenbank gefunden');
            return;
        }
        
        const testUserId = users[0].id;
        console.log(`🔍 Teste mit User ID: ${testUserId} (${users[0].username})`);
        
        // ChatRooms laden
        const chatRooms = await getUserChatRoomsService(testUserId);
        
        console.log(`\n📋 Gefundene ChatRooms: ${chatRooms.length}`);
        
        chatRooms.forEach((room, index) => {
            console.log(`\n--- ChatRoom ${index + 1} ---`);
            console.log(`ID: ${room.id}`);
            console.log(`Name: ${room.name}`);
            console.log(`Type: ${room.type}`);
            console.log(`Participants Count: ${room.participants?.length || 0}`);
            
            if (room.participants && room.participants.length > 0) {
                console.log('Participants:');
                room.participants.forEach(p => {
                    console.log(`  - ${p.username} (${p.id}) ${p.avatarUrl ? '📷' : '👤'}`);
                });
            } else {
                console.log('⚠️  Keine Participants gefunden!');
            }
        });
        
        console.log('\n✅ ChatRoom Participants Test abgeschlossen!');
        
    } catch (error) {
        console.error('❌ ChatRoom Participants Test fehlgeschlagen:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Datenbank-Verbindung geschlossen');
        }
    }
}

// Test ausführen
if (require.main === module) {
    testChatRoomParticipants();
}

export { testChatRoomParticipants };