const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  inStock: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    required: true,
  },
});

const productModel = mongoose.model("Product", productSchema);
module.exports = productModel;