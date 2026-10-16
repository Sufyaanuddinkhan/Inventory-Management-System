require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const productModel = require("./productModel");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});


// Create a product
app.post("/products", async (req, res) => {
  try {
    const { name, id, sku, inStock, price, category, status } = req.body;

    const createProduct = await productModel.create({
      name,
      id,
      sku,
      inStock,
      price,
      category,
      status,
    });

    res.status(201).json({
      msg: "Product added successfully",
      createProduct,
    });
  } catch (error) {
    console.error("Product creation error:", error.message);

    res.status(500).json({
      msg: "Failed to create product",
      error: error.message,
    });
  }
});

// list of products

app.get("/products", async (req, res) => {
  try {
    const products = await productModel.find();
    res.status(200).json({
      msg: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({
      msg: "Failed to fetch products",
      error: error.message,
    });
  }
});

// edit an existing product

app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, inStock, price, category, status } = req.body;

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      {
        name,
        sku,
        inStock,
        price,
        category,
        status,
      },
      { new: true },
    );

    if (!updatedProduct) {
      return res.status(404).json({
        msg: "Product not found",
      });
    }

    res.status(200).json({
      msg: "Product updated successfully",
      updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({
      msg: "Failed to update product",
      error: error.message,
    });
  }
});

// view product details

app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        msg: "Product not found",
      });
    }

    res.status(200).json({
      msg: "Product details fetched successfully",
      product,
    });
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    res.json({
      msg: "Failed to fetch product details",
      error: error.message,
    });
  }
});

// delete the product

app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await productModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        msg: "Product not found",
      });
    }

    res.status(200).json({
      msg: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({
      msg: "Failed to delete product",
      error: error.message,
    });
  }
});

// Connect to MongoDB before starting the server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
