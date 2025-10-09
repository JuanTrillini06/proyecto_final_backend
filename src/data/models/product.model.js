import mongoose from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

const productCollection = "products";

const StingUnicoRequerido = {
    type: String,
    unique: true,
    required: true
};

const StringNoUnicoRequerido = {
    type: String,
    required: true
};

const productSchema = new mongoose.Schema(
    {
        title: StringNoUnicoRequerido,
        description: StringNoUnicoRequerido,
        price: {
            type: Number,
            required: true,
            min: 0
        },
        thumbnail: String,
        code: StingUnicoRequerido,
        stock: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: Boolean,
            default: true
        },
        category: StringNoUnicoRequerido
    },
    {
        timestamps: true
    }
);

productSchema.plugin(aggregatePaginate);

const productModel = mongoose.model(productCollection, productSchema);
export default productModel;
