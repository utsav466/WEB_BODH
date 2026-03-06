import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import { requireAdmin } from "../middlewares/admin.middleware";
import { adminSalesReport } from "../controllers/admin.reports.controller";
// import { adminSalesReport } from "../controllers/report.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/sales", adminSalesReport);

export default router;