import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createHash = (password) =>
    bcrypt.hashSync(password, bcrypt.genSaltSync(10));

export const isValidPassword = (user, password) =>
    bcrypt.compareSync(password, user.password);

export const PRIVATE_KEY = "JJT06PrivateK3Y";

const buildJwtPayload = (user) => ({
    _id: user._id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    cart: user.cart ? user.cart : null
});

export const generateJWToken = (user) =>
    jwt.sign(buildJwtPayload(user), PRIVATE_KEY, {
        expiresIn: "2h"
    });

export const verifyToken = (token) => jwt.verify(token, PRIVATE_KEY);

export const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user, info) {
            if (err) return next(err);
            if (!user) {
                return res.status(401).send({
                    status: "error",
                    error: info?.messages ? info.messages : info?.toString()
                });
            }
            req.user = user;
            next();
        })(req, res, next);
    };
};

export default __dirname;
