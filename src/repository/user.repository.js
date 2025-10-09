export default class UserRepository {
    constructor(dao) {
        this.dao = dao;
    }

    getAll() {
        return this.dao.getAll();
    }

    getById(id) {
        return this.dao.getById(id);
    }

    getByEmail(email) {
        return this.dao.getByEmail(email);
    }

    create(user) {
        return this.dao.create(user);
    }

    update(id, payload) {
        return this.dao.update(id, payload);
    }
}
