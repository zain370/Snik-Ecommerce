const express = require("express");
const router = express.Router();
let Product = require("../models/Product");
const Cart = require('../models/Cart');

let checkSessAuth = require("../middlewares/checkSessAuth");


// Helper function to add search term to user's session
function addSearchTermToSession(req, searchTerm) {
    if (!req.session.previousSearches) {
        req.session.previousSearches = [];
    }
    if (!req.session.previousSearches.includes(searchTerm)) {
        req.session.previousSearches.push(searchTerm);
    }
}

////////////////////// FINAL LAB EXAM ROUTES  /////////////////////////////////
// Homepage route
router.get("/", async (req, res) => {
    try {
        const limit = 8;
        const searchQuery = req.query.query || '';
        const pageNumber = parseInt(req.query.page) || 1;
        const skip = (pageNumber - 1) * limit;

        // Query for featured products
        let featuredQuery = { isFeatured: true };
        if (searchQuery) {
            featuredQuery.name = new RegExp(searchQuery, 'i'); // Case-insensitive regex search
        }

        const featuredProducts = await Product.find(featuredQuery).limit(limit).skip(skip);
        const featuredProductCount = await Product.countDocuments(featuredQuery);

        // Query for all products
        let allProductsQuery = {};
        if (searchQuery) {
            allProductsQuery.name = new RegExp(searchQuery, 'i'); // Case-insensitive regex search
        }

        const allProducts = await Product.find(allProductsQuery).limit(limit).skip(skip);
        const allProductCount = await Product.countDocuments(allProductsQuery);

        // Save search query to session
        if (searchQuery) {
            if (!req.session.previousSearches) {
                req.session.previousSearches = [];
            }
            if (!req.session.previousSearches.includes(searchQuery)) {
                req.session.previousSearches.push(searchQuery);
            }
        }

        res.render("homepage", { 
            title: "Homepage", 
            featuredProducts, 
            allProducts, 
            pageNumber, 
            featuredProductCount, 
            allProductCount, 
            limit, 
            searchQuery,
            previousSearches: req.session.previousSearches || []
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});



// View product route
router.get("/view-product/:productId", async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Add productId to the session's visitedProducts array
        if (!req.session.visitedProducts) {
            req.session.visitedProducts = [];
        }
        if (!req.session.visitedProducts.includes(productId)) {
            req.session.visitedProducts.push(productId);
        }

        res.render("view-product", { title: product.name, product });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

// Visited products route
router.get("/visited-products", async (req, res) => {
    try {
        const visitedProductIds = req.session.visitedProducts || [];
        
        // Fetch products that match the visited product IDs
        const visitedProducts = await Product.find({ _id: { $in: visitedProductIds } });

        res.render("visited-products", { 
            title: "Visited Products", 
            visitedProducts 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

















// Additional route to handle search requests specifically
router.get("/search", async (req, res) => {
    try {
        const searchQuery = req.query.query;
        if (!searchQuery) {
            return res.redirect("/");
        }
        return res.redirect(`/?query=${searchQuery}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});








router.get('/cart', checkSessAuth, async (req, res) => {
    const userId = req.session.user.id;
    try {
        const cartItems = await Cart.find({ userId }).populate('productId');
        res.render("cart", { title: "Cart", cartItems }); // Pass cartItems to the view
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get("/men-collection", async (req, res) => {
    try {
        const products = await Product.find({ category: "men" });
        res.render("men-collection", { title: "Men Collection", products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/women-collection", async (req, res) => {
    try {
        const products = await Product.find({ category: "women" });
        res.render("women-collection", { title: "Women Collection", products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/sports-collection", async (req, res) => {
    try {
        const products = await Product.find({ category: "sports" });
        res.render("sports-collection", { title: "Sports Collection", products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


router.get("/contact", checkSessAuth, (req, res) => {
    res.render("contact", { title: "Contact Us" })
})


router.get("/add-product", checkSessAuth, (req, res) => {
    res.render("add-product", { title: "Admin Panel" })
})




router.get("/about-us", checkSessAuth, (req, res) => {
    res.render("about-us", { title: "About Us" })
})

router.get("/", async (req, res) => {
    try {
        const limit = 8;
        const products = await Product.find().limit(limit);
        const productCount = await Product.countDocuments();
        res.render("homepage", { title: "Homepage", products, pageNumber: 1, productCount, limit });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});

router.get("/:pageNumber", async (req, res) => {
    try {
        let pageNumber = parseInt(req.params.pageNumber, 10);
        if (!pageNumber || pageNumber < 1) {
            pageNumber = 1;
        }

        const limit = 8;
        const skip = (pageNumber - 1) * limit;
        const products = await Product.find().limit(limit).skip(skip);
        const productCount = await Product.countDocuments();

        res.render("homepage", { title: "Homepage", products, pageNumber, productCount, limit });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});





////////////////////  CART ROUTES  \\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////  CART ROUTES  \\\\\\\\\\\\\\\\\\\\\\\\\\


router.post('/cart/add', checkSessAuth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user.id; // Get userId from session

    try {
        // Fetch the product information
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Create or update the cart item
        let cartItem = await Cart.findOne({ userId, productId });
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cartItem = new Cart({ userId, productId });
        }
        await cartItem.save();

        // Return success response with product name
        res.json({ success: true, productName: product.name });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get('/cart/count', checkSessAuth, async (req, res) => {
    const userId = req.session.user.id; // Get userId from session
    try {
        const cartItems = await Cart.find({ userId });
        let totalCount = 0;
        cartItems.forEach(item => {
            totalCount += item.quantity;
        });
        res.json({ count: totalCount });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ count: 0 });
    }
});



router.post('/checkout', checkSessAuth, async (req, res) => {
    const userId = req.session.user.id;
    try {
        const cartItems = await Cart.find({ userId }).populate('productId');
        let outOfStockItems = [];
        for (let item of cartItems) {
            const product = item.productId;
            if (product.stock < item.quantity) {
                outOfStockItems.push({ name: product.name, available: product.stock });
            }
        }
        if (outOfStockItems.length > 0) {
            return res.json({ success: false, outOfStockItems });
        }

        for (let item of cartItems) {
            const product = item.productId;
            product.stock -= item.quantity;
            await product.save();
        }

        await Cart.deleteMany({ userId });
        res.json({ success: true });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



router.get('/session-test', (req, res) => {
    res.json(req.session);
});


router.post('/cart/update', checkSessAuth, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.user.id;

    try {
        const cartItem = await Cart.findOne({ userId, productId });

        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        res.json({ success: true });
    } catch (err) {
        console.error('Error updating cart item:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.post('/cart/remove', checkSessAuth, async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.user.id;

    try {
        await Cart.deleteOne({ userId, productId });

        res.json({ success: true });
    } catch (err) {
        console.error('Error removing cart item:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});




module.exports = router;