const Product = require("../model/Product");
const mongoose = require("mongoose");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../services/cloudinaryService");
const { parseSmartSearchQuery } = require("../services/aiService");

class ProductController {
  static getAllProducts = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "createdAt",
        order = "desc",
        search,
        category,
        minPrice,
        maxPrice,
        inStock,
        discount,
        size,
        color,
        tags,
        status = "active",
      } = req.query;

      // Build filter object
      const filter = {};

      // Status filter - allow multiple statuses
      if (status) {
        if (status === "all") {
          // No status filter
        } else if (status.includes(",")) {
          filter.status = { $in: status.split(",") };
        } else {
          filter.status = status;
        }
      } else {
        filter.status = "active"; // Default to active
      }

      // Search filter
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { short_description: { $regex: search, $options: "i" } },
          { tags: { $in: [new RegExp(search, "i")] } },
        ];
      }

      // Category filter
      if (category) {
        if (category.includes(",")) {
          filter.category = {
            $in: category.split(",").map((cat) => cat.trim().toLowerCase()),
          };
        } else {
          filter.category = { $regex: `^${category.trim()}$`, $options: "i" };
        }
      }

      // Price range filter (in rupees)
      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      // Stock filter
      if (inStock === "true") {
        filter.quantity = { $gt: 0 };
      }

      // Discount filter
      if (discount) {
        filter.discount = { $gte: parseInt(discount) };
      }

      // Size filter
      if (size) {
        if (size.includes(",")) {
          filter.sizes = {
            $elemMatch: {
              name: { $in: size.split(",").map((s) => s.trim().toUpperCase()) },
              inStock: true,
            },
          };
        } else {
          filter.sizes = {
            $elemMatch: {
              name: size.trim().toUpperCase(),
              inStock: true,
            },
          };
        }
      }

      // Color filter
      if (color) {
        if (color.includes(",")) {
          filter["colors.name"] = {
            $in: color
              .split(",")
              .map((col) => new RegExp(`^${col.trim()}$`, "i")),
          };
        } else {
          filter["colors.name"] = {
            $regex: `^${color.trim()}$`,
            $options: "i",
          };
        }
      }

      // Tags filter
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : tags.split(",");
        filter.tags = { $in: tagArray.map((tag) => tag.toLowerCase().trim()) };
      }

      // Sort configuration
      const sortConfig = {};
      sortConfig[sort] = order === "desc" ? -1 : 1;

      // Execute query with pagination
      const products = await Product.find(filter)
        .sort(sortConfig)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select("-__v");

      // Get total count for pagination
      const total = await Product.countDocuments(filter);

      res.json({
        success: true,
        data: products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      console.error("Get all products error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Get product by ID
  static getProductById = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      const product = await Product.findById(id).select("-__v");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Get product by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Create new product
  static createProduct = async (req, res) => {
    try {
      const productData = req.body;

      // Handle uploaded files
      if (req.files) {
        if (req.files.image && req.files.image.length > 0) {
          const uploadResult = await uploadToCloudinary(
            req.files.image[0].path,
            "products",
          );
          productData.image = uploadResult.secure_url;
        }

        // Initialize images array if it doesn't exist
        if (!productData.images) {
          productData.images = [];
        } else if (typeof productData.images === "string") {
          try {
            productData.images = JSON.parse(productData.images);
          } catch (e) {
            productData.images = [];
          }
        }

        if (req.files.images && req.files.images.length > 0) {
          const uploadPromises = req.files.images.map((file) =>
            uploadToCloudinary(file.path, "products"),
          );
          const uploadResults = await Promise.all(uploadPromises);
          const newImages = uploadResults.map((result, index) => ({
            src: result.secure_url,
            alt: req.files.images[index].originalname,
          }));
          productData.images = [...productData.images, ...newImages];
        }

        // If no additional images were provided but we have a main image,
        // auto-add the main image to the images array for consistency
        if (productData.images.length === 0 && productData.image) {
          productData.images = [
            {
              src: productData.image,
              alt: productData.name || "Product image",
            },
          ];
        }
      }

      // Parse JSON fields if they come as strings
      const jsonFields = ["colors", "sizes", "highlights", "tags"];
      jsonFields.forEach((field) => {
        if (typeof productData[field] === "string") {
          try {
            productData[field] = JSON.parse(productData[field]);
          } catch (e) {
            productData[field] = [];
          }
        }
      });

      // Convert price fields to numbers
      const priceFields = ["price", "originalPrice", "discountedPrice"];
      priceFields.forEach((field) => {
        if (productData[field]) {
          productData[field] = parseFloat(productData[field]);
        }
      });

      // Convert numeric fields
      const numericFields = ["quantity", "discount"];
      numericFields.forEach((field) => {
        if (productData[field] !== undefined && productData[field] !== "") {
          productData[field] = parseFloat(productData[field]);
        }
      });

      // Validate required fields
      const requiredFields = ["name", "description", "category"];
      const missingFields = requiredFields.filter(
        (field) => !productData[field],
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const product = new Product(productData);
      await product.validate(); // Trigger mongoose validation

      const savedProduct = await product.save();

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: savedProduct,
      });
    } catch (error) {
      console.error("Create product error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create product",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Update product
  static updateProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      // Check if product exists
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Parse JSON fields if they come as strings
      const jsonFields = ["images", "colors", "sizes", "highlights", "tags"];
      jsonFields.forEach((field) => {
        if (typeof updateData[field] === "string") {
          try {
            updateData[field] = JSON.parse(updateData[field]);
          } catch (e) {
            // If parsing fails, don't update this field
            delete updateData[field];
          }
        }
      });

      // Convert price fields to numbers
      const priceFields = ["price", "originalPrice", "discountedPrice"];
      priceFields.forEach((field) => {
        if (updateData[field]) {
          updateData[field] = parseFloat(updateData[field]);
        }
      });

      // Convert numeric fields
      const numericFields = ["quantity", "discount"];
      numericFields.forEach((field) => {
        if (updateData[field] !== undefined && updateData[field] !== "") {
          updateData[field] = parseFloat(updateData[field]);
        }
      });

      // Handle uploaded files
      if (req.files) {
        // Only update main image if a new one is uploaded
        if (req.files.image && req.files.image.length > 0) {
          const uploadResult = await uploadToCloudinary(
            req.files.image[0].path,
            "products",
          );
          updateData.image = uploadResult.secure_url;
        }

        // Only update additional images if new ones are uploaded
        if (req.files.images && req.files.images.length > 0) {
          const uploadPromises = req.files.images.map((file) =>
            uploadToCloudinary(file.path, "products"),
          );
          const uploadResults = await Promise.all(uploadPromises);
          const newImages = uploadResults.map((result, index) => ({
            src: result.secure_url,
            alt: req.files.images[index].originalname,
          }));

          // If updateData.images exists (from parsed JSON), append to it.
          // Otherwise use existing product images + new images
          const currentImages =
            updateData.images || existingProduct.images || [];
          updateData.images = [...currentImages, ...newImages];
        }
      }

      // Handle existingImages sent from the frontend during edit
      if (updateData.existingImages) {
        try {
          const existingImgs =
            typeof updateData.existingImages === "string"
              ? JSON.parse(updateData.existingImages)
              : updateData.existingImages;
          // Only use existingImages if no new images were set
          if (!updateData.images || updateData.images.length === 0) {
            updateData.images = existingImgs;
          }
        } catch (e) {
          /* ignore parse errors */
        }
        delete updateData.existingImages;
      }

      // Ensure images field is never empty (preserve existing if not provided)
      if (!updateData.images || updateData.images.length === 0) {
        delete updateData.images; // Don't update images field, keep existing
      }

      // Ensure main image is preserved if not provided
      if (!updateData.image) {
        delete updateData.image; // Don't update image field, keep existing
      }

      // Prevent updating certain fields
      const restrictedFields = ["_id", "createdAt", "updatedAt"];
      restrictedFields.forEach((field) => delete updateData[field]);

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { $set: updateData },
        {
          new: true,
          runValidators: true,
          context: "query",
        },
      ).select("-__v");

      res.json({
        success: true,
        message: "Product updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Update product error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Delete product (soft delete by updating status)
  static deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Soft delete by updating status (actually permanent delete)
      const deletedProduct = await Product.findByIdAndDelete(id);

      if (deletedProduct) {
        // Delete main image from Cloudinary
        if (deletedProduct.image) {
          deleteFromCloudinary(deletedProduct.image).catch((err) =>
            console.error("[CLOUDINARY] Failed to delete main image:", err),
          );
        }
        // Delete additional images from Cloudinary
        if (deletedProduct.images && deletedProduct.images.length > 0) {
          deletedProduct.images.forEach((img) => {
            if (img.src) {
              deleteFromCloudinary(img.src).catch((err) =>
                console.error(
                  "[CLOUDINARY] Failed to delete additional image:",
                  err,
                ),
              );
            }
          });
        }
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
        data: deletedProduct,
      });
    } catch (error) {
      console.error("Delete product error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Add product rating and review
  static addRating = async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment, name, userId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Check if user already submitted a review by user ID
      const currentUserId = userId || req.user?._id;
      if (currentUserId) {
        const alreadyReviewed = product.reviews.some((r) => {
          if (!r.user) return false;
          const rUserId =
            typeof r.user === "object" && r.user._id
              ? r.user._id.toString()
              : r.user.toString();
          return rUserId === currentUserId.toString();
        });
        if (alreadyReviewed) {
          return res.status(400).json({
            success: false,
            message: "You have already reviewed this product",
          });
        }
      }

      // Add review to reviews array
      const review = {
        name: name || "Anonymous",
        rating: Number(rating),
        comment: comment || "",
        date: new Date(),
      };

      if (currentUserId) {
        review.user = currentUserId;
      }

      product.reviews.push(review);

      // Update aggregate rating
      await product.updateRating();

      const updatedProduct = await Product.findById(id).select("-__v");

      res.json({
        success: true,
        message: "Review added successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Add rating error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add rating",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Update product rating and review
  static updateReview = async (req, res) => {
    try {
      const { id, reviewId } = req.params;
      const { rating, comment, name } = req.body;

      if (
        !mongoose.Types.ObjectId.isValid(id) ||
        !mongoose.Types.ObjectId.isValid(reviewId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product or review ID format",
        });
      }

      if (rating && (Number(rating) < 1 || Number(rating) > 5)) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const review = product.reviews.id(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Verify review ownership by userId (admins are fully exempt)
      const isAdmin =
        req.user?.role === "admin" ||
        req.body.role === "admin" ||
        req.body.isAdmin === true;
      const currentUserId = req.body.userId || req.user?._id;
      if (!isAdmin && currentUserId && review.user) {
        const reviewUserId =
          typeof review.user === "object" && review.user._id
            ? review.user._id.toString()
            : review.user.toString();
        if (reviewUserId !== currentUserId.toString()) {
          return res.status(403).json({
            success: false,
            message: "Not authorized to edit this review",
          });
        }
      }

      const oldRating = review.rating;
      const newRating = rating !== undefined ? Number(rating) : oldRating;

      if (name) review.name = name;
      if (comment !== undefined) review.comment = comment;
      review.rating = newRating;
      review.date = new Date();

      // Recalculate product rating using instance method
      await product.updateRating();
      const updatedProduct = await Product.findById(id).select("-__v");

      res.json({
        success: true,
        message: "Review updated successfully",
        data: updatedProduct,
      });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update review",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // AI Smart Search
  static smartSearch = async (req, res) => {
    try {
      const { q, query, page = 1, limit = 12 } = req.query;
      const searchPrompt = q || query || "";

      if (!searchPrompt.trim()) {
        return res.status(400).json({
          success: false,
          message: "Search query string is required",
        });
      }

      // Get distinct categories and colors from DB for context
      const dbCategories = await Product.distinct("category", {
        status: "active",
      });
      const dbColors = await Product.distinct("colors.name", {
        status: "active",
      });

      // Call AI Service
      const aiParsed = await parseSmartSearchQuery(
        searchPrompt,
        dbCategories,
        dbColors,
      );

      // Construct MongoDB filter based on AI parsed results
      const filter = { status: "active" };

      // Category filter
      if (aiParsed.category) {
        filter.category = {
          $regex: `^${aiParsed.category.trim()}$`,
          $options: "i",
        };
      }

      // Color filter
      if (aiParsed.color) {
        filter["colors.name"] = {
          $regex: `^${aiParsed.color.trim()}$`,
          $options: "i",
        };
      }

      // Price filter
      if (aiParsed.minPrice !== null || aiParsed.maxPrice !== null) {
        filter.price = {};
        if (aiParsed.minPrice !== null) filter.price.$gte = aiParsed.minPrice;
        if (aiParsed.maxPrice !== null) filter.price.$lte = aiParsed.maxPrice;
      }

      // Keyword / text search filter
      if (aiParsed.keywords && aiParsed.keywords.trim()) {
        const cleanKw = aiParsed.keywords.trim();
        filter.$or = [
          { name: { $regex: cleanKw, $options: "i" } },
          { description: { $regex: cleanKw, $options: "i" } },
          { short_description: { $regex: cleanKw, $options: "i" } },
          { tags: { $in: [new RegExp(cleanKw, "i")] } },
        ];
      }

      // Sort configuration
      const sortConfig = {};
      if (aiParsed.sort) {
        sortConfig[aiParsed.sort] = aiParsed.order === "asc" ? 1 : -1;
      } else {
        sortConfig.createdAt = -1;
      }

      let products = await Product.find(filter)
        .sort(sortConfig)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select("-__v");

      // Fallback strategy: If 0 results found with strict filter, broaden search
      let fallbackUsed = false;
      if (products.length === 0) {
        fallbackUsed = true;
        const relaxedFilter = { status: "active" };
        if (searchPrompt.trim()) {
          const terms = searchPrompt
            .trim()
            .split(/\s+/)
            .filter((t) => t.length > 2);
          if (terms.length > 0) {
            relaxedFilter.$or = terms.map((term) => ({
              name: { $regex: term, $options: "i" },
            }));
          }
        }
        products = await Product.find(relaxedFilter)
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .select("-__v");
      }

      const total = products.length;

      res.json({
        success: true,
        data: products,
        aiMetadata: {
          ...aiParsed,
          fallbackUsed,
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit) || 1,
          total,
          hasNext: false,
          hasPrev: false,
        },
      });
    } catch (error) {
      console.error("Smart Search error:", error);
      res.status(500).json({
        success: false,
        message: "Smart search failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };

  // Get related/similar products for product details page
  static getRelatedProducts = async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = 10 } = req.query;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID format",
        });
      }

      const currentProduct = await Product.findById(id);
      if (!currentProduct) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const maxLimit = Math.min(parseInt(limit) || 10, 20);

      // 1. Primary Criteria: Matching category or tags, excluding current product
      const filterConditions = [];
      if (currentProduct.category) {
        filterConditions.push({
          category: {
            $regex: `^${currentProduct.category.trim()}$`,
            $options: "i",
          },
        });
      }
      if (
        currentProduct.tags &&
        Array.isArray(currentProduct.tags) &&
        currentProduct.tags.length > 0
      ) {
        filterConditions.push({ tags: { $in: currentProduct.tags } });
      }

      const primaryFilter = {
        _id: { $ne: currentProduct._id },
        status: "active",
      };

      if (filterConditions.length > 0) {
        primaryFilter.$or = filterConditions;
      }

      let relatedProducts = await Product.find(primaryFilter)
        .sort({ "rating.average": -1, createdAt: -1 })
        .limit(maxLimit)
        .select("-__v");

      // 2. Backfill with top-rated/active products if we have fewer than maxLimit
      if (relatedProducts.length < maxLimit) {
        const needed = maxLimit - relatedProducts.length;
        const excludeIds = [
          currentProduct._id,
          ...relatedProducts.map((p) => p._id),
        ];

        const backfill = await Product.find({
          _id: { $nin: excludeIds },
          status: "active",
        })
          .sort({ "rating.average": -1, createdAt: -1 })
          .limit(needed)
          .select("-__v");

        relatedProducts = [...relatedProducts, ...backfill];
      }

      res.json({
        success: true,
        count: relatedProducts.length,
        data: relatedProducts,
      });
    } catch (error) {
      console.error("Error fetching related products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch related products",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };
}

module.exports = ProductController;
