import { Router } from "express";
import { auth, getOtp, verifyOtp } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/", auth);
router.post('/verify', verifyOtp);
router.post('/otp', getOtp);

export default router;