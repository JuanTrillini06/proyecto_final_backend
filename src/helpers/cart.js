import { cartService } from "../services/cart.service.js";
import { userService } from "../services/user.service.js";
import { defaultCookieOptions } from "../config/cookie-options.js";

export const ensureCartForRequest = async (req, res, userId = null) => {
    let cartId = req.cookies?.cartId;

    if (cartId) {
        return cartId;
    }

    if (userId) {
        const userCart = await cartService.getByUserId(userId);
        if (userCart) {
            cartId = userCart._id.toString();
            res.cookie("cartId", cartId, defaultCookieOptions);
            return cartId;
        }
    }

    const newCart = await cartService.createCart({ userId });
    cartId = newCart._id.toString();
    res.cookie("cartId", cartId, defaultCookieOptions);

    if (userId) {
        await userService.updateUserCart(userId, cartId);
    }

    return cartId;
};

export const sanitizeCart = (cart) => {
    if (!cart) return null;
    return {
        _id: cart._id,
        user: cart.user,
        products: cart.products?.map((item) => ({
            productId:
                item.productId?._id?.toString?.() ??
                item.productId?.toString?.() ??
                item.productId,
            title: item.productId?.title,
            price: item.productId?.price,
            quantity: item.quantity
        }))
    };
};
