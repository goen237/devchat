import { Router } from "express";
import { register, login, logout, googleCallbackController } from "../controllers/auth.controller";
import passport from "../middleware/passport";
import { authMiddleware } from "../middleware/authMiddleware";
import { authRateLimit } from "../middleware/rateLimit";

const router = Router();

// Public Routes mit Rate Limiting
router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);

// Protected Logout Route (benötigt Token)
router.post("/logout", authMiddleware, logout);

// Google OAuth2: Redirect to Google
router.get("/google-oauth", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleCallbackController
);

export default router;
