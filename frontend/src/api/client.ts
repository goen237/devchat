import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api",
  withCredentials: false,
});

// Intercepteur pour gérer les erreurs d'authentification automatiquement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si le token est expiré/invalide (401), nettoyer le localStorage et rediriger
    if (error.response?.status === 401) {
      console.warn("Token expiré ou invalide, déconnexion automatique");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      
      // Rediriger vers la page de login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
