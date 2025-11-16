import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import app from "../src/app.js";
import config from "../src/config/config.js";
import userModel from "../src/data/models/user.model.js";
import productModel from "../src/data/models/product.model.js";
import cartModel from "../src/data/models/cart.model.js";
import ticketModel from "../src/data/models/ticket.model.js";

before(async function () {
  this.timeout(20000);
  await mongoose.connect(config.mongoUrl, { w: 1 });
});

describe("Escenarios de fallo", function () {
  this.timeout(10000);

  beforeEach(async () => {
    await Promise.all([
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      cartModel.deleteMany({}),
      ticketModel.deleteMany({})
    ]);
  });

  after(async () => {
    // limpiar collections, no cerrar conexión (zzz teardown manejará cierre)
    await Promise.all([
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      cartModel.deleteMany({}),
      ticketModel.deleteMany({})
    ]);
  });

  it("login con contraseña incorrecta devuelve 401", async () => {
    const agent = request.agent(app);
    const user = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      password: "CorrectPassword123!"
    };

    // Registrar correctamente
    const reg = await agent.post("/api/auth/register").send(user);
    expect(reg.status).to.equal(201);

    // Intentar login con contraseña incorrecta
    const loginRes = await agent.post("/api/auth/login").send({ email: user.email, password: "WrongPass!" });
    expect(loginRes.status).to.equal(401);
    expect(loginRes.body).to.have.property("message").that.includes("Credenciales inválidas");
  });

  it("usuario no-admin recibe 403 al intentar crear producto", async () => {
    const agent = request.agent(app);
    const user = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      password: "UserPass123!"
    };

    const reg = await agent.post("/api/auth/register").send(user);
    expect(reg.status).to.equal(201);

    const product = {
      title: "Producto prueba",
      description: "desc",
      price: 10,
      stock: 5,
      code: "PR-${Date.now()}",
      category: "test",
      thumbnails: []
    };

    const res = await agent.post("/api/products").send(product);
    expect(res.status).to.equal(403);
    expect(res.body).to.have.property("message");
  });

  it("purchase falla con stock insuficiente y devuelve failedProducts", async () => {
    const agent = request.agent(app);

    // Crear producto con stock 1
    const prod = await productModel.create({
      title: "LowStock",
      description: "low stock",
      price: 50,
      stock: 1,
      code: "LSK1",
      category: "test",
      thumbnails: []
    });

    // Registrar usuario y obtener cart via cookie
    const user = {
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      age: faker.number.int({ min: 18, max: 80 }),
      password: "PwdStock123!"
    };

    const reg = await agent.post("/api/auth/register").send(user);
    expect(reg.status).to.equal(201);
    const cookies = reg.headers["set-cookie"] || [];
    const cartCookie = cookies.find((c) => c.startsWith("cartId="));
    expect(cartCookie).to.exist;
    const cartId = cartCookie.split(";")[0].split("=")[1];

    // Añadir cantidad 2 (mayor al stock 1)
    const addRes = await agent.post(`/api/carts/products/${prod._id}`).send({ quantity: 2 });
    expect(addRes.status).to.equal(200);

    // Intentar purchase
    const purRes = await agent.post(`/api/carts/${cartId}/purchase`).send();
    expect(purRes.status).to.equal(400);
    expect(purRes.body).to.have.property("failedProducts");
    expect(purRes.body.failedProducts).to.be.an("array").that.is.not.empty;
    const failed = purRes.body.failedProducts[0];
    expect(failed).to.have.property("reason").that.includes("Stock insuficiente");
  });
});
