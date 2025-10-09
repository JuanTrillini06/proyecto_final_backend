import { Router } from "express";
import {
    register,
    login,
    logout,
    current
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/current", requireAuth, current);

export default router;
