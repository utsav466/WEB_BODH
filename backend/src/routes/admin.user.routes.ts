// src/routes/admin.user.routes.ts

// import { Router } from "express";
// import { requireAdmin } from "../middlewares/admin.middleware";
// import { upload } from "../middlewares/multer.middleware";
// import { AdminUserController } from "../controllers/admin.user.controller";

// const router = Router();
// const controller = new AdminUserController();

// router.use(requireAdmin);

// router.post("/", upload.single("avatar"), controller.createUser);
// router.get("/", controller.getAllUsers);
// router.get("/:id", controller.getUserById);
// router.put("/:id", upload.single("avatar"), controller.updateUser);
// router.delete("/:id", controller.deleteUser);

// export default router;
import { Router } from "express";
import { AdminUserController } from "../controllers/admin.user.controller";
// import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
// import upload from "../middlewares/multer.middleware";
import { requireAuth } from "../middlewares/auth.middlewares";
import { upload } from "../middlewares/multer.middleware";

const router = Router();
const controller = new AdminUserController();

// 🔐 PROTECTED ADMIN ROUTES
router.use(requireAuth, requireAdmin);

router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserById);
router.post("/", upload.single("avatar"), controller.createUser);
router.put("/:id", upload.single("avatar"), controller.updateUser);
router.delete("/:id", controller.deleteUser);

export default router;
