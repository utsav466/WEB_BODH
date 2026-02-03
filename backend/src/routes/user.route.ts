import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { requireAuth } from "../middlewares/auth.middlewares";
import { uploadAvatar } from "../services/upload";

const router = Router();
const controller = new UserController();

// ✅ current user info
router.get("/me", requireAuth, (req, res) => controller.me(req, res));

// ✅ UPDATE profile (fullName etc.)
router.put(
  "/me",
  requireAuth,
  uploadAvatar.single("avatar"), // allow avatar + text together
  (req, res) => controller.updateMe(req, res)
);

// ✅ avatar-only update (keep this)
router.patch(
  "/me/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  (req, res) => controller.updateMyAvatar(req, res)
);

export default router;
