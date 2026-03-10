const mongoose = require('mongoose');

const supportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    files: [{
        type: String // URL to uploaded file
    }],
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    category: {
        type: String,
        enum: ['Order Issue', 'Payment', 'Product Inquiry', 'Technical', 'Other'],
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    responses: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Could be the user or an admin user
        },
        senderRole: {
            type: String,
            enum: ['User', 'Admin'],
            required: true
        },
        message: { type: String, required: true },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Support', supportSchema);
