import passport from "passport";
import passportJwt from "passport-jwt";
import { PRIVATE_KEY } from "../utils.js";
import userModel from "../data/models/user.model.js";

const JWTStrategy = passportJwt.Strategy;

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies.jwtCookieToken;
    }
    return token;
};

const initializePassport = () => {
    passport.use(
        "jwt",
        new JWTStrategy(
            {
                jwtFromRequest: cookieExtractor,
                secretOrKey: PRIVATE_KEY,
                passReqToCallback: false
            },
            async (jwtPayload, done) => {
                try {
                    if (!jwtPayload?._id) {
                        return done(null, false);
                    }
                    const user = await userModel
                        .findById(jwtPayload._id)
                        .populate("cart")
                        .lean();
                    if (!user) {
                        return done(null, false);
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userModel.findById(id).populate("cart").lean();
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
};

export const passportStrategies = {
    jwt: "jwt"
};

export { cookieExtractor };

export default initializePassport;
