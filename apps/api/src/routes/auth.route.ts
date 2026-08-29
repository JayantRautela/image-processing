import { Router } from "express";
import { auth, getOtp, refreshAccessToken, verifyOtp } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/", auth);
router.post('/verify', verifyOtp);
router.post('/otp', getOtp);
router.post('/token', refreshAccessToken);

export default router;