import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema(
    {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        age: {
            type: Number,
            min: 0
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user"
        },
        cart: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "carts",
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const userModel = mongoose.model(userCollection, userSchema);
export default userModel;
