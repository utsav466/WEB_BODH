import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authController = new AuthController();
const router = Router();

// Registration
router.post("/register", (req, res) => authController.register(req, res));

// Login
router.post("/login", (req, res) => authController.login(req, res));

// Forgot Password
router.post("/forgot-password", (req, res) =>
  authController.forgotPassword(req, res)
);

// Reset Password
router.post("/reset-password", (req, res) =>
  authController.resetPassword(req, res)
);

// Logout (example placeholder)
router.post("/logout", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// Refresh token (optional)
router.post("/refresh", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Token refreshed",
  });
});

export default router;
