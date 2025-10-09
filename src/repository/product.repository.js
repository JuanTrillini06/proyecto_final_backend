export default class productRepository {
    constructor(dao) {
        this.dao = dao
    }

    getAll = (filters) => {
        return this.dao.getAll(filters)
    }

    getById = (id) => {
        return this.dao.getById(id)
    }

    save = (product) => {
        return this.dao.save(product)
    }

    update = (id, product) => {
        return this.dao.update(id, product)
    }

    delete = (id) => {
        return this.dao.delete(id)
    }
}
