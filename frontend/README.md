# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

# 💬 DevChat Frontend

React + TypeScript + Vite Frontend für die DevChat Echtzeit-Chat-Anwendung.

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Schnellstart](#-schnellstart)
- [Projekt-Struktur](#-projekt-struktur)
- [Komponenten](#-komponenten)
- [Hooks](#-hooks)
- [State Management](#-state-management)
- [Routing](#-routing)
- [API Integration](#-api-integration)
- [Socket.io Integration](#-socketio-integration)
- [Styling](#-styling)
- [Build & Deployment](#-build--deployment)

---

## ✨ Features

### 🎨 UI/UX
- ✅ **Responsive Design** - Mobile-first, funktioniert auf allen Geräten
- ✅ **Material-UI** - Moderne, professionelle UI-Komponenten
- ✅ **Real-time Updates** - Instant Message Delivery
- ✅ **Smooth Animations** - Flüssige Übergänge und Animationen
- ✅ **Loading States** - Klares User Feedback

### 💬 Chat Features
- ✅ **1-zu-1 Chats** - Private Konversationen
- ✅ **Gruppen-Chats** - Mehrere Teilnehmer
- ✅ **Typing Indicators** - Echtzeit "Benutzer schreibt..."
- ✅ **Online Status** - Wer ist gerade online?
- ✅ **Message History** - Scroll-to-load
- ✅ **Unread Count** - Badge mit ungelesenen Nachrichten

### 👤 User Features
- ✅ **Avatar System** - 50+ Avatare zur Auswahl
- ✅ **Profil-Verwaltung** - Username, Bio, Avatar ändern
- ✅ **User Search** - Benutzer finden und Chat starten
- ✅ **Authentication** - Login/Register mit JWT

---

## 🛠 Tech Stack

| Technologie | Version | Verwendung |
|------------|---------|------------|
| **React** | 19.1.1 | UI Framework |
| **TypeScript** | 5.8.3 | Type Safety |
| **Vite** | 7.1.2 | Build Tool & Dev Server |
| **React Router** | 7.9.2 | Client-side Routing |
| **Material-UI** | 7.3.2 | UI Component Library |
| **Socket.io Client** | 4.8.1 | WebSocket Client |
| **Axios** | 1.12.2 | HTTP Client |
| **MDB React** | 9.0.0 | Bootstrap Components |

---

## 🚀 Schnellstart

### Installation

```bash
# 1. Dependencies installieren
npm install

# 2. Environment Variables
copy .env.example .env

# 3. .env konfigurieren
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000

# 4. Development Server starten
npm run dev

# Browser öffnet automatisch: http://localhost:5173
```

### Development Commands

```bash
# Development Server
npm run dev

# Production Build
npm run build

# Build Preview
npm run preview

# Linting
npm run lint

# Type Checking
npm run type-check
```

---

## 📁 Projekt-Struktur

```
frontend/
├── public/                    # Static Assets
│   └── avatars/              # Avatar Images
├── src/
│   ├── api/                  # API Client Functions
│   │   ├── authApi.ts       # Authentication
│   │   ├── chatApi.ts       # Chat Rooms
│   │   ├── messageApi.ts    # Messages
│   │   ├── profileApi.ts    # User Profile
│   │   └── avatars.ts       # Avatar Management
│   ├── assets/              # Images, Icons, etc.
│   │   └── DevChatLogo.png
│   ├── components/          # Reusable Components
│   │   ├── AvatarComponent.tsx
│   │   ├── AvatarSelector.tsx
│   │   ├── ChatInput.tsx
│   │   ├── CreateGroupChatModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── MessageComponent.tsx
│   │   └── ChangePasswordModal.tsx
│   ├── hooks/               # Custom React Hooks
│   │   ├── useSocket.ts     # Socket.io Logic
│   │   └── useAuthValidation.ts
│   ├── pages/               # Page Components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ChatRoomPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── UserListPage.tsx
│   ├── services/            # Business Logic
│   │   └── socketService.ts
│   ├── styles/              # Global Styles
│   │   └── global.css
│   ├── types/               # TypeScript Types
│   │   └── index.ts
│   ├── utils/               # Utility Functions
│   │   └── helpers.ts
│   ├── App.tsx              # Main App Component
│   ├── main.tsx             # Entry Point
│   └── index.css            # Global Styles
├── .env.example             # Environment Template
├── vite.config.ts           # Vite Configuration
├── tsconfig.json            # TypeScript Config
└── package.json
```

---

## 🧩 Komponenten

### Pages (Seiten)

#### 1. **LoginPage**
```typescript
// src/pages/LoginPage.tsx
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const result = await loginApi(email, password);
    localStorage.setItem('token', result.token);
    navigate('/dashboard');
  };
}
```

**Features:**
- Email/Password Login
- Validation
- Error Handling
- Navigation zu Register

#### 2. **DashboardPage**
```typescript
// src/pages/DashboardPage.tsx
export default function DashboardPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const socket = useSocket();
  
  // Load chat rooms
  useEffect(() => {
    getChatRooms().then(setChatRooms);
  }, []);
  
  // Listen for online users
  useEffect(() => {
    socket?.on('online-users', setOnlineUsers);
  }, [socket]);
}
```

**Features:**
- Chat Room Liste
- Online Users Sidebar
- Create Group Chat Modal
- Unread Message Count
- Real-time Updates

#### 3. **ChatRoomPage**
```typescript
// src/pages/ChatRoomPage.tsx
export default function ChatRoomPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, typingUsers } = useChatRoom(id);
  
  // Load messages
  useEffect(() => {
    getRoomMessages(id).then(setMessages);
  }, [id]);
  
  // Listen for new messages
  useEffect(() => {
    socket?.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
  }, []);
}
```

**Features:**
- Message History
- Send Messages
- Typing Indicators
- Participant List
- Auto-scroll to bottom

#### 4. **ProfilePage**
```typescript
// src/pages/ProfilePage.tsx
export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  const handleUpdateProfile = async (data: Partial<User>) => {
    await updateProfile(data);
    setProfile({ ...profile, ...data });
  };
}
```

**Features:**
- Profile Information
- Avatar Selection
- Bio/Username Update
- Password Change Modal

### Components (Wiederverwendbar)

#### 1. **Header**
```typescript
// src/components/Header.tsx
export default function Header() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  
  return (
    <header>
      <Logo />
      <Navigation />
      <UserMenu onLogout={handleLogout} />
    </header>
  );
}
```

#### 2. **ChatInput**
```typescript
// src/components/ChatInput.tsx
export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  chatroomId
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
  };
  
  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };
}
```

**Features:**
- Text Input mit Auto-resize
- Emoji Support
- File Upload
- Typing Detection
- Send on Enter

#### 3. **MessageComponent**
```typescript
// src/components/MessageComponent.tsx
export default function MessageComponent({ message, currentUserId }) {
  const isOwn = message.sender_id === currentUserId;
  
  return (
    <div className={`message ${isOwn ? 'own' : 'other'}`}>
      <Avatar user={message.sender} />
      <div className="message-content">
        <div className="message-header">
          <span className="username">{message.sender.username}</span>
          <span className="timestamp">{formatTime(message.created_at)}</span>
        </div>
        <div className="message-text">{message.content}</div>
      </div>
      {isOwn && (
        <DeleteButton onClick={() => handleDelete(message.id)} />
      )}
    </div>
  );
}
```

#### 4. **AvatarSelector**
```typescript
// src/components/AvatarSelector.tsx
export default function AvatarSelector({ onSelect }) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selected, setSelected] = useState<string>('');
  
  useEffect(() => {
    avatarApi.getAllAvatars().then(setAvatars);
  }, []);
  
  const handleSelect = (avatarUrl: string) => {
    setSelected(avatarUrl);
    onSelect(avatarUrl);
  };
  
  return (
    <div className="avatar-grid">
      {avatars.map(avatar => (
        <img
          key={avatar.id}
          src={avatar.url}
          className={selected === avatar.url ? 'selected' : ''}
          onClick={() => handleSelect(avatar.url)}
        />
      ))}
    </div>
  );
}
```

---

## 🪝 Hooks

### useSocket

```typescript
// src/hooks/useSocket.ts
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const newSocket = io(SOCKET_URL, {
      auth: { token }
    });
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, []);
  
  return socket;
};
```

### useChatRoom

```typescript
// src/hooks/useSocket.ts
export const useChatRoom = (chatroomId: string) => {
  const socket = useSocket();
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  
  useEffect(() => {
    if (!socket || !chatroomId) return;
    
    // Join room
    socket.emit('join-room', { chatroom_id: chatroomId });
    
    // Listen for typing
    socket.on('user-typing', (data) => {
      setTypingUsers(prev => [...prev, data.user]);
    });
    
    // Cleanup
    return () => {
      socket.emit('leave-room', { chatroom_id: chatroomId });
    };
  }, [socket, chatroomId]);
  
  const sendMessage = (content: string) => {
    socket?.emit('send-message', {
      chatroom_id: chatroomId,
      content
    });
  };
  
  return { sendMessage, typingUsers };
};
```

### useAuthValidation

```typescript
// src/hooks/useAuthValidation.ts
export const useAuthValidation = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const validateAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }
      
      try {
        await getCurrentUser(); // API call
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };
    
    validateAuth();
  }, []);
  
  return { isValidating, isAuthenticated };
};
```

---

## 🔄 State Management

Das Frontend verwendet **React Hooks** für State Management:

- `useState` - Local Component State
- `useEffect` - Side Effects
- `useContext` - Shared State (optional)
- Custom Hooks - Reusable Logic

**Beispiel:**
```typescript
// Dashboard State
const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

// Load data
useEffect(() => {
  getChatRooms()
    .then(setChatRooms)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
```

---

## 🗺 Routing

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/chatroom/:id" element={
          <ProtectedRoute>
            <ChatRoomPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <UserListPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**ProtectedRoute:**
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isValidating, isAuthenticated } = useAuthValidation();
  
  if (isValidating) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};
```

---

## 📡 API Integration

### API Client Setup

```typescript
// src/api/client.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### API Functions

```typescript
// src/api/authApi.ts
export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/api/auth/login', {
    email,
    password
  });
  return response.data;
};

export const register = async (userData: RegisterData) => {
  const response = await apiClient.post('/api/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};
```

```typescript
// src/api/chatApi.ts
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await apiClient.get('/api/chatrooms');
  return response.data;
};

export const createChatRoom = async (data: CreateChatRoomData) => {
  const response = await apiClient.post('/api/chatrooms', data);
  return response.data;
};

export const deleteChatRoom = async (id: number) => {
  await apiClient.delete(`/api/chatrooms/${id}`);
};
```

---

## 🔌 Socket.io Integration

### Socket Service

```typescript
// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  
  connect(token: string) {
    this.socket = io(SOCKET_URL, {
      auth: { token }
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
  
  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
  
  on(event: string, callback: Function) {
    this.socket?.on(event, callback);
  }
  
  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
  
  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
```

### Socket Events Usage

```typescript
// In Component
useEffect(() => {
  const socket = socketService.getSocket();
  if (!socket) return;
  
  // Listen for new messages
  socket.on('new-message', (message: Message) => {
    setMessages(prev => [...prev, message]);
  });
  
  // Listen for user joined
  socket.on('user-joined', (data) => {
    console.log(`${data.user.username} joined the room`);
  });
  
  // Listen for typing
  socket.on('user-typing', (data) => {
    setTypingUsers(prev => [...prev, data.user]);
  });
  
  // Cleanup
  return () => {
    socket.off('new-message');
    socket.off('user-joined');
    socket.off('user-typing');
  };
}, []);
```

---

## 🎨 Styling

### Material-UI Theme

```typescript
// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#6c757d',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});
```

### CSS Modules

```css
/* src/pages/ChatRoomPage.module.css */
.chatContainer {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.messageList {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 15px;
}

.message.own {
  justify-content: flex-end;
}

.messageContent {
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 18px;
  background-color: #f0f0f0;
}

.message.own .messageContent {
  background-color: #007bff;
  color: white;
}
```

---

## 🏗 Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
# Build
npm run build

# Output: dist/
# - Optimized assets
# - Tree-shaking
# - Code splitting
# - Minification
```

### Preview Build

```bash
npm run preview
```

### Docker Build

```dockerfile
# Dockerfile.frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 🔧 Configuration

### Environment Variables

```env
# .env
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

**Usage:**
```typescript
const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
```

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true
      }
    }
  }
})
```

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Material-UI](https://mui.com/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)
- [React Router](https://reactrouter.com/)

---

**Version:** 1.0.0 | **Last Updated:** Oktober 2025

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
