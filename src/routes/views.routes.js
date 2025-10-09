import { Router } from "express";
import {
    renderHome,
    renderLogin,
    renderRegister,
    renderCart,
    renderAdminProducts
} from "../controllers/views.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", renderHome);
router.get("/login", renderLogin);
router.get("/register", renderRegister);
router.get("/cart", renderCart);
router.get("/admin/products", requireAuth, requireAdmin, renderAdminProducts);

export default router;
