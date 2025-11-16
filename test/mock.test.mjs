// test/mock.test.mjs
import request from "supertest";
import { expect } from "chai";
import mongoose from "mongoose";

import app from "../src/app.js";
import config from "../src/config/config.js";
import userModel from "../src/data/models/user.model.js";
import productModel from "../src/data/models/product.model.js";

before(async function () {
  // Dar más tiempo para conectar al cluster de Mongo Atlas
  this.timeout(20000);

  // Conectar a la base de datos de TEST definida en .env.test
  await mongoose.connect(config.mongoUrl, {
    w: 1,
  });
});

describe("Mocking endpoints", function () {
  // Aumentar timeout para todos los tests de este bloque
  this.timeout(20000);

  before(async () => {
    await userModel.deleteMany({});
    await productModel.deleteMany({});
  });

  it("POST /api/mocks/generateData genera e inserta usuarios y productos", async () => {
    const res = await request(app)
      .post("/api/mocks/generateData")
      .send({ users: 10, products: 13 });

    expect(res.status).to.equal(200);
    expect(res.body.usersInserted).to.equal(10);
    expect(res.body.productsInserted).to.equal(13);
  });

  it("GET /api/auth/users y /api/products devuelven datos generados", async () => {
    const usersRes = await request(app).get("/api/auth/users");
    const productsRes = await request(app).get("/api/products");

    expect(usersRes.status).to.equal(200);
    expect(usersRes.body.payload).to.be.an("array");
    expect(usersRes.body.payload.length).to.be.at.least(1);

    expect(productsRes.status).to.equal(200);
    expect(productsRes.body.payload).to.be.an("array");
    expect(productsRes.body.payload.length).to.be.at.least(1);
  });
});
