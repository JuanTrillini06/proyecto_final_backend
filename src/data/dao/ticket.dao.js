import ticketModel from "../models/ticket.model.js";

export default class TicketDAO {
    create = async (ticket) => {
        const created = await ticketModel.create(ticket);
        return created.toObject ? created.toObject() : created;
    };
}
