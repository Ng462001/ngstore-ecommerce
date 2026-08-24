const mongoose = require('mongoose');

const returnExchangeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    type: {
        type: String,
        enum: ['Return', 'Exchange'],
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: String,
        quantity: { type: Number, required: true },
        price: Number,
        reason: { type: String, required: true },
        condition: {
            type: String,
            enum: ['Unopened', 'Opened', 'Damaged', 'Defective', 'Wrong Item'],
            required: true
        },
        images: [String] // URLs for proof per item
    }],
    images: [String], // General proof images for the request
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Pickup Scheduled', 'Picked Up', 'Received', 'Processing', 'Completed', 'Refunded', 'Cancelled'],
        default: 'Pending'
    },
    refundDetails: {
        amount: Number,
        method: { type: String, enum: ['Original Payment', 'Wallet', 'Bank Transfer'] },
        status: { type: String, enum: ['Pending', 'Processed', 'Failed'], default: 'Pending' },
        processedAt: Date
    },
    exchangeDetails: {
        newOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        status: { type: String, enum: ['Pending', 'To be Shipped', 'Shipped'], default: 'Pending' },
        requestedProduct: mongoose.Schema.Types.Mixed // Store product ID or details user requested
    },
    pickupAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        mobile: String
    },
    adminDetails: {
        processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String
    },
    statusUpdates: [{
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('ReturnExchange', returnExchangeSchema);
