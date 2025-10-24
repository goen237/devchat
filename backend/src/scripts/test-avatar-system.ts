/**
 * Avatar-System Test Script
 * 
 * Testet:
 * - Avatar-Service Funktionalität
 * - URL-Generierung
 * - Datei-Verfügbarkeit
 */

import { AvatarService } from '../services/avatar.service';
import { AppDataSource } from '../config/data-source';

async function testAvatarSystem() {
    console.log('🧪 Teste Avatar-System...\n');
    
    try {
        // Datenbank-Verbindung initialisieren
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Datenbank verbunden');
        }
        
        const avatarService = new AvatarService();
        
        // 1. Verfügbare Avatare abrufen
        console.log('\n📁 Teste getAvailableAvatars():');
        const avatars = await avatarService.getAvailableAvatars();
        console.log(`Found ${avatars.length} avatars:`);
        
        avatars.slice(0, 5).forEach(avatar => {
            console.log(`  - ${avatar.name}: ${avatar.url} (${avatar.type})`);
        });
        
        if (avatars.length > 5) {
            console.log(`  ... und ${avatars.length - 5} weitere`);
        }
        
        // 2. Preset-Avatare spezifisch testen
        console.log('\n🖼️ Teste getPresetAvatars():');
        const presetAvatars = await avatarService.getPresetAvatars();
        console.log(`Found ${presetAvatars.length} preset avatars`);
        
        // 3. Simpsons-Avatare zählen
        const simpsonsAvatars = presetAvatars.filter(a => a.id.includes('simpsons'));
        console.log(`🟡 Simpsons avatars: ${simpsonsAvatars.length}`);
        
        // 4. Standard-Avatare zählen
        const standardAvatars = presetAvatars.filter(a => a.id.startsWith('avatar'));
        console.log(`⭐ Standard avatars: ${standardAvatars.length}`);
        
        // 5. Beispiel Avatar-Datei testen
        if (presetAvatars.length > 0) {
            const testAvatar = presetAvatars[0];
            console.log(`\n📋 Teste Avatar-Datei: ${testAvatar.id}`);
            
            try {
                const filePath = await avatarService.getAvatarFile(testAvatar.id);
                console.log(`✅ Datei gefunden: ${filePath}`);
            } catch (error) {
                console.log(`❌ Datei nicht gefunden: ${error}`);
            }
        }
        
        console.log('\n✅ Avatar-System Test abgeschlossen!');
        
    } catch (error) {
        console.error('❌ Avatar-System Test fehlgeschlagen:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Datenbank-Verbindung geschlossen');
        }
    }
}

// Test ausführen
if (require.main === module) {
    testAvatarSystem();
}

export { testAvatarSystem };