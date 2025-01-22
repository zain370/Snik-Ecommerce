const express = require("express");
const mongoose = require("mongoose");
let Product = require("../../models/Product");
let router = express.Router();

// router.get("/", async (req, res) => {
//   try {
//     let products;
//     const category = req.query.category;
    
//     if (category) {
//       // If category query parameter is provided, filter products by category
//       products = await Product.find({ category: category });
//     } else {
//       // If no category query parameter is provided, fetch all products
//       products = await Product.find();
//     }

//     res.send(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


router.get("/", async (req, res) => {
  let products = await Product.find();
  res.send(products);
});



router.get("/:id", async (req, res) => {
  let product = await Product.findById(req.params.id);
  res.send(product);
});




// POST route to add a new product
router.post("/", async (req, res) => {
    try {
      // Create a new product instance based on the request body
      const newProduct = new Product({
        name: req.body.name,
        // sku: req.body.sku,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        image: req.body.image,
        description: req.body.description
      });
      const savedProduct = await newProduct.save();
      
      // Redirect back to the add-product page
      res.redirect("/add-product");
    } catch (err) {
      // If an error occurs, send an error response
      res.status(400).json({ message: err.message });
    }
  });



router.put("/:id", async (req, res) => {
  let product = await Product.findById(req.params.id);
  product.name = req.body.name;
  // product.sku = req.body.sku;
  product.price = req.body.price;
  product.stock = req.body.stock;
  product.category = req.body.category;
  await product.save();
  res.send(product);
});

router.delete("/:id", async (req, res) => {
  let product = await Product.findByIdAndDelete(req.params.id);

  res.send(product);
});



module.exports = router;
