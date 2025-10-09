import userModel from "../models/user.model.js";

export default class UserDAO {
    getAll = async () => {
        const users = await userModel.find().lean();
        return users;
    };

    getById = async (id) => {
        const user = await userModel.findById(id).populate("cart").lean();
        return user;
    };

    getByEmail = async (email) => {
        const user = await userModel.findOne({ email }).populate("cart").lean();
        return user;
    };

    create = async (user) => {
        const created = await userModel.create(user);
        return created;
    };

    update = async (id, payload) => {
        const updated = await userModel
            .findByIdAndUpdate(id, payload, { new: true })
            .populate("cart")
            .lean();
        return updated;
    };
}
