const mongoose = require("mongoose");

let productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    stock: {
        type: Number,
    },
    category: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false
        }
});

let productModel = mongoose.model("Product", productSchema);

module.exports = productModel;
























