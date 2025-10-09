export default class TicketRepository {
    constructor(dao) {
        this.dao = dao;
    }

    create(ticket) {
        return this.dao.create(ticket);
    }
}
