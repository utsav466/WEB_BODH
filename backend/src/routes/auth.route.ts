import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authController = new AuthController();
const router = Router();

// Registration
router.post("/register", (req, res) => authController.register(req, res));

// Login
router.post("/login", (req, res) => authController.login(req, res));

// Logout (example placeholder)
router.post("/logout", (req, res) => {
  // Invalidate JWT or clear session here
  return res.status(200).json({ success: true, message: "Logout successful" });
});

// Refresh token (optional)
router.post("/refresh", (req, res) => {
  // Issue new JWT if refresh token is valid
  return res.status(200).json({ success: true, message: "Token refreshed" });
});

export default router;
