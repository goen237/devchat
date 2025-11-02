import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * 🔵 Auth Callback Page - Verarbeitet Google OAuth Token
 * 
 * Diese Seite wird nach erfolgreichem Google Login aufgerufen
 * URL: /auth/callback?token=xxx
 * 
 * Flow:
 * 1. Extrahiert Token aus URL
 * 2. Speichert Token in localStorage
 * 3. Redirected zu Dashboard
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    // ❌ Error von Backend
    if (error) {
      console.error('❌ Google Auth Error:', error);
      navigate(`/login?error=${error}`);
      return;
    }

    // ❌ Kein Token in URL
    if (!token) {
      console.error('❌ No token in callback URL');
      navigate('/login?error=no_token');
      return;
    }

    // ✅ Token vorhanden
    console.log('✅ Google Auth successful, saving token...');
    
    // Token speichern
    localStorage.setItem('token', token);
    
    // Kurze Verzögerung für UX (zeigt "Logging in..." Text)
    setTimeout(() => {
      navigate('/dashboard');
      // Optional: Page reload um User-Daten neu zu laden
      // window.location.href = '/dashboard';
    }, 500);
    
  }, [searchParams, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        bgcolor: 'background.default'
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Logging you in...
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Please wait while we complete your authentication
      </Typography>
    </Box>
  );
}