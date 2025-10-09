import productModel from "../models/product.model.js";

export default class ProductDAO {
    getAll = async (filters = {}) => {
        const {
            page = 1,
            limit = 9,
            sort,
            category,
            status,
            title
        } = filters;

        const parsedLimit = Number(limit) > 0 ? Number(limit) : 9;
        const parsedPage = Number(page) > 0 ? Number(page) : 1;

        const matchStage = {};
        if (category) {
            matchStage.category = category;
        }

        if (typeof status !== "undefined") {
            if (status === "true" || status === true) {
                matchStage.status = true;
            } else if (status === "false" || status === false) {
                matchStage.status = false;
            }
        }

        if (title) {
            matchStage.title = { $regex: title, $options: "i" };
        }

        const pipeline = [];

        if (Object.keys(matchStage).length) {
            pipeline.push({ $match: matchStage });
        }

        const sortStage = {};
        if (sort === "asc" || sort === "desc") {
            sortStage.price = sort === "asc" ? 1 : -1;
        } else {
            sortStage.createdAt = -1;
        }

        pipeline.push({ $sort: sortStage });

        const aggregate = productModel.aggregate(pipeline);

        const paginated = await productModel.aggregatePaginate(aggregate, {
            limit: parsedLimit,
            page: parsedPage
        });

        return paginated;
    };

    getById = async (id) => {
        const result = await productModel.findById(id).lean();
        return result;
    };

    save = async (product) => {
        const result = await productModel.create(product);
        return result;
    };

    update = async (id, product) => {
        const result = await productModel.findByIdAndUpdate(id, product, {
            new: true
        });
        return result;
    };

    delete = async (id) => {
        const result = await productModel.findByIdAndDelete(id);
        return result;
    };
}
