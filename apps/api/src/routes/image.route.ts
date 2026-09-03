import { Router, RouterOptions } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { completeUpload, getAllImages, initiateUpload } from "../controllers/image.controller";

const router: Router = Router();

router.post('/', authMiddleware, initiateUpload);
router.post('/complete', authMiddleware, completeUpload);
router.get('/', authMiddleware, getAllImages);

export default router;