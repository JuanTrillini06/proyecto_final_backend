import { Router } from "express";
import {
    getCarts,
    getCartById,
    saveCart,
    updateCart,
    deleteCart,
    addProductToCart,
    updateProductQuantity,
    removeProductFromCart,
    purchaseCart
} from "../controllers/carts.controller.js";
import { requireAuth } from "../middlewares/auth.js";

const router = Router();

router.get("/", getCarts);
router.get("/:cid", getCartById);
router.post("/", saveCart);
router.put("/:cid", updateCart);
router.delete("/:cid", deleteCart);

router.post("/products/:pid", addProductToCart);
router.put("/:cid/products/:pid", updateProductQuantity);
router.delete("/:cid/products/:pid", removeProductFromCart);
router.post("/:cid/purchase", requireAuth, purchaseCart);

export default router;
