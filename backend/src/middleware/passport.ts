import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { getDataSource } from "../config/data-source";
import { User } from "../entities/User";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret",
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "api/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      const userRepo = getDataSource().getRepository(User);
      let user = await userRepo.findOneBy({ googleId: profile.id });
      if (!user) {
        user = userRepo.create({
          googleId: profile.id,
          email: profile.emails?.[0].value,
          username: profile.displayName,
          isGoogleUser: true,
        });
        await userRepo.save(user);
      }
      return done(null, user);
    }
  )
);

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  const userRepo = getDataSource().getRepository(User);
  const user = await userRepo.findOneBy({ id });
  done(null, user);
});

export default passport;
