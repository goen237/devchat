import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { handleGoogleCallback } from "../services/auth.service";
import { blacklistToken } from "../services/tokenBlacklist.service";

export const register = async (req: Request, res: Response) => {
  const { username, email, password, semester } = req.body;
  try {
    await registerUser(username, email, password, semester);
    res.json({ message: "User created" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};


export const login = async (req: Request, res: Response) => {
  console.log("Login request body:", req.body);
  const { email, password } = req.body;
  try {
    const { token, user } = await loginUser(email, password);
    res.json({ 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Logout Endpoint
 * Fügt Token zur Redis Blacklist hinzu
 * Token ist danach ungültig (auch wenn noch nicht abgelaufen)
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // Extrahiere Token aus Authorization Header
    // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Füge Token zur Blacklist hinzu
    await blacklistToken(token);
    
    res.json({ 
      message: 'Logged out successfully',
      info: 'Token has been invalidated' 
    });
  } catch (err: any) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
};


export const googleCallbackController = (req: Request, res: Response) => {
  handleGoogleCallback(req.user as { id?: string } | undefined, res);
};

