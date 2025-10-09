import { productService } from "../services/product.service.js";

// GET ALL
export const getProducts = async (req, res) => {
    try {
        const {
            limit,
            page,
            sort,
            category,
            status,
            title
        } = req.query;

        const result = await productService.getAll({
            limit,
            page,
            sort,
            category,
            status,
            title
        });

        const baseQuery = new URLSearchParams();
        if (limit) baseQuery.append("limit", limit);
        if (sort) baseQuery.append("sort", sort);
        if (category) baseQuery.append("category", category);
        if (typeof status !== "undefined") {
            baseQuery.append("status", status);
        }
        if (title) baseQuery.append("title", title);

        res.send({
            status: "success",
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage
                ? `/api/products?page=${result.prevPage}${
                      baseQuery.toString()
                          ? `&${baseQuery.toString()}`
                          : ""
                  }`
                : null,
            nextLink: result.hasNextPage
                ? `/api/products?page=${result.nextPage}${
                      baseQuery.toString()
                          ? `&${baseQuery.toString()}`
                          : ""
                  }`
                : null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo obtener los productos."
        });
    }
};

// GET BY ID
export const getProductById = async (req, res) => {
    try {
        const id = req.params.pid;
        const product = await productService.getById(id);
        if (!product) {
            return res.status(404).send({
                status: "error",
                message: "Producto no encontrado."
            });
        }
        res.send({ status: "success", payload: product });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo obtener el producto."
        });
    }
};

// POST
export const saveProduct = async (req, res) => {
    try {
        const newProduct = await productService.save(req.body);
        res.status(201).send({ status: "success", payload: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo guardar el producto."
        });
    }
};

// PUT
export const updateProduct = async (req, res) => {
    try {
        const id = req.params.pid;
        const product = await productService.update(id, req.body);
        if (!product) {
            return res.status(404).send({
                status: "error",
                message: "Producto no encontrado."
            });
        }
        res.send({ status: "success", payload: product });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo actualizar el producto."
        });
    }
};

// DELETE
export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.pid;
        const product = await productService.delete(id);
        if (!product) {
            return res.status(404).send({
                status: "error",
                message: "Producto no encontrado."
            });
        }
        res.send({
            status: "success",
            message: "Producto eliminado correctamente"
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            error: error.message,
            message: "No se pudo eliminar el producto."
        });
    }
};
