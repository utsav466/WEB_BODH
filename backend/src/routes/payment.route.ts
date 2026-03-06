import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import {
  esewaInitDemo,
  esewaSuccessDemo,
  esewaFailureDemo,
} from "../controllers/payment.controller";

const router = Router();

router.post("/esewa/init", requireAuth, esewaInitDemo);
router.get("/esewa/success", esewaSuccessDemo);
router.get("/esewa/failure", esewaFailureDemo);

export default router;