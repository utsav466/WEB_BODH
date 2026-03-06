// backend/src/routes/book.route.ts
import { Router } from "express";
import { getPublicBook, listPublicBooks } from "../controllers/book.controller";

const router = Router();

router.get("/", listPublicBooks);
router.get("/:id", getPublicBook);

export default router;