import productServiceDAO from "../data/dao/product.dao.js";

import productRepository from "../repository/product.repository.js";

const ProductServiceDAO = new productServiceDAO();

export const productService = new productRepository(ProductServiceDAO);