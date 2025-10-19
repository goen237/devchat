import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import UserListPage from "./pages/UserListPage";
import ChatRoomPage from "./pages/ChatRoomPage";
import { useAuthValidation } from "./hooks/useAuthValidation";

// Composant de chargement
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    flexDirection: 'column'
  }}>
    <div style={{ 
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #007bff',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      animation: 'spin 1s linear infinite'
    }}></div>
    <p style={{ marginTop: '20px', color: '#6c757d' }}>Validierung der Authentifizierung...</p>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Composant pour protéger les routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isValidating, isAuthenticated } = useAuthValidation();
  
  if (isValidating) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
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
        <Route path="/chatroom/:id" element={
          <ProtectedRoute>
            <ChatRoomPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
