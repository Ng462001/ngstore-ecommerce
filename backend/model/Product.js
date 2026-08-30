const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    src: {
        type: String,
        required: [true, 'Image source is required'],
        validate: {
            validator: function (v) {
                return /^https?:\/\/.+\..+/.test(v) || v.startsWith('/');
            },
            message: 'Image source must be a valid URL or path'
        }
    },
    alt: {
        type: String,
        required: [true, 'Image alt text is required'],
        trim: true,
        minlength: [2, 'Alt text must be at least 2 characters long'],
        maxlength: [255, 'Alt text cannot exceed 255 characters']
    }
}, { _id: false });

const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Color name is required'],
        trim: true,
        minlength: [1, 'Color name must be at least 1 character long'],
        maxlength: [50, 'Color name cannot exceed 50 characters']
    },
    class: {
        type: String,
        required: [true, 'Color class is required'],
        trim: true,
        validate: {
            validator: function (v) {
                // Accept any valid Tailwind CSS bg class like bg-red-500, bg-black, bg-blue-900
                return /^bg-[a-zA-Z0-9_-]+$/.test(v);
            },
            message: 'Color class must be a valid Tailwind CSS background class (e.g. bg-red-500)'
        }
    }
}, { _id: false });

const sizeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Size name is required'],
        trim: true,
        uppercase: true,
        enum: {
            values: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
            message: 'Size name must be one of: XXS, XS, S, M, L, XL, 2XL, 3XL, 4XL'
        }
    },
    inStock: {
        type: Boolean,
        required: [true, 'Stock status is required'],
        default: true
    }
}, { _id: false });

// Review schema
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: [true, 'Reviewer name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: Number.isInteger,
            message: 'Rating must be an integer'
        }
    },
    comment: {
        type: String,
        required: [true, 'Review comment is required'],
        trim: true,
        minlength: [5, 'Comment must be at least 5 characters long'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

// Main Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters long'],
        maxlength: [255, 'Product name cannot exceed 255 characters'],
        index: true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
        max: [10000000, 'Price cannot exceed ₹1,00,00,000'],
        set: function (v) {
            return Math.round(v * 100) / 100; // Round to 2 decimal places
        }
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be an integer'
        }
    },
    images: {
        type: [imageSchema],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 10;
            },
            message: 'Product cannot have more than 10 images'
        }
    },
    colors: {
        type: [colorSchema],
        default: []
    },
    sizes: {
        type: [sizeSchema],
        default: []
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [10, 'Description must be at least 10 characters long'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    highlights: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 20 && v.every(item => item.length <= 255);
            },
            message: 'Highlights must have max 20 items, each under 255 characters'
        }
    },
    details: {
        type: String,
        required: false,
        maxlength: [2000, 'Details cannot exceed 2000 characters']
    },
    image: {
        type: String,
        required: [true, 'Main product image is required'],
        validate: {
            validator: function (v) {
                return /\.(jpg|jpeg|png|webp|gif)$/i.test(v) || v.startsWith('/uploads/') || v.startsWith('http');
            },
            message: 'Image must be a valid image file path or URL'
        }
    },
    short_description: {
        type: String,
        required: false,
        maxlength: [500, 'Short description cannot exceed 500 characters']
    },
    originalPrice: {
        type: Number,
        required: [true, 'Original price is required'],
        min: [0, 'Original price cannot be negative'],
        max: [10000000, 'Original price cannot exceed ₹1,00,00,000'],
        set: function (v) {
            return Math.round(v * 100) / 100; // Round to 2 decimal places
        }
    },
    discountedPrice: {
        type: Number,
        required: [true, 'Discounted price is required'],
        min: [0, 'Discounted price cannot be negative'],
        max: [10000000, 'Discounted price cannot exceed ₹1,00,00,000'],
        set: function (v) {
            return Math.round(v * 100) / 100; // Round to 2 decimal places
        }
    },
    discount: {
        type: Number,
        required: [true, 'Discount percentage is required'],
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
        validate: {
            validator: Number.isInteger,
            message: 'Discount must be an integer'
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['men', 'women', 'accessories', 'home', 'sports', 'electronic device', 'mobile', 'cloths'],
            message: 'Category must be one of: men, women, kids, clothing, accessories, electronics, home, sports, electronic device, mobile, cloths'
        },
        index: true
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [100, 'Brand name cannot exceed 100 characters']
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function (v) {
                return v.length <= 20;
            },
            message: 'Cannot have more than 20 tags'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'out_of_stock', 'discontinued'],
            message: 'Status must be one of: active, inactive, out_of_stock, discontinued'
        },
        default: 'active',
        index: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: [0, 'Rating cannot be negative'],
            max: [5, 'Rating cannot exceed 5']
        },
        count: {
            type: Number,
            default: 0,
            min: [0, 'Rating count cannot be negative']
        },
        breakdown: {
            1: { type: Number, default: 0 },
            2: { type: Number, default: 0 },
            3: { type: Number, default: 0 },
            4: { type: Number, default: 0 },
            5: { type: Number, default: 0 }
        }
    },
    reviews: {
        type: [reviewSchema],
        default: []
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual properties
productSchema.virtual('savingsAmount').get(function () {
    return (this.originalPrice - this.discountedPrice);
});

productSchema.virtual('savingsPercentage').get(function () {
    return Math.round(((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100);
});

productSchema.virtual('availableSizes').get(function () {
    return this.sizes.filter(size => size.inStock).map(size => size.name);
});

productSchema.virtual('availableColors').get(function () {
    return this.colors.map(color => color.name);
});

// Format virtuals for rupees
productSchema.virtual('formattedPrice').get(function () {
    return `₹${this.price?.toLocaleString('en-IN')}`;
});

productSchema.virtual('formattedOriginalPrice').get(function () {
    return `₹${this.originalPrice?.toLocaleString('en-IN')}`;
});

productSchema.virtual('formattedDiscountedPrice').get(function () {
    return `₹${this.discountedPrice?.toLocaleString('en-IN')}`;
});

productSchema.virtual('formattedSavings').get(function () {
    const savings = this.originalPrice - this.discountedPrice;
    return `₹${savings?.toLocaleString('en-IN')}`;
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', short_description: 'text' });
productSchema.index({ price: 1, discount: -1 });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ tags: 1 });

// Pre-save middleware
productSchema.pre('save', function (next) {
    // Auto-calculate discounted price if not provided but discount is given
    if (this.originalPrice && this.discount > 0 && !this.discountedPrice) {
        this.discountedPrice = this.originalPrice * (1 - this.discount / 100);
    }

    // Auto-calculate discount if not provided but prices are given
    if (this.originalPrice && this.discountedPrice && !this.discount) {
        this.discount = Math.round(((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100);
    }

    // Set main price to discounted price if available
    if (this.discountedPrice && this.discountedPrice > 0) {
        this.price = this.discountedPrice;
    } else if (this.originalPrice) {
        this.price = this.originalPrice;
    }

    // Update status based on quantity
    if (this.quantity === 0 && this.status === 'active') {
        this.status = 'out_of_stock';
    }

    next();
});

// Pre-validate middleware
productSchema.pre('validate', function (next) {
    // Ensure unique size names
    if (this.sizes && this.sizes.length > 0) {
        const sizeNames = this.sizes.map(size => size.name);
        if (new Set(sizeNames).size !== sizeNames.length) {
            return next(new Error('Duplicate size names are not allowed'));
        }
    }

    // Ensure unique color names
    if (this.colors && this.colors.length > 0) {
        const colorNames = this.colors.map(color => color.name);
        if (new Set(colorNames).size !== colorNames.length) {
            return next(new Error('Duplicate color names are not allowed'));
        }
    }

    // Validate discount consistency
    if (this.originalPrice && this.discountedPrice) {
        const calculatedDiscount = Math.round(((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100);

        if (this.discount && Math.abs(calculatedDiscount - this.discount) > 1) {
            return next(new Error(`Discount percentage mismatch. Calculated: ${calculatedDiscount}%, Provided: ${this.discount}%`));
        }
    }

    next();
});

// Instance methods
productSchema.methods.updateRating = function (newRating) {
    if (newRating < 1 || newRating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    this.rating.breakdown[newRating]++;
    this.rating.count++;

    const total = Object.entries(this.rating.breakdown).reduce((sum, [rating, count]) => {
        return sum + (parseInt(rating) * count);
    }, 0);

    this.rating.average = total / this.rating.count;

    return this.save();
};

productSchema.methods.isSizeAvailable = function (sizeName) {
    const size = this.sizes.find(s => s.name === sizeName.toUpperCase());
    return size ? size.inStock && this.inStock : false;
};

productSchema.methods.updateInventory = function (quantityChange) {
    this.quantity += quantityChange;

    if (this.quantity < 0) {
        throw new Error('Insufficient inventory');
    }

    // Update status based on new quantity
    if (this.quantity === 0) {
        this.status = 'out_of_stock';
    } else if (this.status === 'out_of_stock') {
        this.status = 'active';
    }

    return this.save();
};

// Static methods
productSchema.statics.findByDiscountRange = function (min, max) {
    if (min < 0 || max > 100 || min > max) {
        throw new Error('Invalid discount range');
    }

    return this.find({
        discount: { $gte: min, $lte: max },
        status: 'active'
    });
};

productSchema.statics.findByCategory = function (category) {
    return this.find({
        category: new RegExp(category, 'i'),
        status: 'active'
    });
};

productSchema.statics.searchProducts = function (query, filters = {}) {
    const searchCriteria = {
        status: 'active'
    };

    if (query) {
        searchCriteria.$text = { $search: query };
    }

    if (filters.category) {
        searchCriteria.category = new RegExp(filters.category, 'i');
    }

    if (filters.minPrice || filters.maxPrice) {
        searchCriteria.price = {};
        if (filters.minPrice) searchCriteria.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) searchCriteria.price.$lte = parseFloat(filters.maxPrice);
    }

    if (filters.inStock) {
        searchCriteria.quantity = { $gt: 0 };
    }

    if (filters.size) {
        searchCriteria['sizes.name'] = filters.size.toUpperCase();
        searchCriteria['sizes.inStock'] = true;
    }

    if (filters.color) {
        searchCriteria['colors.name'] = new RegExp(filters.color, 'i');
    }

    if (filters.tags && filters.tags.length > 0) {
        searchCriteria.tags = { $in: filters.tags.map(tag => tag.toLowerCase()) };
    }

    return this.find(searchCriteria);
};

// Query helpers
productSchema.query.active = function () {
    return this.where({ status: 'active' });
};

productSchema.query.inStock = function () {
    return this.where({ quantity: { $gt: 0 } });
};

productSchema.query.byCategory = function (category) {
    return this.where({ category: new RegExp(category, 'i') });
};

const Product = mongoose.model('Product', productSchema);

module.exports = Product;