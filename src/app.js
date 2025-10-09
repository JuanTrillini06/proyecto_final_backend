import express from "express";
import MongoSingleton from "./config/mongodb-singleton.js";
import cors from "cors";
import config from "./config/config.js";
import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import passport from "passport";
import cookieParser from "cookie-parser";
import initializePassport from "./config/passport.config.js";

import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/carts.routes.js";
import authRouter from "./routes/auth.routes.js";
import viewsRouter from "./routes/views.routes.js";

import { attachCurrentUser } from "./middlewares/auth.js";

const app = express();
const PORT = config.port;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

const hbsHelpers = {
    eq: (a, b) => String(a) === String(b),
    multiply: (a, b) => (Number(a) || 0) * (Number(b) || 0),
    formatCurrency: (value) => (Number(value) || 0).toFixed(2)
};

app.engine(
    "handlebars",
    handlebars.engine({
        helpers: hbsHelpers
    })
);
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

initializePassport();
app.use(passport.initialize());
app.use(attachCurrentUser);

app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/auth", authRouter);
app.use("/", viewsRouter);

// Manejador de errores global (siempre al final de app.js)
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);

  // Si la request viene de fetch/axios (espera JSON)
  const wantsJSON =
    req.xhr ||
    req.headers.accept?.includes("application/json") ||
    req.headers["content-type"] === "application/json";

  if (wantsJSON) {
    return res.status(500).json({
      status: "error",
      message: err.message || "Ocurrió un error en el servidor."
    });
  }

  // Si la request viene de navegador (espera HTML)
  return res.status(500).render("error", {
    message: "Ocurrió un error en el servidor."
  });
});

app.listen(PORT, () => {
    console.log(`El servidor corre en el puerto: ${PORT}`);
});

const mongoInstance = async () => {
    try {
        await MongoSingleton.getInstance();
    } catch (error) {
        console.error(error);
        process.exit();
    }
};
mongoInstance();

