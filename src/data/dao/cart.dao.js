import cartModel from "../models/cart.model.js";

export default class CartDAO {
    getAll = async () => {
        const carts = await cartModel.find().lean();
        return carts;
    };

    getById = async (id) => {
        const result = await cartModel
            .findById(id)
            .populate("products.productId")
            .lean();
        return result;
    };

    getByUserId = async (userId) => {
        const result = await cartModel
            .findOne({ user: userId })
            .populate("products.productId")
            .lean();
        return result;
    };

    create = async (cart = {}) => {
        const payload = {
            products: [],
            ...cart
        };
        const result = await cartModel.create(payload);
        return result;
    };

    save = async (cart) => {
        return this.create(cart);
    };

    update = async (id, cart) => {
        const result = await cartModel.findByIdAndUpdate(id, cart, {
            new: true
        });
        return result;
    };

    addProduct = async (cartId, productId, quantity = 1) => {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            return null;
        }

        const existingProduct = cart.products.find(
            (item) => item.productId.toString() === productId.toString()
        );

        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({
                productId,
                quantity
            });
        }

        await cart.save();
        return cart.populate("products.productId");
    };

    updateProductQuantity = async (cartId, productId, quantity) => {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            return null;
        }

        const product = cart.products.find(
            (item) => item.productId.toString() === productId.toString()
        );

        if (!product) {
            return null;
        }

        product.quantity = quantity;
        await cart.save();
        return cart.populate("products.productId");
    };

    removeProduct = async (cartId, productId) => {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            return null;
        }

        cart.products = cart.products.filter(
            (item) => item.productId.toString() !== productId.toString()
        );

        await cart.save();
        return cart.populate("products.productId");
    };

    clearCart = async (cartId) => {
        const cart = await cartModel.findById(cartId);
        if (!cart) {
            return null;
        }
        cart.products = [];
        await cart.save();
        return cart;
    };

    delete = async (id) => {
        const result = await cartModel.findByIdAndDelete(id);
        return result;
    };
}
