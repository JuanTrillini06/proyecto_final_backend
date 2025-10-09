import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
            index: true
        },
        products: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const cartModel = mongoose.model(cartCollection, cartSchema);
export default cartModel;
