import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/authController.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  googleCallback
);

export default router;
