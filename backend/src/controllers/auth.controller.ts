import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { handleGoogleCallback } from "../services/auth.service";

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


export const googleCallbackController = (req: Request, res: Response) => {
  handleGoogleCallback(req.user as { id?: string } | undefined, res);
};


