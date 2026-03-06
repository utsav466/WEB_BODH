import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import { requireAdmin } from "../middlewares/admin.middleware";
import { adminDashboardStats } from "../controllers/dashboard.controller";
// import { adminDashboardStats } from "../controllers/dashboard.controller"; 

const router = Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/dashboard/stats
router.get("/stats", adminDashboardStats);

export default router;