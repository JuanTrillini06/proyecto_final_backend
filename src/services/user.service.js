import UserDAO from "../data/dao/user.dao.js";
import userRepository from "../repository/user.repository.js";
import { createHash, isValidPassword } from "../utils.js";
import { cartService } from "./cart.service.js";

class UserService {
    constructor() {
        const userDao = new UserDAO();
        this.userRepository = new userRepository(userDao);
    }

    getAll() {
        return this.userRepository.getAll();
    }

    getById(id) {
        return this.userRepository.getById(id);
    }

    getByEmail(email) {
        return this.userRepository.getByEmail(email);
    }

    async register(userData) {
        const existing = await this.getByEmail(userData.email);
        if (existing) {
            const error = new Error("El correo ya se encuentra registrado.");
            error.code = "USER_EXISTS";
            throw error;
        }

        const hashedPassword = createHash(userData.password);
        const userToCreate = {
            ...userData,
            password: hashedPassword
        };
        const created = await this.userRepository.create(userToCreate);
        return created.toObject ? created.toObject() : created;
    }

    async registerWithCart(userData) {
        const user = await this.register(userData);
        const cart = await cartService.createCart({ userId: user._id });
        const updatedUser = await this.userRepository.update(user._id, {
            cart: cart._id
        });
        return {
            user: updatedUser,
            cart
        };
    }

    async validateUserCredentials(email, password) {
        const user = await this.getByEmail(email);
        if (!user) {
            const error = new Error("Credenciales inválidas.");
            error.code = "USER_NOT_FOUND";
            throw error;
        }

        const validPassword = isValidPassword(user, password);
        if (!validPassword) {
            const error = new Error("Credenciales inválidas.");
            error.code = "INVALID_PASSWORD";
            throw error;
        }

        return user;
    }

    updateUserCart(userId, cartId) {
        return this.userRepository.update(userId, { cart: cartId });
    }
}

export const userService = new UserService();
