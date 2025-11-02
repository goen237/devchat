
// entfernt: doppelte handleGoogleCallback-Definition

import { getDataSource } from "../config/data-source";
import { User } from "../entities";
import { hashPassword, comparePasswords } from "../utils/password";
import { generateToken } from "../utils/jwt";

/**
 * Registriert einen neuen User mit Username, Email und Passwort
 * @throws Error wenn User existiert
 */
export const registerUser = async (username: string, email: string, password: string, semester: number) => {
	// Nutze String-Namen für Tests (TypeORM-Workaround)
	const userRepo = getDataSource().getRepository(User);
	const existing = await userRepo.findOne({ where: { email } });
	if (existing) throw new Error("User exists");
	const passwordHash = await hashPassword(password);
	const user = userRepo.create({ username, email, passwordHash, semester });
	const saved = await userRepo.save(user);
	return saved;
};

/**
 * Loggt einen User ein und gibt ein JWT zurück
 * @throws Error bei ungültigen Credentials
 */
export const loginUser = async (email: string, password: string) => {
	const userRepo = getDataSource().getRepository(User);
	const user = await userRepo.findOne({ where: { email } });
	if (!user) throw new Error("Invalid credentials");
	const valid = await comparePasswords(password, user.passwordHash);
	if (!valid) throw new Error("Invalid credentials");
	const token = generateToken({ userId: user.id }, "1h");
	return { token, user };
};

/**
 * Verarbeitet den Google-OAuth-Callback und leitet mit JWT weiter
 */
export const handleGoogleCallback = (user: { id?: string } | undefined, res: import("express").Response) => {
	if (!user || !user.id) {
		return res.redirect("/login?error=NoUser");
	}
	const token = generateToken({ userId: user.id }, "1h");
	const redirectUrl = process.env.FRONTEND_URL || "http://localhost:5173";
	res.redirect(`${redirectUrl}/auth/callback?token=${token}`);
};

