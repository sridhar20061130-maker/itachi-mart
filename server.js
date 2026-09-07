const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Product = require("./models/product");
const Order = require("./models/order");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

console.log("=================================");
console.log("       ITACHI MART SERVER");
console.log("=================================");

console.log(
  "MongoDB URI loaded:",
  process.env.MONGODB_URI ? "true" : "false"
);

// ==============================
// MONGODB CONNECTION
// ==============================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("MongoDB connection error:");
    console.error(error.message);
  });

// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// =====================================================
// PRODUCT APIs
// =====================================================

// GET ALL PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      products: products
    });

  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load products"
    });
  }
});


// ADD PRODUCT
app.post("/api/products", async (req, res) => {
  try {

    const {
      name,
      description,
      price,
      category,
      image,
      stock
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all product fields"
      });
    }

    const product = new Product({
      name: name,
      description: description,
      price: Number(price),
      category: category,
      image: image,
      stock: Number(stock)
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: savedProduct
    });

  } catch (error) {

    console.error("Add product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add product"
    });
  }
});


// UPDATE PRODUCT
app.put("/api/products/:id", async (req, res) => {
  try {

    const {
      name,
      description,
      price,
      category,
      image,
      stock
    } = req.body;

    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all product fields"
      });
    }

    const updatedProduct =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: name,
          description: description,
          price: Number(price),
          category: category,
          image: image,
          stock: Number(stock)
        },
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedProduct) {

      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    }

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {

    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product"
    });
  }
});


// DELETE PRODUCT
app.delete("/api/products/:id", async (req, res) => {
  try {

    const product =
      await Product.findByIdAndDelete(
        req.params.id
      );

    if (!product) {

      return res.status(404).json({
        success: false,
        message: "Product not found"
      });

    }

    res.json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete product error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete product"
    });
  }
});


// =====================================================
// ORDER APIs
// =====================================================

// CREATE ORDER
app.post("/api/orders", async (req, res) => {
  try {

    const {
      customerName,
      email,
      items,
      totalAmount
    } = req.body;

    if (
      !customerName ||
      !email ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      totalAmount === undefined
    ) {

      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });

    }

    const order = new Order({
      customerName: customerName,
      email: email,
      items: items,
      totalAmount: Number(totalAmount),
      status: "Pending"
    });

    const savedOrder =
      await order.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });

  } catch (error) {

    console.error(
      "Create order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create order"
    });
  }
});


// GET ALL ORDERS
app.get("/api/orders", async (req, res) => {
  try {

    const orders =
      await Order.find().sort({
        createdAt: -1
      });

    res.json({
      success: true,
      orders: orders
    });

  } catch (error) {

    console.error(
      "Get orders error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load orders"
    });
  }
});


// GET SINGLE ORDER
app.get("/api/orders/:id", async (req, res) => {
  try {

    const order =
      await Order.findById(
        req.params.id
      );

    if (!order) {

      return res.status(404).json({
        success: false,
        message: "Order not found"
      });

    }

    res.json({
      success: true,
      order: order
    });

  } catch (error) {

    console.error(
      "Get order error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load order"
    });
  }
});


// UPDATE ORDER STATUS
app.put(
  "/api/orders/:id/status",
  async (req, res) => {

    try {

      const {
        status
      } = req.body;

      const allowedStatuses = [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled"
      ];

      if (
        !allowedStatuses.includes(status)
      ) {

        return res.status(400).json({
          success: false,
          message: "Invalid order status"
        });

      }

      const order =
        await Order.findByIdAndUpdate(
          req.params.id,
          {
            status: status
          },
          {
            new: true
          }
        );

      if (!order) {

        return res.status(404).json({
          success: false,
          message: "Order not found"
        });

      }

      res.json({
        success: true,
        message: "Order status updated",
        order: order
      });

    } catch (error) {

      console.error(
        "Update order status error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to update order status"
      });
    }
  }
);



// =====================================================
// ADMIN LOGIN
// =====================================================

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  const validUsername = process.env.ADMIN_USERNAME;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return res.status(500).json({
      success: false,
      message: "Admin credentials are not configured in .env"
    });
  }

  if (username !== validUsername || password !== validPassword) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password"
    });
  }

  // Local-development login marker. For production, use a proper
  // session/JWT authentication system before deployment.
  return res.json({
    success: true,
    message: "Login successful",
    token: "itachi-admin-session"
  });
});


// =====================================================
// SERVER
// =====================================================

app.listen(PORT, () => {

  console.log(
    `Server running at http://localhost:${PORT}`
  );

});