import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import { requireAdmin } from "../middlewares/admin.middleware";
import { seedOrders } from "../controllers/seed.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

// POST /api/admin/seed/orders?count=15
router.post("/orders", seedOrders);

export default router;