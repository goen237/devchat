# 👥 Online Users Feature

## Übersicht
Das Online Users Feature zeigt in Echtzeit an, welche Benutzer aktuell online sind. Es nutzt Socket.io für Live-Updates ohne Page Refresh.

## Architektur

### Backend (Socket.io)
- **Datei**: `backend/src/sockets/userSocket.ts`
- **Events**: `userOnline`, `userOffline`
- **Datenbankfeld**: `User.isOnline` (boolean)

#### Funktionsweise:
1. User verbindet sich → `setUserOnline()` → User.isOnline = true → broadcast `userOnline`
2. User trennt Verbindung → `setUserOffline()` → User.isOnline = false → broadcast `userOffline`

### Frontend (React)

#### 1. Hook: `useUserStatus()`
- **Datei**: `frontend/src/hooks/useSocket.ts`
- **State**: `onlineUsers: Set<string>` (User IDs)
- **Funktionen**:
  - `isUserOnline(userId)` - Prüft ob User online ist
  - Lauscht auf `userOnline`/`userOffline` Events

```typescript
const { onlineUsers, isUserOnline } = useUserStatus();
```

#### 2. Dashboard Integration
- **Datei**: `frontend/src/pages/DashboardPage.tsx`
- Lädt alle User via `getAllUsers()`
- Filtert online Users: `allUsers.filter(user => isUserOnline(user.id))`
- Zeigt Online-Indikator (grüner Punkt)
- Badge mit Anzahl online Users

## UI Features

### Online Users Card
- ✅ Echtzeit-Updates ohne Refresh
- ✅ Anzahl online Users im Badge
- ✅ Avatar oder Initial
- ✅ Grüner Online-Indikator
- ✅ Semester-Info (falls vorhanden)
- ✅ Click → zur User-Liste navigieren

### Empty State
- Zeigt "Keine User online" wenn niemand online ist
- Icon: `user-slash`

## Verwendung in anderen Komponenten

### ChatRoom - Online Status anzeigen
```typescript
import { useUserStatus } from '../hooks/useSocket';

function ChatRoom() {
  const { isUserOnline } = useUserStatus();
  
  return (
    <div>
      {isUserOnline(userId) && (
        <span className="online-indicator">🟢</span>
      )}
    </div>
  );
}
```

### User Liste - Online filtern
```typescript
const { onlineUsers } = useUserStatus();
const onlineUsersList = allUsers.filter(user => onlineUsers.has(user.id));
```

## Best Practices

### Performance
- ✅ `Set<string>` für O(1) Lookup
- ✅ Hook läuft nur einmal (keine Dependencies)
- ✅ Cleanup bei Unmount

### UX
- ✅ Grüner Punkt für Online-Status
- ✅ Badge mit Anzahl
- ✅ Scroll bei vielen Users
- ✅ Click-Handler für Navigation

## Debugging

### Console Logs
```javascript
// User verbindet sich
✅ User online: johndoe

// User trennt Verbindung
⭕ User offline: johndoe
```

### Dev Tools
```javascript
// Im Browser Console
localStorage.getItem('token'); // Token prüfen
window.io; // Socket.io client
```

## Erweiterungsmöglichkeiten

### 1. Last Seen
```typescript
interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}
```

### 2. Typing Indicator
```typescript
socket.emit('typing', { roomId, userId });
```

### 3. User Search
```typescript
const filteredUsers = allUsers.filter(user => 
  user.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
  isUserOnline(user.id)
);
```

### 4. Status Messages
```typescript
enum UserStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  OFFLINE = 'offline'
}
```

## Troubleshooting

### Problem: Keine Online Users angezeigt
**Lösung**: 
1. Socket-Verbindung prüfen: `useSocket()` muss aufgerufen werden
2. Token vorhanden? `localStorage.getItem('token')`
3. Backend läuft? Check Console für Socket-Logs

### Problem: Online Status nicht aktualisiert
**Lösung**:
1. Socket-Events prüfen: Browser DevTools → Network → WS
2. Backend Logs prüfen: `✅ User online` / `⭕ User offline`
3. DB prüfen: `User.isOnline` Feld

### Problem: User erscheint doppelt
**Lösung**:
- Mehrere Socket-Verbindungen? → `useSocket()` nur einmal aufrufen
- User ID in Set vorhanden? → `onlineUsers.has(userId)`

## Testing

### Manuell testen
1. Login in Browser A
2. Login in Browser B (andere User)
3. Dashboard öffnen
4. → Online Users sollten angezeigt werden
5. Browser B schließen
6. → User sollte aus Liste verschwinden

### Automatisiert
```typescript
describe('Online Users', () => {
  it('should show online users in real-time', async () => {
    // Mock Socket.io
    const mockSocket = new MockSocket();
    
    // Render Dashboard
    render(<DashboardPage />);
    
    // Emit userOnline event
    mockSocket.emit('userOnline', { userId: '123', username: 'test' });
    
    // Assert user is shown
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

## Zusammenfassung

Das Online Users Feature bietet:
- ✅ Echtzeit-Updates via Socket.io
- ✅ Saubere Hook-Architektur
- ✅ Performance-optimiert (Set)
- ✅ Schöne UI mit MDB React
- ✅ Erweiterbar für weitere Features

**Status**: 🟢 Production Ready
