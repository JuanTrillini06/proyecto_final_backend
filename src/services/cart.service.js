import CartDAO from "../data/dao/cart.dao.js";
import cartRepository from "../repository/cart.repository.js";

class CartService {
    constructor() {
        const cartDao = new CartDAO();
        this.cartRepository = new cartRepository(cartDao);
    }

    getAll() {
        return this.cartRepository.getAll();
    }

    getById(id) {
        return this.cartRepository.getById(id);
    }

    getByUserId(userId) {
        return this.cartRepository.getByUserId(userId);
    }

    async createCart({ userId = null, products = [] } = {}) {
        const cart = await this.cartRepository.create({
            user: userId,
            products
        });
        return cart;
    }

    save(cart) {
        return this.cartRepository.save(cart);
    }

    update(id, cart) {
        return this.cartRepository.update(id, cart);
    }

    addProduct(cartId, productId, quantity = 1) {
        return this.cartRepository.addProduct(cartId, productId, quantity);
    }

    updateProductQuantity(cartId, productId, quantity) {
        return this.cartRepository.updateProductQuantity(
            cartId,
            productId,
            quantity
        );
    }

    removeProduct(cartId, productId) {
        return this.cartRepository.removeProduct(cartId, productId);
    }

    clearCart(cartId) {
        return this.cartRepository.clearCart(cartId);
    }

    async assignCartToUser(cartId, userId) {
        const updated = await this.cartRepository.update(cartId, {
            user: userId
        });
        return updated;
    }

    delete(id) {
        return this.cartRepository.delete(id);
    }
}

export const cartService = new CartService();
