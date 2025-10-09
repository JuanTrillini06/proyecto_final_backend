import { productService } from "../services/product.service.js";
import { cartService } from "../services/cart.service.js";
import {
    ensureCartForRequest,
    sanitizeCart
} from "../helpers/cart.js";
import { sanitizeUser } from "../helpers/user.js";

const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value);
        }
    });
    return query.toString();
};

const buildPaginationLinks = (result, basePath, initialQuery = {}) => {
    const query = { ...initialQuery };
    const prevQuery = { ...query, page: result.prevPage };
    const nextQuery = { ...query, page: result.nextPage };

    return {
        currentPage: result.page,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage
            ? `${basePath}?${buildQueryString(prevQuery)}`
            : null,
        nextLink: result.hasNextPage
            ? `${basePath}?${buildQueryString(nextQuery)}`
            : null
    };
};

export const renderHome = async (req, res) => {
    try {
        const { limit, page, sort, category, status, title } = req.query;
        const filters = {
            limit,
            page,
            sort,
            category,
            status,
            title
        };

        const productsData = await productService.getAll(filters);
        const sanitizedUser = sanitizeUser(req.user);

        res.render("products", {
            user: sanitizedUser,
            isLoggedIn: Boolean(sanitizedUser),
            isAdmin: sanitizedUser?.role === "admin",
            products: productsData.docs,
            pagination: buildPaginationLinks(productsData, "/", {
                limit,
                sort,
                category,
                status,
                title
            }),
            filters: {
                limit: limit || 10,
                sort: sort || "",
                category: category || "",
                status: status || "",
                title: title || ""
            }
        });
    } catch (error) {
        console.error("No se pudo renderizar la vista de productos.", error);
        res.status(500).render("error", {
            message: "Ocurrio un error al cargar los productos."
        });
    }
};

export const renderLogin = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }

    res.render("login", {
        isLoggedIn: false
    });
};

export const renderRegister = (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }

    res.render("register", {
        isLoggedIn: false
    });
};

export const renderCart = async (req, res) => {
    try {
        const userId = req.user?._id?.toString() ?? null;
        const cartId = await ensureCartForRequest(req, res, userId);
        const cart = await cartService.getById(cartId);
        const sanitizedUser = sanitizeUser(req.user);
        const sanitizedCart = sanitizeCart(cart);
        const cartTotalValue =
            sanitizedCart && Array.isArray(sanitizedCart.products)
                ? sanitizedCart.products.reduce(
                      (acc, item) =>
                          acc + (Number(item.price) || 0) * (item.quantity || 0),
                      0
                  )
                : 0;

        res.render("cart", {
            user: sanitizedUser,
            isLoggedIn: Boolean(sanitizedUser),
            isAdmin: sanitizedUser?.role === "admin",
            cart: sanitizedCart,
            cartId,
            cartTotal: Number(cartTotalValue.toFixed(2))
        });
    } catch (error) {
        console.error("No se pudo renderizar la vista del carrito.", error);
        res.status(500).render("error", {
            message: "Ocurrio un error al cargar el carrito."
        });
    }
};

export const renderAdminProducts = async (req, res) => {
    if (!req.user || req.user.role !== "admin") {
        return res.redirect("/");
    }

    try {
        const productsData = await productService.getAll({
            limit: 50,
            page: 1
        });

        res.render("admin-products", {
            user: sanitizeUser(req.user),
            isLoggedIn: true,
            isAdmin: true,
            products: productsData.docs
        });
    } catch (error) {
        console.error("No se pudo renderizar la vista de administracion.", error);
        res.status(500).render("error", {
            message: "Ocurrio un error al cargar el panel de administracion."
        });
    }
};
