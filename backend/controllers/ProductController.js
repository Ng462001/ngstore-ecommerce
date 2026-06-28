const Product = require("../model/Product");
const mongoose = require("mongoose");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinaryService");

class ProductController {
    // Get all products with filtering, pagination, and sorting
    static async getAllProducts(req, res) {
        try {
            const {
                page = 1,
                limit = 10,
                sort = 'createdAt',
                order = 'desc',
                search,
                category,
                minPrice,
                maxPrice,
                inStock,
                discount,
                size,
                color,
                tags,
                status = 'active'
            } = req.query;

            // Build filter object
            const filter = {};

            // Status filter - allow multiple statuses
            if (status) {
                if (status === 'all') {
                    // No status filter
                } else if (status.includes(',')) {
                    filter.status = { $in: status.split(',') };
                } else {
                    filter.status = status;
                }
            } else {
                filter.status = 'active'; // Default to active
            }

            // Search filter
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                    { short_description: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } }
                ];
            }

            // Category filter
            if (category) {
                filter.category = { $regex: category, $options: 'i' };
            }

            // Price range filter (in rupees)
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = parseFloat(minPrice);
                if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
            }

            // Stock filter
            if (inStock === 'true') {
                filter.quantity = { $gt: 0 };
            }

            // Discount filter
            if (discount) {
                filter.discount = { $gte: parseInt(discount) };
            }

            // Size filter
            if (size) {
                filter['sizes.name'] = size.toUpperCase();
                filter['sizes.inStock'] = true;
            }

            // Color filter
            if (color) {
                filter['colors.name'] = { $regex: color, $options: 'i' };
            }

            // Tags filter
            if (tags) {
                const tagArray = Array.isArray(tags) ? tags : tags.split(',');
                filter.tags = { $in: tagArray.map(tag => tag.toLowerCase().trim()) };
            }

            // Sort configuration
            const sortConfig = {};
            sortConfig[sort] = order === 'desc' ? -1 : 1;

            // Execute query with pagination
            const products = await Product.find(filter)
                .sort(sortConfig)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .select('-__v');

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
                    hasPrev: page > 1
                }
            });

        } catch (error) {
            console.error('Get all products error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get product by ID
    static async getProductById(req, res) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            const product = await Product.findById(id).select('-__v');

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.json({
                success: true,
                data: product
            });

        } catch (error) {
            console.error('Get product by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch product',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Create new product
    static async createProduct(req, res) {
        try {
            const productData = req.body;

            // Handle uploaded files
            if (req.files) {
                if (req.files.image && req.files.image.length > 0) {
                    const uploadResult = await uploadToCloudinary(req.files.image[0].path, 'products');
                    productData.image = uploadResult.secure_url;
                }

                // Initialize images array if it doesn't exist
                if (!productData.images) {
                    productData.images = [];
                } else if (typeof productData.images === 'string') {
                    try {
                        productData.images = JSON.parse(productData.images);
                    } catch (e) {
                        productData.images = [];
                    }
                }

                if (req.files.images && req.files.images.length > 0) {
                    const uploadPromises = req.files.images.map(file => uploadToCloudinary(file.path, 'products'));
                    const uploadResults = await Promise.all(uploadPromises);
                    const newImages = uploadResults.map((result, index) => ({
                        src: result.secure_url,
                        alt: req.files.images[index].originalname
                    }));
                    productData.images = [...productData.images, ...newImages];
                }

                // If no additional images were provided but we have a main image,
                // auto-add the main image to the images array for consistency
                if (productData.images.length === 0 && productData.image) {
                    productData.images = [{ src: productData.image, alt: productData.name || 'Product image' }];
                }
            }

            // Parse JSON fields if they come as strings
            const jsonFields = ['colors', 'sizes', 'highlights', 'tags'];
            jsonFields.forEach(field => {
                if (typeof productData[field] === 'string') {
                    try {
                        productData[field] = JSON.parse(productData[field]);
                    } catch (e) {
                        productData[field] = [];
                    }
                }
            });

            // Convert price fields to numbers
            const priceFields = ['price', 'originalPrice', 'discountedPrice'];
            priceFields.forEach(field => {
                if (productData[field]) {
                    productData[field] = parseFloat(productData[field]);
                }
            });

            // Convert numeric fields
            const numericFields = ['quantity', 'discount'];
            numericFields.forEach(field => {
                if (productData[field] !== undefined && productData[field] !== '') {
                    productData[field] = parseFloat(productData[field]);
                }
            });

            // Validate required fields
            const requiredFields = ['name', 'description', 'category'];
            const missingFields = requiredFields.filter(field => !productData[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            const product = new Product(productData);
            await product.validate(); // Trigger mongoose validation

            const savedProduct = await product.save();

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: savedProduct
            });

        } catch (error) {
            console.error('Create product error:', error);

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create product',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update product
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            // Check if product exists
            const existingProduct = await Product.findById(id);
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Parse JSON fields if they come as strings
            const jsonFields = ['images', 'colors', 'sizes', 'highlights', 'tags'];
            jsonFields.forEach(field => {
                if (typeof updateData[field] === 'string') {
                    try {
                        updateData[field] = JSON.parse(updateData[field]);
                    } catch (e) {
                        // If parsing fails, don't update this field
                        delete updateData[field];
                    }
                }
            });

            // Convert price fields to numbers
            const priceFields = ['price', 'originalPrice', 'discountedPrice'];
            priceFields.forEach(field => {
                if (updateData[field]) {
                    updateData[field] = parseFloat(updateData[field]);
                }
            });

            // Convert numeric fields
            const numericFields = ['quantity', 'discount'];
            numericFields.forEach(field => {
                if (updateData[field] !== undefined && updateData[field] !== '') {
                    updateData[field] = parseFloat(updateData[field]);
                }
            });

            // Handle uploaded files
            if (req.files) {
                // Only update main image if a new one is uploaded
                if (req.files.image && req.files.image.length > 0) {
                    const uploadResult = await uploadToCloudinary(req.files.image[0].path, 'products');
                    updateData.image = uploadResult.secure_url;
                }

                // Only update additional images if new ones are uploaded
                if (req.files.images && req.files.images.length > 0) {
                    const uploadPromises = req.files.images.map(file => uploadToCloudinary(file.path, 'products'));
                    const uploadResults = await Promise.all(uploadPromises);
                    const newImages = uploadResults.map((result, index) => ({
                        src: result.secure_url,
                        alt: req.files.images[index].originalname
                    }));

                    // If updateData.images exists (from parsed JSON), append to it.
                    // Otherwise use existing product images + new images
                    const currentImages = updateData.images || existingProduct.images || [];
                    updateData.images = [...currentImages, ...newImages];
                }
            }

            // Handle existingImages sent from the frontend during edit
            if (updateData.existingImages) {
                try {
                    const existingImgs = typeof updateData.existingImages === 'string'
                        ? JSON.parse(updateData.existingImages)
                        : updateData.existingImages;
                    // Only use existingImages if no new images were set
                    if (!updateData.images || updateData.images.length === 0) {
                        updateData.images = existingImgs;
                    }
                } catch (e) { /* ignore parse errors */ }
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
            const restrictedFields = ['_id', 'createdAt', 'updatedAt'];
            restrictedFields.forEach(field => delete updateData[field]);

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                { $set: updateData },
                {
                    new: true,
                    runValidators: true,
                    context: 'query'
                }
            ).select('-__v');

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: updatedProduct
            });

        } catch (error) {
            console.error('Update product error:', error);

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update product',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Delete product (soft delete by updating status)
    static async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Soft delete by updating status (actually permanent delete)
            const deletedProduct = await Product.findByIdAndDelete(id);

            if (deletedProduct) {
                // Delete main image from Cloudinary
                if (deletedProduct.image) {
                    deleteFromCloudinary(deletedProduct.image).catch(err => 
                        console.error('[CLOUDINARY] Failed to delete main image:', err)
                    );
                }
                // Delete additional images from Cloudinary
                if (deletedProduct.images && deletedProduct.images.length > 0) {
                    deletedProduct.images.forEach(img => {
                        if (img.src) {
                            deleteFromCloudinary(img.src).catch(err => 
                                console.error('[CLOUDINARY] Failed to delete additional image:', err)
                            );
                        }
                    });
                }
            }

            res.json({
                success: true,
                message: 'Product deleted successfully',
                data: deletedProduct
            });

        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete product',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Hard delete product (completely remove from database)
    static async hardDeleteProduct(req, res) {
        try {
            const { id } = req.params;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            const product = await Product.findByIdAndDelete(id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Delete main image from Cloudinary
            if (product.image) {
                deleteFromCloudinary(product.image).catch(err => 
                    console.error('[CLOUDINARY] Failed to delete main image during hard delete:', err)
                );
            }
            // Delete additional images from Cloudinary
            if (product.images && product.images.length > 0) {
                product.images.forEach(img => {
                    if (img.src) {
                        deleteFromCloudinary(img.src).catch(err => 
                            console.error('[CLOUDINARY] Failed to delete additional image during hard delete:', err)
                        );
                    }
                });
            }

            res.json({
                success: true,
                message: 'Product permanently deleted',
                data: product
            });

        } catch (error) {
            console.error('Hard delete product error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete product',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get products by category
    static async getProductsByCategory(req, res) {
        try {
            const { category } = req.params;
            const { page = 1, limit = 12, sort = 'createdAt', order = 'desc' } = req.query;

            const sortConfig = {};
            sortConfig[sort] = order === 'desc' ? -1 : 1;

            const products = await Product.find({
                category: { $regex: category, $options: 'i' },
                status: 'active'
            })
                .sort(sortConfig)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .select('-__v');

            const total = await Product.countDocuments({
                category: { $regex: category, $options: 'i' },
                status: 'active'
            });

            res.json({
                success: true,
                data: products,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            });

        } catch (error) {
            console.error('Get products by category error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch products by category',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Update product inventory
    static async updateInventory(req, res) {
        try {
            const { id } = req.params;
            const { quantityChange, operation = 'add' } = req.body; // operation: 'add' or 'subtract'

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            const change = operation === 'subtract' ? -quantityChange : quantityChange;
            await product.updateInventory(change);

            const updatedProduct = await Product.findById(id).select('-__v');

            res.json({
                success: true,
                message: 'Inventory updated successfully',
                data: updatedProduct
            });

        } catch (error) {
            console.error('Update inventory error:', error);
            res.status(400).json({
                success: false,
                message: 'Failed to update inventory',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Add product rating and review
    static async addRating(req, res) {
        try {
            const { id } = req.params;
            const { rating, comment, name, userId } = req.body;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid product ID format'
                });
            }

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Add review to reviews array
            const review = {
                name: name || 'Anonymous',
                rating: Number(rating),
                comment: comment || '',
                date: new Date()
            };

            if (userId) {
                review.user = userId;
            }

            product.reviews.push(review);

            // Update aggregate rating
            await product.updateRating(Number(rating));

            const updatedProduct = await Product.findById(id).select('-__v');

            res.json({
                success: true,
                message: 'Review added successfully',
                data: updatedProduct
            });

        } catch (error) {
            console.error('Add rating error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add rating',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Get products with high discounts
    static async getDiscountedProducts(req, res) {
        try {
            const { minDiscount = 20, limit = 10 } = req.query;

            const discountedProducts = await Product.find({
                discount: { $gte: parseInt(minDiscount) },
                status: 'active',
                quantity: { $gt: 0 }
            })
                .sort({ discount: -1 })
                .limit(parseInt(limit))
                .select('-__v');

            res.json({
                success: true,
                data: discountedProducts
            });

        } catch (error) {
            console.error('Get discounted products error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch discounted products',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }
}

module.exports = ProductController;