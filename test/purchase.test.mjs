import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import app from "../src/app.js";
import config from "../src/config/config.js";
import productModel from "../src/data/models/product.model.js";
import cartModel from "../src/data/models/cart.model.js";
import ticketModel from "../src/data/models/ticket.model.js";
import userModel from "../src/data/models/user.model.js";

before(async function () {
  this.timeout(20000);
  await mongoose.connect(config.mongoUrl, { w: 1 });
});

describe("Compra (purchase) en múltiples carritos", function () {
  this.timeout(30000);

  const products = [];
  const sessions = [];
  const purchases = 3;

  beforeEach(async () => {
    // Limpiar colecciones relacionadas
    await Promise.all([
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      cartModel.deleteMany({}),
      ticketModel.deleteMany({})
    ]);

    // Resetear lista local de productos y crear productos de prueba
    products.length = 0;
    for (let i = 0; i < 5; i++) {
      const p = {
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.number.int({ min: 10, max: 200 }),
        stock: faker.number.int({ min: 5, max: 20 }),
        code: faker.string.alphanumeric(8),
        category: faker.commerce.department(),
        thumbnails: []
      };
      products.push(p);
    }

    await productModel.insertMany(products);
    // reset sessions array
    sessions.length = 0;
  });

  after(async () => {
    await Promise.all([
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      cartModel.deleteMany({}),
      ticketModel.deleteMany({})
    ]);
  });

  it("debe crear varios carts con productos y ejecutar purchase correctamente", async () => {
    // Obtener productos desde la DB (con _id)
    const dbProducts = await productModel.find({}).lean();
    expect(dbProducts.length).to.be.at.least(1);

    for (let i = 0; i < purchases; i++) {
      const agent = request.agent(app);

      // Registrar usuario para esta sesión - esto crea cart y cookie jwt
      const user = {
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 80 }),
        password: `Pwd!${i}abc123`
      };

      const regRes = await agent.post("/api/auth/register").send(user);
      expect(regRes.status).to.equal(201);

      // Obtener cartId desde cookie
      const cookies = regRes.headers["set-cookie"] || [];
      const cartCookie = cookies.find((c) => c.startsWith("cartId="));
      expect(cartCookie, "cartId cookie presente").to.exist;
      const cartId = cartCookie.split(";")[0].split("=")[1];

      // Añadir entre 1 y 3 productos únicos al carrito (evitar compartir el mismo producto entre sesiones)
      const itemsToAdd = faker.number.int({ min: 1, max: 3 });
      for (let j = 0; j < itemsToAdd; j++) {
        const idx = (i + j) % dbProducts.length;
        const product = dbProducts[idx];
        const quantity = faker.number.int({ min: 1, max: Math.min(3, product.stock) });
        const addRes = await agent.post(`/api/carts/products/${product._id}`).send({ quantity });
        expect(addRes.status).to.equal(200);
      }

      sessions.push({ agent, cartId });
    }

    // Ejecutar purchase para cada session
    for (const s of sessions) {
      const { agent, cartId } = s;
      const res = await agent.post(`/api/carts/${cartId}/purchase`).send();
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("payload");
      const ticket = res.body.payload;
      expect(ticket).to.have.property("code");
      expect(ticket).to.have.property("amount");
      expect(ticket).to.have.property("products");
      expect(ticket.products.length).to.be.at.least(1);

      // Verificar que el carrito quedó vacío
      const cartAfter = await cartModel.findById(cartId).lean();
      expect(cartAfter).to.exist;
      expect(cartAfter.products).to.be.an("array").that.is.empty;
    }

    // Verificar tickets creados
    const ticketCount = await ticketModel.countDocuments();
    expect(ticketCount).to.equal(purchases);
  });
});
