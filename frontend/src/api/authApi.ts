import { api } from "./client";

export async function login(email: string, password: string) {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || "Login fehlgeschlagen");
    }
    throw new Error("Login fehlgeschlagen");
  }
}

export async function register(username: string, email: string, password: string) {
  try {
    const res = await api.post("/auth/register", { username, email, password });
    return res.data;
  } catch (err: unknown) {
    if (typeof err === "object" && err !== null && "response" in err) {
      const error = err as { response?: { data?: { error?: string } } };
      throw new Error(error.response?.data?.error || "Registrierung fehlgeschlagen");
    }
    throw new Error("Registrierung fehlgeschlagen");
  }
}
