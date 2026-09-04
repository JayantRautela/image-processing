import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  completeUpload,
  deleteImage,
  getAllImages,
  getImageById,
  initiateUpload,
} from "../controllers/image.controller";

const router: Router = Router();

router.post("/", authMiddleware, initiateUpload);
router.post("/complete/:imageId", authMiddleware, completeUpload);
router.get("/", authMiddleware, getAllImages);
router.get("/:imageId", authMiddleware, getImageById);
router.patch("/:imageId", authMiddleware, deleteImage);

export default router;
