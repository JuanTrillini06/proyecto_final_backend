import { verifyToken } from "../utils.js";
import { userService } from "../services/user.service.js";

export const attachCurrentUser = async (req, res, next) => {
  try {
    const token = req.cookies?.jwtCookieToken;
    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    const user = await userService.getById(decoded._id);

    if (user) {
      req.user = user;
    }

    // Siempre continuar con el flujo de middlewares
    return next();
  } catch (error) {
    res.clearCookie("jwtCookieToken");
    console.warn("Token de usuario inválido o expirado.", error.message);
    return next(error);
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({
      status: "error",
      message: "No autorizado."
    });
  }
  return next();
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).send({
      status: "error",
      message: "Acceso denegado."
    });
  }
  return next();
};
