import { Router } from "express";
import { register, login, googleCallbackController } from "../controllers/auth.controller";
import passport from "../middleware/passport";

const router = Router();


router.post("/register", register);
router.post("/login", login);

// Google OAuth2: Redirect to Google
router.get("/google-oauth", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  googleCallbackController
);

export default router;
