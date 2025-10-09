import { cartService } from "../services/cart.service.js";
import { productService } from "../services/product.service.js";
import { ticketService } from "../services/ticket.service.js";
import { mailingService } from "../services/mailing.service.js";
import { ensureCartForRequest, sanitizeCart } from "../helpers/cart.js";

const generateTicketCode = () =>
    `TCK-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

// GET ALL
export const getCarts = async (_req, res) => {
    try {
        const carts = await cartService.getAll();
        res.send({ status: "success", payload: carts.map(sanitizeCart) });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo obtener los carritos."
        });
    }
};

// GET BY ID
export const getCartById = async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await cartService.getById(id);
        if (!cart) {
            return res.status(404).send({
                status: "error",
                message: "Carrito no encontrado."
            });
        }
        res.send({ status: "success", payload: sanitizeCart(cart) });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo obtener el carrito."
        });
    }
};

// POST
export const saveCart = async (req, res) => {
    try {
        const cart = await cartService.createCart(req.body);
        res.status(201).send({
            status: "success",
            payload: sanitizeCart(cart)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo crear el carrito."
        });
    }
};

// PUT
export const updateCart = async (req, res) => {
    try {
        const id = req.params.cid;
        const updatedCart = await cartService.update(id, req.body);
        if (!updatedCart) {
            return res.status(404).send({
                status: "error",
                message: "Carrito no encontrado."
            });
        }
        res.send({ status: "success", payload: sanitizeCart(updatedCart) });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo actualizar el carrito."
        });
    }
};

// DELETE
export const deleteCart = async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await cartService.delete(id);
        if (!cart) {
            return res.status(404).send({
                status: "error",
                message: "Carrito no encontrado."
            });
        }
        res.send({
            status: "success",
            message: "Carrito eliminado correctamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo eliminar el carrito."
        });
    }
};

// ADD PRODUCT TO CART (handles guest carts)
export const addProductToCart = async (req, res) => {
    try {
        const { pid } = req.params;
        const quantity =
            Number.parseInt(req.body.quantity, 10) > 0
                ? Number.parseInt(req.body.quantity, 10)
                : 1;

        const product = await productService.getById(pid);
        if (!product) {
            return res.status(404).send({
                status: "error",
                message: "Producto no encontrado."
            });
        }

        const userId = req.user?._id?.toString() ?? null;
        const cartId = await ensureCartForRequest(req, res, userId);

        const updatedCart = await cartService.addProduct(
            cartId,
            pid,
            quantity
        );

        res.send({
            status: "success",
            message: "Producto agregado al carrito.",
            payload: sanitizeCart(updatedCart),
            cartId
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "error",
            message: "No se pudo agregar el producto al carrito.",
            error: error.message
        });
    }
};

export const updateProductQuantity = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || Number.parseInt(quantity, 10) <= 0) {
            return res.status(400).send({
                status: "error",
                message: "La cantidad debe ser mayor a cero."
            });
        }

        const updatedCart = await cartService.updateProductQuantity(
            cid,
            pid,
            Number.parseInt(quantity, 10)
        );

        if (!updatedCart) {
            return res.status(404).send({
                status: "error",
                message: "Carrito o producto no encontrado."
            });
        }

        res.send({
            status: "success",
            message: "Cantidad actualizada correctamente.",
            payload: sanitizeCart(updatedCart)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "error",
            message: "No se pudo actualizar la cantidad.",
            error: error.message
        });
    }
};

export const removeProductFromCart = async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const updatedCart = await cartService.removeProduct(cid, pid);
        if (!updatedCart) {
            return res.status(404).send({
                status: "error",
                message: "Carrito o producto no encontrado."
            });
        }

        res.send({
            status: "success",
            message: "Producto eliminado correctamente.",
            payload: sanitizeCart(updatedCart)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "error",
            message: "No se pudo eliminar el producto del carrito.",
            error: error.message
        });
    }
};

export const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;

        if (!req.user) {
            return res.status(401).send({
                status: "error",
                message: "Debe iniciar sesión para realizar la compra."
            });
        }

        const cart = await cartService.getById(cid);
        if (!cart) {
            return res.status(404).send({
                status: "error",
                message: "Carrito no encontrado."
            });
        }

        if (!cart.products?.length) {
            return res.status(400).send({
                status: "error",
                message: "El carrito está vacío."
            });
        }

        const insufficientStock = [];
        const updatedProducts = [];
        let totalAmount = 0;

        for (const item of cart.products) {
            const productId =
                item.productId?._id?.toString?.() ??
                item.productId?.toString?.() ??
                item.productId;

            const product = await productService.getById(productId);
            if (!product) {
                insufficientStock.push({
                    productId,
                    reason: "Producto inexistente."
                });
                continue;
            }

            if (product.stock < item.quantity) {
                insufficientStock.push({
                    productId,
                    reason: "Stock insuficiente."
                });
                continue;
            }

            totalAmount += product.price * item.quantity;
            updatedProducts.push({
                product,
                quantity: item.quantity
            });
        }

        if (insufficientStock.length) {
            return res.status(400).send({
                status: "error",
                message: "No hay stock suficiente para completar la compra.",
                failedProducts: insufficientStock
            });
        }

        for (const item of updatedProducts) {
            await productService.update(item.product._id, {
                stock: item.product.stock - item.quantity
            });
        }

        await cartService.clearCart(cid);

        const ticket = await ticketService.create({
            code: generateTicketCode(),
            amount: totalAmount,
            purchaser: req.user.email,
            products: updatedProducts.map((item) => ({
                productId: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            }))
        });

        const productListHtml = updatedProducts
            .map(
                (item) =>
                    `<li>${item.product.title} x${item.quantity} - $${
                        item.product.price * item.quantity
                    }</li>`
            )
            .join("");

        const emailHtml = `
            <h1>Gracias por tu compra</h1>
            <p>Código de ticket: <strong>${ticket.code}</strong></p>
            <ul>${productListHtml}</ul>
            <p>Total pagado: <strong>$${totalAmount}</strong></p>
        `;

        try {
            await mailingService.sendPurchaseEmail({
                to: req.user.email,
                subject: `Ticket de compra ${ticket.code}`,
                html: emailHtml
            });
        } catch (mailError) {
            console.error("No se pudo enviar el mail de confirmación.", mailError);
        }

        res.send({
            status: "success",
            message: "Compra realizada con éxito.",
            payload: ticket
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            status: "error",
            message: "No se pudo completar la compra.",
            error: error.message
        });
    }
};
