import { Router } from "express";
import {
  auth,
  getOtp,
  logout,
  refreshAccessToken,
  verifyOtp,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router: Router = Router();

router.post("/", auth);
router.post("/verify", verifyOtp);
router.post("/otp", getOtp);
router.post("/token", refreshAccessToken);
router.post("/logout", authMiddleware, logout);

export default router;
