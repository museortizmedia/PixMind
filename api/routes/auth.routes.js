import express from "express";
import {
  register,
  login,
  me,
  verifyEmailToken,
  resendVerification
} from "../controllers/auth.controller.js";
import { requireJwt } from "../middlewares/requireJwt.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireJwt, me);
router.get("/verify/:token", verifyEmailToken);
router.post("/resend-verification", resendVerification);

export default router;