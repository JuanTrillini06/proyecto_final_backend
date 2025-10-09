export default class cartRepository {
    constructor(dao) {
        this.dao = dao
    }

    getAll = () => {
        return this.dao.getAll()
    }

    getById = (id) => {
        return this.dao.getById(id)
    }

    getByUserId = (userId) => {
        return this.dao.getByUserId(userId)
    }

    create = (cart) => {
        return this.dao.create(cart)
    }

    save = (cart) => {
        return this.dao.save(cart)
    }

    update = (id, cart) => {
        return this.dao.update(id, cart)
    }

    addProduct = (cartId, productId, quantity) => {
        return this.dao.addProduct(cartId, productId, quantity)
    }

    updateProductQuantity = (cartId, productId, quantity) => {
        return this.dao.updateProductQuantity(cartId, productId, quantity)
    }

    removeProduct = (cartId, productId) => {
        return this.dao.removeProduct(cartId, productId)
    }

    clearCart = (cartId) => {
        return this.dao.clearCart(cartId)
    }

    delete = (id) => {
        return this.dao.delete(id)
    }
}
