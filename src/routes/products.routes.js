import { Router } from "express";
import {
    getProducts,
    getProductById,
    saveProduct,
    updateProduct,
    deleteProduct
} from "../controllers/products.controller.js";
import { requireAuth, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", getProducts);
router.get("/:pid", getProductById);
router.post("/", requireAuth, requireAdmin, saveProduct);
router.put("/:pid", requireAuth, requireAdmin, updateProduct);
router.delete("/:pid", requireAuth, requireAdmin, deleteProduct);

export default router;
