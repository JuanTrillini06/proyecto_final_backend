import express from "express";
import cors from "cors";

import __dirname from "./utils.js";
import handlebars from "express-handlebars";
import passport from "passport";
import cookieParser from "cookie-parser";
import initializePassport from "./config/passport.config.js";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUiExpress from "swagger-ui-express";

import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/carts.routes.js";
import authRouter from "./routes/auth.routes.js";
import viewsRouter from "./routes/views.routes.js";
import mocksRouter from "../test/routes/mocks.router.js"

import { attachCurrentUser } from "./middlewares/auth.js";

const app = express();


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

// Serve selected node_modules assets (Toastify) under /vendor
app.use(
  "/vendor/toastify",
  express.static(__dirname + "/../node_modules/toastify-js")
);

initializePassport();
app.use(passport.initialize());
app.use(attachCurrentUser);

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "Documentación de proyecto final",
      description: "Proyecto final integral de backend",
      version: "1.0.0",
    },
  },
  apis: [`${__dirname}/docs/**/*.yaml`],
};
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));


app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/api/auth", authRouter);
app.use("/", viewsRouter);

// Ruta de mocks para test
app.use("/api/mocks", mocksRouter);

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

export default app;