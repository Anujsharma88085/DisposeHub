import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            provider: "google",
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            role: "user",
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.provider = "google";
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
