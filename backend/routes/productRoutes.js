const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const upload = require("../middleware/uploadMiddleware");

// Collection routes
router.get("/", ProductController.getAllProducts);
router.post("/", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), ProductController.createProduct);

// Featured and special collections
router.get("/discounted", ProductController.getDiscountedProducts);
router.get("/category/:category", ProductController.getProductsByCategory);

// Inventory management
router.patch("/:id/inventory", ProductController.updateInventory);

// Rating management
router.patch("/:id/rating", ProductController.addRating);

// Instance routes
router.get("/:id", ProductController.getProductById);
router.put("/:id", upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 10 }
]), ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
router.delete("/:id/hard", ProductController.hardDeleteProduct);

module.exports = router;