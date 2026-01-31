import { Router } from "express";
import { requireAdmin } from "../middlewares/admin.middleware";
import { upload } from "../middlewares/multer.middleware";
import { AdminUserController } from "../controllers/admin.user.controller";

const router = Router();
const controller = new AdminUserController();

router.use(requireAdmin);

// CREATE user (with image)
router.post("/", upload.single("avatar"), controller.createUser);

// GET all users
router.get("/", controller.getAllUsers);

// GET user by id
router.get("/:id", controller.getUserById);

// UPDATE user (with image)
router.put("/:id", upload.single("avatar"), controller.updateUser);

// DELETE user
router.delete("/:id", controller.deleteUser);

export default router;
