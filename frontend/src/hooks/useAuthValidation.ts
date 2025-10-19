import { useEffect, useState } from "react";
import { api } from "../api/client";

export const useAuthValidation = () => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      try {
        // Essayer un appel API simple pour valider le token
        await api.get("/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setIsAuthenticated(true);
      } catch (error) {
        console.warn("Token invalide lors de la validation:", error);
        // Le nettoyage sera fait par l'intercepteur
        setIsAuthenticated(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, []);

  return { isValidating, isAuthenticated };
};