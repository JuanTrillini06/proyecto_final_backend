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

describe("Registro vía API - /api/auth/register (uno a uno)", function () {
  this.timeout(20000);

  beforeEach(async () => {
    // Limpiar colecciones relacionadas antes de cada test
    await Promise.all([
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      cartModel.deleteMany({}),
      ticketModel.deleteMany({})
    ]);
  });

  after(async () => {
    // Limpiar colecciones relacionadas (no cerrar la conexión aquí)
    await Promise.all([
      userModel.deleteMany({}),
      productModel.deleteMany({}),
      cartModel.deleteMany({}),
      ticketModel.deleteMany({})
    ]);
  });

  it("debe registrar múltiples usuarios haciendo POST uno a uno", async () => {
    const usersCount = 5;
    const plainUsers = [];
    for (let i = 0; i < usersCount; i++) {
      plainUsers.push({
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 80 }),
        password: `Password!${i}123`
      });
    }

    for (const user of plainUsers) {
      const res = await request(app).post("/api/auth/register").send(user);
      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("payload");
      expect(res.body.payload).to.have.property("email", user.email);

      // Verificar que el usuario fue persistido en la DB
      const dbUser = await userModel.findOne({ email: user.email }).lean();
      expect(dbUser).to.exist;
      expect(dbUser).to.have.property("email", user.email);
    }

    // Comprobar que la cantidad total de usuarios en la colección coincide
    const totalUsers = await userModel.countDocuments();
    expect(totalUsers).to.equal(usersCount);
  });
});
