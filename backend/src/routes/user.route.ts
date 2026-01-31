
import { Router } from "express";
import { UserController } from "../controllers/user.controller";
// import { requireAuth } from "../middlewares/auth.middleware";
import { uploadAvatar } from "../services/upload";
import { requireAuth } from "../middlewares/auth.middlewares";

const router = Router();
const controller = new UserController();

// current user info
router.get("/me", requireAuth, (req, res) => controller.me(req, res));

// upload avatar (multipart/form-data, field name: "avatar")
router.patch(
  "/me/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  (req, res) => controller.updateMyAvatar(req, res)
);

export default router;
