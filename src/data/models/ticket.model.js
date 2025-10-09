import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        purchase_datetime: {
            type: Date,
            default: Date.now
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        purchaser: {
            type: String,
            required: true
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
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0
                }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ticketModel = mongoose.model(ticketCollection, ticketSchema);
export default ticketModel;
