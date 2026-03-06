import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import { requireAdmin } from "../middlewares/admin.middleware";
import { getSettings, updateSettings } from "../controllers/admin.settings.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", getSettings);
router.patch("/", updateSettings);

export default router;