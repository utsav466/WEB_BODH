import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middlewares";
import { requireAdmin } from "../middlewares/admin.middleware";
import {
  adminCreateBook,
  adminDeleteBook,
  adminGetBook,
  adminListBooks,
  adminUpdateBook,
} from "../controllers/book.controller";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/", adminListBooks);
router.post("/", adminCreateBook);
router.get("/:id", adminGetBook);
router.patch("/:id", adminUpdateBook);
router.delete("/:id", adminDeleteBook);

export default router;