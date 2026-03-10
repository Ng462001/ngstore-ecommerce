const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            selectedColor: { type: String },
            selectedSize: { type: String },
        }
    ],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        mobile: { type: String, required: true },
        landmark: { type: String }
    },
    billingAddress: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String }
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'Card',
        enum: ['Card', 'CashOnDelivery', 'UPI', 'NetBanking', 'Wallet']
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
        paymentMethod: { type: String }
    },

    // New Payment Fields
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    paymentDetails: {
        transactionId: String,
        paymentGateway: String,
        paymentDate: Date,
        refundId: String,
        refundDate: Date,
        refundAmount: Number
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0.0
    },
    subtotalPrice: {
        type: Number,
        default: 0.0
    },
    discountPrice: {
        type: Number,
        default: 0.0
    },
    couponCode: {
        type: String
    },

    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        required: true,
        default: false
    },

    // Status Timestamps
    confirmedAt: { type: Date },
    processingAt: { type: Date },
    shippedAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    returnedAt: { type: Date },
    refundedAt: { type: Date },

    // Status Management
    status: {
        type: String,
        enum: [
            'Pending',
            'Confirmed',
            'Processing',
            'Shipped',
            'Out for delivery',
            'Delivered',
            'Cancelled',
            'Returned',
            'Refunded'
        ],
        default: 'Pending'
    },

    // Shipping Information
    shippingCarrier: {
        type: String,
        default: 'Standard'
    },
    trackingNumber: {
        type: String
    },
    trackingUrl: {
        type: String
    },
    estimatedDelivery: {
        type: Date
    },
    actualDelivery: {
        type: Date
    },

    // Admin Management
    adminNotes: {
        type: String,
        default: ''
    },
    internalNotes: {
        type: String,
        default: ''
    },
    tags: [{
        type: String
    }],
    isPriority: {
        type: Boolean,
        default: false
    },
    isGift: {
        type: Boolean,
        default: false
    },
    giftMessage: {
        type: String
    },

    // Customer Communication
    customerNotes: {
        type: String
    },
    notifyCustomer: {
        type: Boolean,
        default: true
    },
    // Analytics
    source: {
        type: String,
        enum: ['web', 'mobile', 'api'],
        default: 'web'
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },

    // Risk Management
    fraudScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },

    // Financial Fields
    currency: {
        type: String,
        default: 'INR'
    },
    exchangeRate: {
        type: Number,
        default: 1
    },

    // Metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Fix the virtual fields with safe checks:
orderSchema.virtual('itemCount').get(function () {
    if (!this.orderItems || !Array.isArray(this.orderItems)) {
        return 0;
    }
    return this.orderItems.reduce((sum, item) => {
        const quantity = item.quantity || 0;
        return sum + quantity;
    }, 0);
});

orderSchema.virtual('daysSinceOrdered').get(function () {
    if (!this.createdAt) return 0;
    const diffTime = Math.abs(new Date() - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});


// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.mobile': 1 });
orderSchema.index({ trackingNumber: 1 });
orderSchema.index({ isPriority: 1, createdAt: -1 });
orderSchema.index({ tags: 1 });

// Pre-save middleware to calculate subtotal
orderSchema.pre('save', function (next) {
    if (this.orderItems && this.orderItems.length > 0) {
        this.subtotalPrice = this.orderItems.reduce(
            (total, item) => total + (item.price * item.quantity),
            0
        );

        // Calculate total if not already set
        if (this.totalPrice === 0) {
            this.totalPrice = this.subtotalPrice + this.taxPrice + this.shippingPrice - (this.discountPrice || 0);
        }
    }
    next();
});

// Methods
orderSchema.methods.canCancel = function () {
    const nonCancellableStatuses = ['Delivered', 'Shipped', 'Out for delivery'];
    return !nonCancellableStatuses.includes(this.status);
};

orderSchema.methods.canReturn = function () {
    if (this.status !== 'Delivered') return false;
    const deliveryDate = this.deliveredAt || this.updatedAt;
    const daysSinceDelivery = Math.floor((new Date() - deliveryDate) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 7; // 7-day return policy
};

orderSchema.methods.getStatusTimeline = function () {
    const timeline = [];

    if (this.confirmedAt) timeline.push({ status: 'Confirmed', date: this.confirmedAt });
    if (this.processingAt) timeline.push({ status: 'Processing', date: this.processingAt });
    if (this.shippedAt) timeline.push({ status: 'Shipped', date: this.shippedAt });
    if (this.outForDeliveryAt) timeline.push({ status: 'Out for delivery', date: this.outForDeliveryAt });
    if (this.deliveredAt) timeline.push({ status: 'Delivered', date: this.deliveredAt });
    if (this.cancelledAt) timeline.push({ status: 'Cancelled', date: this.cancelledAt });
    if (this.returnedAt) timeline.push({ status: 'Returned', date: this.returnedAt });
    if (this.refundedAt) timeline.push({ status: 'Refunded', date: this.refundedAt });

    return timeline.sort((a, b) => a.date - b.date);
};

module.exports = mongoose.model('Order', orderSchema);