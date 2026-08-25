import { Router } from "express";
import { auth, verifyOtp } from "../controllers/auth.controller";

const router: Router = Router();

router.post("/", auth);
router.post('/verify', verifyOtp);

export default router;