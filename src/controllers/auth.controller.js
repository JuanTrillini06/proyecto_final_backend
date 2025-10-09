import config from "../config/config.js";
import { generateJWToken } from "../utils.js";
import { userService } from "../services/user.service.js";
import { cartService } from "../services/cart.service.js";
import { defaultCookieOptions } from "../config/cookie-options.js";
import { sanitizeUser } from "../helpers/user.js";

const ensureAdminRole = (userData) => {
    if (
        userData.email === config.adminName &&
        userData.password === config.adminPassword
    ) {
        return "admin";
    }
    return "user";
};

export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).send({
                status: "error",
                message: "Campos obligatorios faltantes."
            });
        }

        const role = ensureAdminRole(req.body);

        const { user, cart } = await userService.registerWithCart({
            first_name,
            last_name,
            email,
            age,
            password,
            role
        });

        const token = generateJWToken(user);

        res.cookie("jwtCookieToken", token, defaultCookieOptions);
        res.cookie("cartId", cart._id.toString(), defaultCookieOptions);

        return res.status(201).send({
            status: "success",
            message: "Usuario registrado correctamente.",
            payload: sanitizeUser(user),
            cartId: cart._id
        });
    } catch (error) {
        const statusCode = error.code === "USER_EXISTS" ? 409 : 500;
        res.status(statusCode).send({
            status: "error",
            message:
                error.code === "USER_EXISTS"
                    ? "El correo ya se encuentra registrado."
                    : "No se pudo registrar el usuario.",
            error: error.message
        });
    }
};

const mergeGuestCartIntoUserCart = async (guestCartId, userCartId) => {
    if (!guestCartId || !userCartId || guestCartId === userCartId) {
        return;
    }

    const guestCart = await cartService.getById(guestCartId);
    if (!guestCart) {
        return;
    }

    if (guestCart.products?.length) {
        for (const item of guestCart.products) {
            await cartService.addProduct(
                userCartId,
                item.productId._id || item.productId,
                item.quantity
            );
        }
    }

    await cartService.delete(guestCartId);
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send({
                status: "error",
                message: "Debe proporcionar email y contraseña."
            });
        }

        const user = await userService.validateUserCredentials(email, password);

        let finalCartId = user.cart?._id?.toString() || user.cart?.toString();
        const guestCartId = req.cookies?.cartId;

        if (finalCartId) {
            if (guestCartId && guestCartId !== finalCartId) {
                await mergeGuestCartIntoUserCart(guestCartId, finalCartId);
            }
        } else if (guestCartId) {
            await cartService.assignCartToUser(guestCartId, user._id);
            finalCartId = guestCartId;
            await userService.updateUserCart(user._id, guestCartId);
        } else {
            const newCart = await cartService.createCart({ userId: user._id });
            finalCartId = newCart._id.toString();
            await userService.updateUserCart(user._id, finalCartId);
        }

        const updatedUser = await userService.getById(user._id);
        const token = generateJWToken(updatedUser);

        res.cookie("jwtCookieToken", token, defaultCookieOptions);
        res.cookie("cartId", finalCartId, defaultCookieOptions);

        return res.send({
            status: "success",
            message: "Ingreso exitoso.",
            payload: sanitizeUser(updatedUser),
            cartId: finalCartId
        });
    } catch (error) {
        const statusCode =
            error.code === "USER_NOT_FOUND" || error.code === "INVALID_PASSWORD"
                ? 401
                : 500;
        res.status(statusCode).send({
            status: "error",
            message:
                statusCode === 401
                    ? "Credenciales inválidas."
                    : "No se pudo iniciar sesión.",
            error: error.message
        });
    }
};

export const logout = async (_req, res) => {
    res.clearCookie("jwtCookieToken");
    res.clearCookie("cartId");
    res.send({
        status: "success",
        message: "Sesión finalizada."
    });
};

export const current = async (req, res) => {
    const user = req.user ? sanitizeUser(req.user) : null;
    if (!user) {
        return res.status(401).send({
            status: "error",
            message: "Usuario no autenticado."
        });
    }
    res.send({
        status: "success",
        payload: user
    });
};
