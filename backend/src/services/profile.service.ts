import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";

export const updateUserProfile = async (
	userId: string,
	updates: { email?: string; username?: string; semester?: number }
) => {
	const userRepo = AppDataSource.getRepository(User);
	const user = await userRepo.findOneByOrFail({ id: userId });

	// Email/Username Eindeutigkeit prüfen
	if (updates.email && updates.email !== user.email) {
		const emailExists = await userRepo.findOne({ where: { email: updates.email } });
		if (emailExists) throw new Error("Email ist bereits vergeben.");
		user.email = updates.email;
	}
	if (updates.username && updates.username !== user.username) {
		const usernameExists = await userRepo.findOne({ where: { username: updates.username } });
		if (usernameExists) throw new Error("Username ist bereits vergeben.");
		user.username = updates.username;
	}

	if (typeof updates.semester === "number") {
		user.semester = updates.semester;
	}
	await userRepo.save(user);
	return { username: user.username, email: user.email, semester: user.semester };
};

export const getUserProfile = async (userId: string) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneByOrFail({ id: userId });
    return { username: user.username, email: user.email, semester: user.semester, avatarUrl: user.avatarUrl };
};

export const updateUserPassword = async (userId: string, { oldPassword, newPassword }: { oldPassword: string; newPassword: string }) => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneByOrFail({ id: userId });
    if (!user.passwordHash || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
        throw new Error("Das alte Passwort ist nicht korrekt.");
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await userRepo.save(user);
    return { message: "Passwort erfolgreich geändert." };
};

