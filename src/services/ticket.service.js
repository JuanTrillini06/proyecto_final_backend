import TicketDAO from "../data/dao/ticket.dao.js";
import ticketRepository from "../repository/ticket.repository.js";

class TicketService {
    constructor() {
        const ticketDao = new TicketDAO();
        this.ticketRepository = new ticketRepository(ticketDao);
    }

    create(ticket) {
        return this.ticketRepository.create(ticket);
    }
}

export const ticketService = new TicketService();
