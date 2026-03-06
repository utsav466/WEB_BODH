import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import {
  createOrder,
  myOrderDetail,
  myOrders,
  cancelMyOrder,
} from "../controllers/order.controller";

const router = Router();

router.use(requireAuth);

router.post("/", createOrder);
router.get("/me", myOrders);
router.get("/:id", myOrderDetail);

// ✅ cancel (demo)
router.patch("/:id/cancel", cancelMyOrder);

export default router;