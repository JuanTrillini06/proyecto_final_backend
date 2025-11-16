import mongoose from "mongoose";
import config from "../src/config/config.js";
import userModel from "../src/data/models/user.model.js";
import productModel from "../src/data/models/product.model.js";
import cartModel from "../src/data/models/cart.model.js";
import ticketModel from "../src/data/models/ticket.model.js";

before(async function () {
  this.timeout(20000);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(config.mongoUrl, { w: 1 });
  }
});

after(async () => {
  // Limpiar colecciones finales y cerrar conexión
  await Promise.all([
    userModel.deleteMany({}),
    productModel.deleteMany({}),
    cartModel.deleteMany({}),
    ticketModel.deleteMany({})
  ]);
  await mongoose.connection.close();
});
