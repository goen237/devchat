import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { handleGoogleCallback } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  try {
    await registerUser(username, email, password);
    res.json({ message: "User created" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const { token } = await loginUser(email, password);
    res.json({ token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const googleCallbackController = (req: Request, res: Response) => {
  handleGoogleCallback(req.user as { id?: string } | undefined, res);
};


