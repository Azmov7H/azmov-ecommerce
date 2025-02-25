import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    desc: { type: String, required: true }
});

const Product = mongoose.model("aproducts", productSchema);

export default Product;
